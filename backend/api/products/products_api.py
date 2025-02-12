from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from shopifyClient import shopify_client
import json
from database import get_db
from models import Product
from schemas.add_product_validation import  Product
import crud, models
from create_product import create_product

router = APIRouter()


db=next(get_db())
client = shopify_client()

@router.get("/products")
def get_products():
    product = """
{
    products(first:15) {
    edges {
      node {
        totalInventory
        id
        title
        description
        handle
        featuredImage {
          url
        }
        priceRange {
          maxVariantPrice {
            amount
        }
        minVariantPrice {
            amount
        }
        }
      }
    }
  }
}
    """
    data = json.loads(client.execute(product))
    # print("data", data)
    cleaned_data = data['data']['products']['edges']
    return JSONResponse({
        "status": "Success",
        "data": cleaned_data
    })



@router.post("/add-product")
async def add_product(product: Product):    
    try:
        
        client = shopify_client()
        print("client initiated")
        product = await create_product(client=client, product=product)
        # if product
        crud.create_product_db( db=db ,product_data=json.loads(product))
        return {
            "message": "Product created successfully",
            "product_id": product,
        }

    except Exception as e:
        print("Debug - Exception:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    

class DeleteProduct(BaseModel):
    id: str

@router.post("/delete-product")
async def delete_product(product: DeleteProduct):

    try:
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

        deleted = crud.delete_product(db=db, id=product.id)

        if(deleted != True):
            return JSONResponse({
                "status": "Success",
                "data": "Product Successfuly Deleted from Shopify, DB update failed"
            })
        
        
        return JSONResponse({
            "status": "Success",
            "data": "Product Successfuly Deleted"
        })
    
    except Exception as e:
        return JSONResponse({
            "status": "Fail",
            "data": "Product Delete UnSuccessfull"
        })


class UpdateProduct(BaseModel):
    id: str
    title: str


@router.put("/update-product")
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




@router.get('/product')
async def get_product(id: str):
    try:
        query=f"""
            query GetProductDetails {{
                product(id: "{id}") {{
                    id
                    title
                    descriptionHtml
                    handle
                    priceRange {{
                        minVariantPrice {{
                            amount
                            currencyCode
                        }}
                        maxVariantPrice {{
                            amount
                            currencyCode
                        }}
                    }}
                    images(first: 1) {{
                        nodes {{
                            id
                            url
                            altText
                            width
                            height
                        }}
                    }}
                    variants(first: 10) {{
                        edges {{
                            node {{
                            id
                            title
                            price
                            sku
                            selectedOptions {{
                                name
                                value
                            }}
                            }}
                        }}
                    }}
                }} 
            }}
            """
        data = json.loads(client.execute(query))
        if data is None:
            return JSONResponse({
            "status": "Success",
            "data": None
        })

        print("data", data)
        
        return JSONResponse({
            "status": "Success",
            "data": data['data']['product']
        })
    except Exception as e:
        print("Debug - Exception:", str(e))
        raise HTTPException(status_code=500, detail=str(e))