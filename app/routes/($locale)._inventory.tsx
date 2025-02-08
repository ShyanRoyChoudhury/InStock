'use client'
import { useLoaderData } from "@remix-run/react";

export default function Inventory() {
    // const {produc} = useLoaderData<typeof loader>();
  
    // // Optimistically selects a variant with given available variant information
    // const selectedVariant = useOptimisticVariant(
    //   product.selectedOrFirstAvailableVariant,
    //   getAdjacentAndFirstAvailableVariants(product),
    // );
  
    // Sets the search param to the selected variant without navigation
    // only when no search params are set in the url
    // useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  
    // // Get the product options array
    // const productOptions = getProductOptions({
    //   ...product,
    //   selectedOrFirstAvailableVariant: selectedVariant,
    // });
  
    // const {title, descriptionHtml} = product;
  
    return (
      <div className=" ">
        <h1>test _</h1>
        {/* <ProductImage image={selectedVariant?.image} />
        <div className="product-main">
          <h1>{title}</h1>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <br />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
          <br />
          <br />
          <p>
            <strong>Description</strong>
          </p>
          <br />
          <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          <br />
        </div>
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />  */}

      </div> 
    );
  }