from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Float, Time
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID



import uuid
from database import Base

class Product(Base):
    __tablename__ = "product"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    shopify_id = Column(String(255),index=True)
    title = Column(String(255),index=True)
    description = Column(String(255))
    is_deleted = Column(Boolean,default=False)
    amount = Column(Float, default=0.0)

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variant = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "productImage"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    shopify_id = Column(String(255),index=True)
    url = Column(Text)
    product_id = Column(Integer, ForeignKey("product.id"))

    product = relationship("Product", back_populates="images")


class ProductVariant(Base):
    __tablename__ = "productVariant"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    shopify_id = Column(String(255),index=True)
    title = Column(String(255),index=True)
    price = Column(Float, default=0.0)
    url = Column(Text)
    product_id = Column(Integer, ForeignKey("product.id"))
    created_at = Column(Time)

    product = relationship("Product", back_populates="variant")