from fastapi import HTTPException
import json


def map_data(product):
    product_options = [
        {
            "name": option.name,
            "values": [{"name": value.name} for value in option.value]
        }
        for option in product.variant
    ]

    variants = []
    for price_item in product.price:
        option_values = [
            {"optionName": key, "name": value}
            for key, value in price_item.variant.items()
        ]

        variants.append({
            "optionValues": option_values,
            "price": int(float(price_item.amount) * 100)  # Convert Decimal to int
        })

    return {
        "title": product.title,
        "descriptionHtml": product.description,  # Use dot notation
        "productOptions": product_options,
        "variants": variants
    }


async def create_product(client, product):
    product_mutation = """
    mutation CreateProductWithOptions($input: ProductInput!) {
        productSet(
            synchronous: true,
            input: $input
        ) {
            product {
                id
                title
                options {
                    id
                    name
                    position
                    values
                }
                variants(first: 5) {
                    edges {
                        node {
                            id
                            selectedOptions {
                                name
                                value
                            }
                        }
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }
    """

    try:

        variables = {
            "input": map_data(product=product)
        }

        product_result = client.execute(
            product_mutation, 
            variables=variables
        )
        print("product_result", product_result)
        if not product_result:
            raise HTTPException(status_code=400, detail="Failed to create product")

        result_data = json.loads(product_result) if isinstance(product_result, str) else product_result
        
        # Check for user errors
        if result_data.get('userErrors') and len(result_data['userErrors']) > 0:
            raise HTTPException(
                status_code=400,
                detail=result_data['userErrors'][0]['message']
            )

        return result_data['product']

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))





