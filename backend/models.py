# coding: utf-8
from sqlalchemy import CHAR, Column, DECIMAL, ForeignKey, String, text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()
metadata = Base.metadata


class Product(Base):
    __tablename__ = 'Products'

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shopifyProductId = Column(String(50), nullable=False, unique=True)
    title = Column(String(50))
    description = Column(String(500))
    deleted = Column(Boolean, default=lambda: False) 


class Variant(Base):
    __tablename__ = 'Variant'

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shopifyVariantId = Column(String(50), nullable=False)
    productId = Column(ForeignKey('Products.id'), nullable=False, index=True)
    name = Column(String(50))
    deleted = Column(Boolean, default=lambda: False) 

    Product = relationship('Product')


class VariantValue(Base):
    __tablename__ = 'VariantValue'

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    variantId = Column(ForeignKey('Variant.id'), nullable=False, index=True)
    value = Column(String(50), nullable=False)
    deleted = Column(Boolean, default=lambda: False)

    Variant = relationship('Variant')


class VariantPrice(Base):
    __tablename__ = 'VariantPrice'

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    variantValueId = Column(ForeignKey('VariantValue.id'), nullable=False, index=True)
    price = Column(DECIMAL(10, 2), nullable=False)
    deleted = Column(Boolean, default=lambda: False)

    VariantValue = relationship('VariantValue')
