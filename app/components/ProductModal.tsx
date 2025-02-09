import React, { useContext, useEffect, useState } from 'react';
import { X, PlusCircle , Edit3 } from 'lucide-react';

import { useProductContext } from 'contexts/ProductContext';

import { useProductFormContext } from 'contexts/ProductFormContext';
import { editProduct } from '~/api/editProduct';
import { createProduct } from '~/api/createProduct';

const ProductModal = ({ onSubmit }: {
    onSubmit: (formData: any) => void;
}) => {
    
    const { product, 
        setProduct 
    } = useProductContext();
    const { isProductFormModalOpen, setIsProductFormModalOpen } = useProductFormContext();
    const closeModal = () => {
        setIsProductFormModalOpen(false)
        setProduct(null)
    };
    const [formData, setFormData] = useState({
        imageUrl: product?.url || "",
        title: product?.title || "",
        description: product?.description || "",
        // amount: product?.amount || 0.00,
        quantity: product?.totalInventory || 0,
        price: product?.amount || 0.00,
    });
    useEffect(() => {
        if (product) {
            setFormData({
                imageUrl: product.image || "",
                title: product.title || "",
                description: product.description || "",
                // amount: product.amount || 0.00,
                quantity: product.totalInventory || 0,
                price: product.amount || 0.00,
            });
        } else {
            setFormData({
                imageUrl: "",
                title: "",
                description: "",
                // amount: 0.0,
                quantity: 0,
                price: 0.00,
            });
        }
    }, [product]);
    
    useEffect(()=> {
        console.log('product', product)
        console.log('formData', formData)
    }, [product])
    
      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
      };

      const mode = product? "Edit": "Add"
      const labelClassName = 'text-gray-100 pl-1.5 font-semibold'
  return (
    <div>

        {isProductFormModalOpen && (
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
                    
                    <div className="p-6 ">
                        {mode === "Edit"? 
                            (<Edit3 className="mx-auto mb-4 text-gray-400 w-12 h-12" />)
                            :
                            (<PlusCircle className="mx-auto mb-4 text-gray-400 w-12 h-12" />)
                        }          

                        <form onSubmit={handleSubmit} className='space-y-1.5'>
                            <div>
                                <label htmlFor="imageUrl" className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>Image Url</label>
                                <input type="text" 
                                name="imageUrl"  
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                placeholder="imageUrl" required 
                                onChange={handleChange}/>
                            </div>
                            <div>
                                <label htmlFor="title" className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>Title</label>
                                <input type="text" 
                                name="title" 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                placeholder="title" required 
                                onChange={handleChange}/>
                            </div>

                            <div>
                                <label htmlFor="description" 
                                className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>
                                    Description
                                </label>
                                <textarea id="description" 
                                    onChange={handleChange}  
                                    name="description" 
                                    value={formData.description} 
                                    rows="4" 
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    placeholder="Add Product Description" 
                                />
                            </div>

                            {/* <div>
                                <label htmlFor="amount" className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>Amount</label>
                                <input type="decimal" 
                                name="amount" 
                                value={formData.amount}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                placeholder="Amount" required 
                                />
                            </div> */}

                            <div>
                                <label htmlFor="number" className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>Total Inventory</label>
                                <input type="number" 
                                name="quantity" 
                                value={formData.quantity}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                placeholder="TotalInventory" required 
                                />
                            </div>


                            <div>
                                <label htmlFor="number" className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>Price</label>
                                <input type="text" 
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 
                                        block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                                        dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 
                                        dark:focus:border-blue-500" 
                                    placeholder="Amount" 
                                    required 
                                />
                            </div>

                            <div className="flex justify-between">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={async() => {
                                    if (mode === 'Edit') {
                                        if(product){
                                            await editProduct(formData, product?.id);
                                        }
                                    } else {
                                        await createProduct(formData)
                                    }
                                }}
                            >
                                {mode === "Edit"? 'Edit' : 'Add Product'}
                            </button>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
        </div>
        )}
    </div>
  );
};

export default ProductModal;