import React, { useContext, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { deleteProduct } from '~/api/deleteProduct';
import { getProducts } from '~/api/getProductList';
import { PopUpContext } from 'contexts/PopupContext';
import { ProductContext, useProductContext } from 'contexts/ProductContext';
import { useProductListContext } from 'contexts/ProductListContext';

const Modal = () => {
    const context = useContext(PopUpContext);
    const productContext = useProductContext();
    const productListContext = useProductListContext();

    if (!context) {
    throw new Error("PopUpContext must be used within a PopUpProvider");
    }
    const { isModalOpen, setIsModalOpen } = context;
    const { product, setProduct } = productContext;
    const { setProductList } = productListContext;
    const closeModal = async() => {
        setIsModalOpen(false);
        };


    const handleDeleteProduct = async () => {
      console.log('clicked')
      console.log('product', product)
        if (product && product.id) {
            const res = await deleteProduct(product.id);
            if(res !== null) {
                const res = await getProducts()
                if(res!== null) {
                    const cleanedRes = res?.data?.map((product: any) => ({
                        totalInventory: product.node.totalInventory,
                        id: product.node.id,
                        title: product.node.title,
                        description: product.node.description,
                        image: product.node.featuredImage?.url || "https://archive.org/download/placeholder-image/placeholder-image.jpg",
                        amount: product.node.priceRange.maxVariantPrice.amount,
                        handle: product?.node?.handle
                    }));
        
                    setProductList(cleanedRes);
                    setProduct(null)
                }
            }
          }
    }
  return (
    <div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-4">
            <div className="relative bg-white rounded-lg shadow-lg">
              <button
                onClick={closeModal}
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Close modal</span>
              </button>
              
              <div className="p-6 text-center">
                <AlertCircle className="mx-auto mb-4 text-gray-400 w-12 h-12" />
                <h3 className="mb-5 text-lg font-normal text-gray-500">
                  Are you sure you want to delete this product?
                </h3>
                <button
                  onClick={async()=> {

                    await handleDeleteProduct()
                    closeModal()
                }}
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                >
                  Yes, I'm sure
                </button>
                <button
                  onClick={closeModal}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;