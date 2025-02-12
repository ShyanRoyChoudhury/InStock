from fastapi import APIRouter, Depends, HTTPException
from shopifyClient import shopify_client

router = APIRouter()

@router.get("/products")
def get_products():
    query = """
    {
        products(first: 15) {
            edges {
                node {
                    id
                    title
                    description
                    priceRange {
                        minVariantPrice {
                            amount
                        }
                        maxVariantPrice {
                            amount
                        }
                    }
                }
            }
        }
    }
    """
    data = shopify_client.execute(query)
    return {"status": "Success", "data": data}

@router.post("/add-product")
async def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    try:
        product_data = product.dict()
        db_product = create_product(db, product_data)
        return {"message": "Product created successfully", "product_id": db_product.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delete-product")
async def delete_product(product: ProductDelete, db: Session = Depends(get_db)):
    try:
        if delete_product(db, product.id):
            return {"status": "Success", "data": "Product successfully deleted"}
        else:
            return {"status": "Fail", "data": "Product not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update-product")
async def update_product(product: ProductUpdate, db: Session = Depends(get_db)):
    try:
        # Update logic here
        return {"status": "Success", "data": "Product updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))