from fastapi import HTTPException
import json
from schemas.add_product_validation import Product

def map_data(product):
    # Transform "variant" into "productOptions"
    product_options = [
        {
            "name": option.name,
            "values": [{"name": value.name} for value in option.value]
        }
        for option in product.variant
    ]

    # Transform "price" into "variants"
    variants = []
    for price_item in product.price:
        option_values = {key: value for key, value in price_item.variant.items()}  # ✅ Correct format

        variants.append({
            "optionValues": option_values,  # ✅ This is now a dictionary
            "price": int(float(price_item.amount) * 100)  # Convert to cents
        })

    # Wrap the product data in a "products" array
    product_data = {
        "title": product.title,
        "descriptionHtml": product.description or "",
        "productOptions": product_options,
        "variants": variants
    }

    # Custom function to format the output
    def format_custom(data):
        if isinstance(data, dict):
            items = []
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    items.append(f"{key}: {format_custom(value)}")
                else:
                    items.append(f"{key}: {json.dumps(value)}")
            return "{" + ", ".join(items) + "}"
        elif isinstance(data, list):
            items = [format_custom(item) for item in data]
            return "[" + ", ".join(items) + "]"
        else:
            return json.dumps(data)

    return format_custom(product_data)

async def create_product(client, product):

        
    try:
        mapped = map_data(product=product)
        product_mutation = f"""
        mutation CreateProductWithOptions {{
            productSet(
                synchronous: true,
                input: {mapped}
            ) {{
                product {{
                    id
                    title
                    options {{
                        id
                        name
                        position
                        values
                    }}
                    variants(first: 5) {{
                        edges {{
                            node {{
                                id
                                selectedOptions {{
                                    name
                                    value
                                }}
                            }}
                        }}
                    }}
                }}
                userErrors {{
                    field
                    message
                }}
            }}
        }}
        """
        
        # print("mapped", mapped)
        variables = {
            "input": mapped
        }
        product_result = client.execute(
            product_mutation, 
            variables=variables
        )
        print("product_result", product_result)
        if not product_result:
            raise HTTPException(status_code=400, detail="Failed to create product")
        
        # result_data = json.loads(product_result) if isinstance(product_result, str) else product_result
        
        # # Check for user errors
        # if result_data.get('userErrors') and len(result_data['userErrors']) > 0:
        #     raise HTTPException(
        #         status_code=400,
        #         detail=result_data['userErrors'][0]['message']
        #     )

        return product_result

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    



    # {
    #                     title: "Premium Cotton T-Shirt",
    #                     descriptionHtml: "High-quality cotton t-shirt perfect for everyday wear",
    #                     productOptions: [
    #                         {
    #                             name: "Size",
    #                             values: [
    #                                 { name: "Small" },
    #                                 { name: "Medium" },
    #                                 { name: "Large" }
    #                             ]
    #                         },
    #                         {
    #                             name: "Color",
    #                             values: [
    #                                 { name: "Black" },
    #                                 { name: "White" }
    #                             ]
    #                         }
    #                     ],
    #                     variants: [
    #                         {
    #                             optionValues: [
    #                                 { optionName: "Size", name: "Small" },
    #                                 { optionName: "Color", name: "Black" }
    #                             ],
    #                             price: 2999
    #                         },
    #                         {
    #                             optionValues: [
    #                                 { optionName: "Size", name: "Medium" },
    #                                 { optionName: "Color", name: "Black" }
    #                             ],
    #                             price: 2999
    #                         },
    #                         {
    #                             optionValues: [
    #                                 { optionName: "Size", name: "Large" },
    #                                 { optionName: "Color", name: "White" }
    #                             ],
    #                             price: 3499
    #                         }
    #                     ]
    #         }