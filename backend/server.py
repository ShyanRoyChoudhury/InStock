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
from starlette.requests import Request
from starlette.middleware.base import BaseHTTPMiddleware
import os
import hmac
import hashlib
import base64
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
from create_product import create_product

# Define a simple GraphQL schema
@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, GraphQL!"

# Create a FastAPI app and integrate GraphQL
schema = strawberry.Schema(Query)
graphql_app = GraphQL(schema)

class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self' http://localhost:* https://*.myshopify.com "
            "01jkn78874eexs32jev2j4v73t-4cb94a47a86fc98efe79.myshopify.dev "
            "shopify-app-be-371114668585.asia-south1.run.app "
            "data: 'unsafe-inline' 'unsafe-eval'; "
            "connect-src 'self' https://monorail-edge.shopifysvc.com "
            "https://400wmv-ki.myshopify.com "
            "shopify-app-be-371114668585.asia-south1.run.app;"
        )
        return response
    
app = FastAPI()

# Add CSP middleware before CORS
app.add_middleware(CSPMiddleware)

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_route("/graphql", graphql_app)
app.add_websocket_route("/graphql", graphql_app)


token = os.getenv("TOKEN")

def verify_webhook(request: Request, body: bytes):
    """Verify Shopify webhook using HMAC-SHA256 signature."""
    hmac_header = request.headers.get("X-Shopify-Hmac-SHA256")
    
    # Compute HMAC signature
    hash_digest = hmac.new(
        token.encode("utf-8"), body, hashlib.sha256
    ).digest()
    
    computed_hmac = base64.b64encode(hash_digest).decode("utf-8")

    # if not hmac.compare_digest(computed_hmac, hmac_header):
    #     raise HTTPException(status_code=403, detail="Unauthorized Webhook")

@app.post("/webhook/product/create")
async def handle_product_update(request: Request, db: Session = Depends(get_db)):
    """Receives product creation update from Shopify and updates the database."""
    body = await request.body()
    print("body", body)
    verify_webhook(request, body)  # Validate webhook authenticity
    
    payload = await request.json()
    shopify_id = payload.get("id")
    title = payload.get("title")
    # updated_at = payload.get("updated_at")
    price = payload.get("variants")[0]["price"]
    
    # Update product in database
    # product = db.query(Product).filter_by(shopify_id=shopify_id).first()


    print("price", price)
    # if product:
    #     product.title = title
    #     product.updated_at = updated_at
    #     product.price = float(price)
    # else:
    #     db.add(Product(
    #         shopify_id=shopify_id,
    #         title=title,
    #         updated_at=updated_at,
    #         price=float(price)
    #     ))

    # db.commit()
    
    return {"message": "Product updated successfully"}


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
    # print("data", data)
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

        client = shopify_client()

        product_id = await create_product(client=client)

        variant_mutation = """
        mutation AddVariantsToProduct($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
            productVariants {
            id
            title
            selectedOptions {
                name
                value
            }
            }
            userErrors {
            field
            message
            }
        }
        }
        """

        # Define the variables for the mutation
        variant_variables = {
            "productId": product_id,  # Ensure this is the correct Shopify product ID (gid://shopify/Product/123456789)
            "variants": [
                {
                    "price": float(product.amount),  # Ensure price is in float format
                    "optionValues": [
                        {"name": "Black", "optionName": "Color"}  # Correctly setting variant option
                    ]
                }
            ]
        }

        # Execute the mutation
        variant_result = client.execute(variant_mutation, variables=variant_variables)
        variant_data = json.loads(variant_result)

        # Debugging output
        print("Debug - Variant Data:", json.dumps(variant_data, indent=2))

        # Check for errors
        if "errors" in variant_data or variant_data.get("data", {}).get("productVariantsBulkCreate", {}).get("userErrors"):
            print("Debug - Variant Creation Errors:", json.dumps(variant_data["errors"], indent=2) if "errors" in variant_data else json.dumps(variant_data["data"]["productVariantsBulkCreate"]["userErrors"], indent=2))

        # Step 3: Adjust Inventory
        inventory_mutation = """
        mutation ActivateInventoryItem($inventoryItemId: ID!, $locationId: ID!, $available: Int!) {
        inventoryActivate(
            inventoryItemId: $inventoryItemId,
            locationId: $locationId,
            available: $available
        ) {
            inventoryLevel {
            id
            quantities(names: ["available"]) {
                name
                quantity
            }
            item {
                id
            }
            location {
                id
            }
            }
            userErrors {
            field
            message
            }
        }
        }
        """

        # Define inventory activation variables
        inventory_variables = {
            "inventoryItemId": inventory_item_id,  # Use the retrieved inventoryItem ID
            "locationId": "gid://shopify/Location/346779380",  # Replace with correct location ID
            "available": 42  # Set initial stock quantity
        }

        # Execute inventory activation
        inventory_result = client.execute(inventory_mutation, variables=inventory_variables)
        inventory_data = json.loads(inventory_result)

        print("Debug - Inventory Data:", json.dumps(inventory_data, indent=2))

        # Check for errors
        if "errors" in inventory_data or inventory_data.get("data", {}).get("inventoryActivate", {}).get("userErrors"):
            print("Debug - Inventory Activation Errors:", json.dumps(inventory_data["errors"], indent=2) if "errors" in inventory_data else json.dumps(inventory_data["data"]["inventoryActivate"]["userErrors"], indent=2))

        return {
            "message": "Product created successfully",
            "product_id": product_id,
            # "variant_id": variant_id
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

    
    
    query = """
        query MyQuery {
        publications(first: 10) {
            edges {
            node {
                id
                autoPublish
            }
            }
        }
        }
    """

    response = json.loads(client.execute(query))
    print("data in publication", response)

    publications = response.get("data", {}).get("publications", {}).get("edges", [])

    if not publications:
        print("No publications found.")
    else:
        print("Fetched Publications:", publications)

        # Step 2: Mutation to publish each publication
        mutation = """
            mutation PublishPublication($id: ID!) {
            publishablePublish(publishableId: $id, publicationId: $id) {
                publishable {
                id
                }
                userErrors {
                field
                message
                }
            }
            }
        """

        # Loop through all publications and publish them
        for pub in publications:
            publication_id = pub["node"]["id"]
            print(f"Publishing: {publication_id}")

            # Execute publish mutation
            publish_response = json.loads(client.execute(mutation, variables={"id": publication_id}))

            # Check for errors
            errors = publish_response.get("data", {}).get("publishablePublish", {}).get("userErrors", [])
            if errors:
                print(f"Error publishing {publication_id}: {errors}")
            else:
                print(f"Successfully published: {publication_id}")
    
    
    return JSONResponse({
            "status": "Success",
            "data": data
        })