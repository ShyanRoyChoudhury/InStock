import strawberry
from strawberry.asgi import GraphQL
import requests
import json
from shopifyClient import shopify_client
from fastapi import FastAPI, HTTPException
from typing import Optional 
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

# Define a simple GraphQL schema
@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, GraphQL!"

# Create a FastAPI app and integrate GraphQL
schema = strawberry.Schema(Query)
graphql_app = GraphQL(schema)

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_route("/graphql", graphql_app)
app.add_websocket_route("/graphql", graphql_app)


token = os.getenv("TOKEN")

@app.get("/products")
def get_products():
    product = """
{
    products(first:10) {
    edges {
      node {
        totalInventory
        id
        title
        description
        featuredImage {
          url
        }
        priceRange {
          maxVariantPrice {
            amount
        }
        }
      }
    }
  }
}
    """
    client = shopify_client()
    data = json.loads(client.execute(product))
    print("data", data)
    cleaned_data = data['data']['products']['edges']
    return JSONResponse({
        "status": "Success",
        "data": cleaned_data
    })
# Run the server with: uvicorn server:app --reload

class Product(BaseModel):
    title: str
    totalInventory: int  
    description: Optional[str] = None
    amount: float



@app.post("/add-product")
async def add_product(product: Product):

    # Query to get the first location ID
    location_query = """
    query {
        locations(first: 1) {
            edges {
                node {
                    id
                }
            }
        }
    }
    """
    
    client = shopify_client()
    
    try:
        # Get the location ID
        location_result = client.execute(location_query)
        location_data = json.loads(location_result)
        location_id = location_data['data']['locations']['edges'][0]['node']['id']

        print("Debug - Location Data:", location_data)
        print("Debug - Location ID:", location_id)

        # Step 1: Create Product (Without Variants)
        product_mutation = """
        mutation productCreate($input: ProductInput!) {
            productCreate(input: $input) {
                product {
                    id
                    title
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """

        product_variables = {
            "input": {
                "title": product.title,
                "descriptionHtml": product.description or ""
            }
        }

        product_result = client.execute(product_mutation, variables=product_variables)
        product_data = json.loads(product_result) if isinstance(product_result, str) else product_result
        print("product data", product_data)
        if "errors" in product_data:
            print("Debug - Product Creation Errors:", json.dumps(product_data["errors"], indent=2))
            raise HTTPException(status_code=400, detail=product_data["errors"])
        print("product id", product_data)
        product_id = product_data['data']['productCreate']['product']['id']
        print("product_id", product_id)
        if not product_id:
            raise HTTPException(status_code=400, detail="Failed to create product")

        # Step 2: Create Variant for Product
        variant_mutation = """
        mutation productVariantCreate($input: ProductVariantInput!) {
            productVariantCreate(input: $input) {
                productVariant {
                    id
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """

        variant_variables = {
            "input": {
                "productId": product_id,
                "price": str(product.amount),
            }
        }

        variant_result = client.execute(variant_mutation, variables=variant_variables)
        variant_data = json.loads(variant_result) if isinstance(variant_result, str) else variant_result
        variant_id = variant_data.get("data", {}).get("productVariantCreate", {}).get("productVariant", {}).get("id")

        print("Debug - Created Variant ID:", variant_id)

        if not variant_id:
            raise HTTPException(status_code=400, detail="Failed to create product variant")

        # Step 3: Adjust Inventory
        inventory_mutation = """
        mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
            inventoryAdjustQuantity(input: $input) {
                inventoryLevel {
                    id
                    available
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """

        inventory_variables = {
            "input": {
                "inventoryLevelId": location_id,
                "availableDelta": product.totalInventory
            }
        }

        inventory_result = client.execute(inventory_mutation, variables=inventory_variables)
        inventory_data = json.loads(inventory_result) if isinstance(inventory_result, str) else inventory_result

        print("Debug - Inventory Update Result:", inventory_data)

        return {
            "message": "Product created successfully",
            "product_id": product_id,
            "variant_id": variant_id
        }

    except Exception as e:
        print("Debug - Exception:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    

class DeleteProduct(BaseModel):
    id: str

@app.post("/delete-product")
async def delete_product(product: DeleteProduct):

    mutation = f"""
    mutation {{
        productDelete(input: {{id: "{product.id}"}}) {{
            deletedProductId
            userErrors {{
            field
            message
            }}
        }}
    }}
    """


    client = shopify_client()
    data = json.loads(client.execute(mutation))

    return JSONResponse({
        "status": "Success",
        "data": "Product Successfuly Deleted"
    })



class UpdateProduct(BaseModel):
    id: str
    title: str


@app.put("/update-product")
async def update_product(product: UpdateProduct):
    mutation = """
    mutation ProductUpdate($id: ID!, $title: String!) {
        productUpdate(input: {id: $id, title: $title}) {
            product {
                id
                title
            }
            userErrors {
                field
                message
            }
        }
    }
    """

    variables = {
        "id": product.id,
        "title": product.title
    }

    client = shopify_client()
    data = json.loads(client.execute(mutation, variables=variables))
    
    print("data", data)
    return JSONResponse({
            "status": "Success",
            "data": data
        })