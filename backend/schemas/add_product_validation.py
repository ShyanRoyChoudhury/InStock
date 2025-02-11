from typing import List, Optional, Dict
from pydantic import BaseModel

class VariantValue(BaseModel):
    name: str

class VariantOption(BaseModel):
    name: str
    value: List[VariantValue]

class PriceVariant(BaseModel):
    variant: Dict[str, str]  # e.g., {"Size": "Small", "Color": "Black"}
    amount: str

class Product(BaseModel):
    title: str
    # totalInventory: int
    description: Optional[str] = None
    # amount: float
    category: Optional[str] = None
    variant: List[VariantOption]  # Matches the "variant" field in your input
    price: List[PriceVariant]  # Matches the "price" field in your input



# class Product(BaseModel):
#     title: str
#     totalInventory: int  
#     description: Optional[str] = None
#     amount: float
#     variant: object
#     price: object