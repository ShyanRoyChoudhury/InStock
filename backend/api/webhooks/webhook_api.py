from starlette.requests import Request
import hmac
import hashlib
import base64
import os
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
import crud 
from fastapi import APIRouter

token = os.getenv("TOKEN")

router = APIRouter()

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



@router.post("/webhook/product/create")
async def handle_product_update(request: Request, db: Session = Depends(get_db)):
    """Receives product creation update from Shopify and updates the database."""
    body = await request.body()
    verify_webhook(request, body)  # Validate webhook authenticity
    
    payload = await request.json()
    print("body", payload)

    crud.insert_webhook_product(db=db, product_data=payload)
    
    return {"message": "Product updated successfully"}
