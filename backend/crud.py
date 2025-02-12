from sqlalchemy.orm import Session
import uuid
from models import Product, Variant, VariantValue

def create_product_db(db: Session, product_data):
    # Extract product details
    product_info = product_data["data"]["productSet"]["product"]

    # Insert Product
    db_product = Product(
        title=product_info["title"],
        shopifyProductId=product_info["id"]
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)  # Get generated product ID

    print("reached 1")
    # Insert Variants and VariantValues
    variants = product_info["variants"]["edges"]
    for variant in variants:
        node = variant["node"]
        shopify_variant_id = node["id"]  # Common Shopify Variant ID

        for option in node["selectedOptions"]:
            # Insert Variant
            db_variant = Variant(
                shopifyVariantId=shopify_variant_id,  # Keep same Shopify Variant ID
                productId=db_product.id,  # FK to Product
                name=option["name"]  # Store the name (e.g., Color, Size, etc.)
            )
            db.add(db_variant)
            db.commit()  # Commit so we can use db_variant.id
            
            # Insert VariantValues (multiple values per variant)
            for value in option["value"] if isinstance(option["value"], list) else [option["value"]]:
                db_variant_value = VariantValue(
                    variantId=db_variant.id,  # FK to Variant
                    value=value  # Store each value separately
                )
                db.add(db_variant_value)

    db.commit()  # Final commit

    return db_product  # Return inserted product


def insert_webhook_product(db: Session, product_data):
    try:
        # Insert Product
        db_product = Product(
            shopifyProductId=product_data.get("admin_graphql_api_id"),
            title=product_data.get("title"),
            description=product_data.get("body_html")
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)  # Get generated product ID

        variant_map = {}  # Map shopifyVariantId -> Variant ID

        # Insert Variants
        for variant in product_data.get("variants", []):
            db_variant = Variant(
                shopifyVariantId=variant.get("admin_graphql_api_id"),
                productId=db_product.id,  # FK to Product
                name=variant.get("title")  # Variant name (e.g., 'Wood')
            )
            db.add(db_variant)
            db.commit()
            db.refresh(db_variant)  # Get generated variant ID
            variant_map[variant["admin_graphql_api_id"]] = db_variant.id  # Store mapping

        # Insert VariantValues
        for option in product_data.get("options", []):
            option_name = option.get("name")  # e.g., "Bat material"
            for value in option.get("values", []):
                # Find the corresponding Variant based on name matching
                for variant_id in variant_map.values():
                    db_variant_value = VariantValue(
                        variantId=variant_id,  # FK to Variant
                        value=value  # Store each option value (e.g., "Wood")
                    )
                    db.add(db_variant_value)

        db.commit()  # Final commit
        print("success ")
        return db_product  # Return inserted product

    except Exception as e:
        db.rollback()  # Rollback if any error occurs
        raise e
    



def delete_product(db: Session, id: str):
    try:
        db_update = db.query(Product).filter(Product.id == id).update({"deleted": True})
        db.commit(db_update)
        return True
    except Exception as e:
        db.rollback()
        return False  # Rollback if any error occurs