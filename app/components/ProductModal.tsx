

import React, { useContext, useEffect, useState } from 'react';
import { X, PlusCircle, Edit3, Trash } from 'lucide-react';
import { useProductContext } from 'contexts/ProductContext';
import { useProductFormContext } from 'contexts/ProductFormContext';
import { editProduct } from '~/api/editProduct';
import { createProduct } from '~/api/createProduct';

const ProductModal = ({ onSubmit }) => {
    const { product, setProduct } = useProductContext();
    const { isProductFormModalOpen, setIsProductFormModalOpen } = useProductFormContext();

    const closeModal = () => {
        setIsProductFormModalOpen(false);
        setProduct(null);
    };

    const [formData, setFormData] = useState({
        title: product?.title || "",
        description: product?.description || "",
        variants: product?.variants || [],
        prices: product?.prices || [],
    });

    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || "",
                description: product.description || "",
                variants: product.variants || [],
                prices: product.prices || [],
            });
        } else {
            setFormData({
                title: "",
                description: "",
                variants: [],
                prices: [],
            });
        }
    }, [product]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVariantNameChange = (index, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index].name = value;
        setFormData({ ...formData, variants: updatedVariants });
    };

    const handleVariantValueChange = (variantIndex, valueIndex, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].values[valueIndex].name = value;
        setFormData({ ...formData, variants: updatedVariants });
    };

    const handleAddVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { name: "", values: [] }],
        });
    };

    const handleRemoveVariant = (index) => {
        const updatedVariants = [...formData.variants];
        updatedVariants.splice(index, 1);
        setFormData({ ...formData, variants: updatedVariants });
    };

    const handleAddVariantValue = (variantIndex) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].values.push({ name: "" });
        setFormData({ ...formData, variants: updatedVariants });
    };

    const handleRemoveVariantValue = (variantIndex, valueIndex) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].values.splice(valueIndex, 1);
        setFormData({ ...formData, variants: updatedVariants });
    };

    const handlePriceChange = (comboIndex, value) => {
        const updatedPrices = [...formData.prices];
        const combination = generateCombinations()[comboIndex];

        // Find the price object for this combination
        const priceIndex = updatedPrices.findIndex((p) =>
            Object.keys(combination).every((key) => p.variant[key] === combination[key])
        );

        if (priceIndex !== -1) {
            // Update existing price
            updatedPrices[priceIndex].amount = value;
        } else {
            // Add new price for this combination
            updatedPrices.push({ variant: combination, amount: value });
        }

        setFormData({ ...formData, prices: updatedPrices });
    };

    const generateCombinations = () => {
        if (formData.variants.length === 0) return [];

        // Generate all possible combinations of variant values
        return formData.variants.reduce((acc, variant) => {
            if (!acc.length) {
                return variant.values.map((value) => ({ [variant.name]: value.name }));
            }
            return acc.flatMap((combo) =>
                variant.values.map((value) => ({ ...combo, [variant.name]: value.name }))
            );
        }, []);
    };

    const generatePriceInputs = () => {
        const combinations = generateCombinations();

        return combinations.map((combo, index) => {
            const price = formData.prices.find((p) =>
                Object.keys(combo).every((key) => p.variant[key] === combo[key])
            );

            return (
                <div key={index} className="mb-4 p-4 border rounded-lg">
                    <div className="mb-2">
                        <strong>Variant Combination:</strong>
                        <pre>{JSON.stringify(combo, null, 2)}</pre>
                    </div>
                    <div>
                        <label className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>
                            Price
                        </label>
                        <input
                            type="number"
                            value={price ? price.amount : ""}
                            onChange={(e) => handlePriceChange(index, e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Price"
                        />
                    </div>
                </div>
            );
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const mode = product ? "Edit" : "Add";
    const labelClassName = 'text-gray-100 pl-1.5 font-semibold';

    return (
        <div>
            {isProductFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 max-h-screen">
                    <div className="relative w-full max-w-md p-4 max-h-screen overflow-scroll">
                        <div className="relative bg-white rounded-lg shadow-lg">
                            <button
                                onClick={closeModal}
                                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                            >
                                <X className="w-4 h-4" />
                                <span className="sr-only">Close modal</span>
                            </button>

                            <div className="p-6">
                                {mode === "Edit" ? (
                                    <Edit3 className="mx-auto mb-4 text-gray-400 w-12 h-12" />
                                ) : (
                                    <PlusCircle className="mx-auto mb-4 text-gray-400 w-12 h-12" />
                                )}

                                <form onSubmit={handleSubmit} className="space-y-1.5">
                                    {/* Title and Description fields */}
                                    <div>
                                        <label htmlFor="title" className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Title"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={6}
                                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Add Product Description"
                                        />
                                    </div>

                                    {/* Variants Section */}
                                    <div>
                                        <label className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>
                                            Variants
                                        </label>
                                        {formData.variants.map((variant, variantIndex) => (
                                            <div key={variantIndex} className="mb-4 p-4 border rounded-lg">
                                                <div className="relative flex justify-between items-center mb-2">
                                                    <input
                                                        type="text"
                                                        value={variant.name}
                                                        onChange={(e) => handleVariantNameChange(variantIndex, e.target.value)}
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        placeholder="Variant Name (e.g., Size, Color)"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveVariant(variantIndex)}
                                                        className="rounded-lg border border-gray-200 p-0.5 absolute right-2 bg"
                                                    >
                                                        <Trash className='text-gray-600 hover:text-red-500 transition-all duration-200' />
                                                    </button>
                                                </div>

                                                {/* Variant Values */}
                                                {variant.values.map((value, valueIndex) => (
                                                    <div key={valueIndex} className="flex items-center mb-2 relative">
                                                        <input
                                                            type="text"
                                                            value={value.name}
                                                            onChange={(e) => handleVariantValueChange(variantIndex, valueIndex, e.target.value)}
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                            placeholder="Value Name (e.g., Small, Medium)"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariantValue(variantIndex, valueIndex)}
                                                            className="text-black rounded-lg border border-gray-200 p-0.5 absolute right-2"
                                                        >
                                                            <Trash className='text-gray-400 hover:text-gray-900 transition-all duration-200' />
                                                        </button>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => handleAddVariantValue(variantIndex)}
                                                    className="text-black rounded-lg border-[1.5px] border-black px-3 py-0.5 "
                                                >
                                                    Add Value
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={handleAddVariant}
                                            className="text-black rounded-lg border-[1.5px] border-black px-3 py-0.5 "
                                        >
                                            Add Variant
                                        </button>
                                    </div>

                                    {/* Prices Section */}
                                    <div>
                                        <label className={`${labelClassName} block mb-2 text-sm font-medium text-gray-900 dark:text-white`}>
                                            Prices
                                        </label>
                                        {generatePriceInputs()}
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                            onClick={async () => {
                                                if (mode === 'Edit') {
                                                    if (product) {
                                                        await editProduct(formData, product.id);
                                                    }
                                                } else {
                                                    await createProduct(formData);
                                                }
                                            }}
                                        >
                                            {mode === "Edit" ? 'Edit' : 'Add Product'}
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