from fastapi import HTTPException


def format_graphql_input(data):
    """Format Python dictionaries/lists into a GraphQL object string."""
    if isinstance(data, dict):
        return "{" + ", ".join(f"{key}: {format_graphql_input(value)}" for key, value in data.items()) + "}"
    elif isinstance(data, list):
        return "[" + ", ".join(format_graphql_input(item) for item in data) + "]"
    elif isinstance(data, str):
        return f"\"{data}\""  # Ensure proper string quoting
    else:
        return str(data)
def map_data(product):
    # Extract product options from the product's variant structure
    product_options = []
    option_name_map = {}  # Store option names with their GraphQL reference

    for option in product.variant:
        option_entry = {
            "name": option.name,
            "values": [{"name": value.name} for value in option.value]
        }
        product_options.append(option_entry)
        option_name_map[option.name] = option_entry  # Store mapping

    # Ensure the variants reference only existing product options
    variants = []
    for price_item in product.price:
        option_values = []

        for key, value in price_item.variant.items():
            if key in option_name_map:  # ✅ Ensure the option exists before adding
                option_values.append({
                    "optionName": key,  # ✅ Corrected structure
                    "name": value
                })
            else:
                print(f"⚠️ Warning: Option '{key}' does not exist in product options.")

        variants.append({
            "optionValues": option_values,  # ✅ Ensuring valid option references
            "price": int(float(price_item.amount)/100)  
        })

    # Wrap the product data
    product_data = {
        "title": product.title,
        "descriptionHtml": product.description or "",
        "productOptions": product_options,
        "variants": variants
    }

    return format_graphql_input(product_data)  # ✅ Ensure proper GraphQL object format


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
        product_result = client.execute(product_mutation)
        return product_result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
