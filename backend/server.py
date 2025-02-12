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
# from create_product import create_product
from create_product import create_product
from models import Product
from schemas.add_product_validation import  Product
import crud, models



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


token = os.getenv("TOKEN")
db=next(get_db())
client = shopify_client()

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
    verify_webhook(request, body)  # Validate webhook authenticity
    
    payload = await request.json()
    print("body", payload)

    crud.insert_webhook_product(db=db, product_data=payload)
    
    return {"message": "Product updated successfully"}



@app.get("/products")
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



@app.post("/add-product")
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

@app.post("/delete-product")
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




@app.get('/product')
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