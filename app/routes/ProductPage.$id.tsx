import { useParams } from '@remix-run/react'
import { Image } from '@shopify/hydrogen'
import React, { useEffect, useState } from 'react'
import { getProductDetails } from '~/api/getProductDetails';

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
    <div className='py-4'>
      <div className="lg:flex">
        <div className="">
          {product?.images?.nodes?.length > 0 ? (
            <Image
              data={product.images.nodes[0] || "app/assets/photo.png"}
              aspectRatio="1/1"
              sizes=""
              className='max-w-screen max-h-[80vh]' 
              // height={100}
              // width={100}

            />
          ):(
          <div className='px-20'>
            <Image src='app/assets/photo.png' 
            aspectRatio="1/1"
            sizes=""
            className='max-w-screen max-h-[80vh]' />
          </div>
          )
        }
        </div>
        <div className='px-10 border border-gray-50 rounded-xl lg:py-20 space-y-5'>
          <div>
            <strong>Product Name</strong>
            <h4 className='text-4xl font-semibold'>{product?.title || 'No title available'}</h4>
          </div>
          <div className='flex space-x-2'>
              <strong>Price</strong>
              <p>{product?.priceRange?.maxVariantPrice?.currencyCode || 'N/A'}</p>
              <p>{product?.priceRange?.maxVariantPrice?.amount || 'N/A'}</p>
          </div>

          <div className='flex space-x-2'>
              <strong>Description</strong>
              <p>{product?.descriptionHtml}</p>
              {/* <p>{product?.priceRange?.maxVariantPrice?.currencyCode || 'N/A'}</p>
              <p>{product?.priceRange?.maxVariantPrice?.amount || 'N/A'}</p> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
