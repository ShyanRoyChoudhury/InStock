from fastapi import HTTPException
import json
async def create_product(client, product):
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
            "descriptionHtml": product.description or "",
        }
    }

    product_result = client.execute(product_mutation, variables=product_variables)
    product_data = json.loads(product_result) if isinstance(product_result, str) else product_result
    print("product data", product_data)
    if "errors" in product_data:
        print("Debug - Product Creation Errors:", json.dumps(product_data["errors"], indent=2))
        raise HTTPException(status_code=400, detail=product_data["errors"])
    product_id = product_data['data']['productCreate']['product']['id']
    if not product_id:
        raise HTTPException(status_code=400, detail="Failed to create product")
    
    return product_id


