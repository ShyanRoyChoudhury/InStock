import { useParams } from '@remix-run/react'
import { Image } from '@shopify/hydrogen'
import React, { useEffect, useState } from 'react'
import { getProductDetails } from '~/api/getProductDetails';
import DOMPurify from 'dompurify';

function ProductPage() {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { id } = params;

  async function getProduct() {
    console.log('Fetching product for id:', id);
    if (id) {
      try {
        setLoading(true);
        const response = await getProductDetails(id);
        console.log('API Response:', response);

        // Adjust this based on actual response structure
        if (response && response.data) {
          setProduct(response.data);
        } else {
          console.warn('Unexpected response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    getProduct();
  }, [id]); 

  useEffect(() => {
    console.log('Updated product:', product);
  }, [product]);

  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className='py-4 w-screen'>
      <div className="lg:flex">
        <div className="lg:w-1/2">
          {product?.images?.nodes?.length > 0 ? (
            <Image
              data={product.images.nodes[0] || "/photo.png"}
              aspectRatio="1/1"
              sizes=""
              className='max-w-screen max-h-[80vh]' 
              // height={100}
              // width={100}

            />
          ):(
          <div className='px-20'>
            <Image src='/photo.png' 
            aspectRatio="1/1"
            sizes=""
            className='max-w-screen max-h-[80vh]' />
          </div>
          )
        }
        </div>
        <div className='px-10 lg:w-1/2 border border-gray-50 rounded-xl lg:py-20 space-y-5'>
          <div>
            <strong className='text-gray-500'>Product Name</strong>
            <h4 className='text-4xl font-semibold'>{product?.title || 'No title available'}</h4>
          </div>
          <div className='flex space-x-2 items-center justify-between'>
              <strong className='text-2xl items-center text-gray-500 pl-2 md:pl-0'>Price</strong>
              <div className='flex space-x-2 items-center mt-0.5 border p-4 rounded-lg'>
                <div className='flex space-x-0.5'>
                  <p className='font-semibold text-xs'>{product?.priceRange?.minVariantPrice?.currencyCode || 'N/A'}</p>
                  <p className='text-xs'>{product?.priceRange?.minVariantPrice?.amount || 'N/A'}</p>
                </div>
                <p>{" - "}</p>
                <div className='flex space-x-0.5'>
                  <p className='font-semibold text-xs'>{product?.priceRange?.maxVariantPrice?.currencyCode || 'N/A'}</p>
                  <p className='text-xs'>{product?.priceRange?.maxVariantPrice?.amount || 'N/A'}</p>
                </div>
                
              </div>
          </div>

          <div className='  space-x-2 space-y-2'>
              <strong className='text-2xl items-center text-gray-500 pl-2 md:pl-0'>Description</strong>
              {/* <p className='mt-1 border p-4 rounded-lg'>{product?.descriptionHtml}</p> */}
              <div className='mt-1 border p-4 rounded-lg' 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.descriptionHtml) }} />
          </div>

          <div className='bg-gray-100 p-4 rounded-lg space-y-2'>
          <strong className='text-xl items-center'>Variants</strong>
            {product?.variants?.edges.map(variant=> (
              
              <div key={variant?.id} className='border p-6 rounded-lg bg-white'>

                {/* <p className='border items-center'>{variant?.node?.title}</p> */}
                {/* <p>{variant?.node?.price}</p> */}
                {variant?.node?.selectedOptions.map(opt=>(
                  <div key={opt} className='flex space-x-4 space-y-2 items-center'>
                    <p className='font-semibold'>{opt?.name}</p>
                    <p className='bg-gray-200 px-2.5 py-1 rounded-lg'>{opt?.value}</p>
                  </div>
                ))}

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
