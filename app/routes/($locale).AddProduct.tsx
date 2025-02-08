
import React, { useState } from "react";
import { Product } from "~/components/ProductCard";

const ProductForm = ({ onSubmit,  product }: {
    onSubmit: (formData: any) => void;
    product: Product | null;
}) => {
  const [formData, setFormData] = useState({
    imageUrl: product?.url || "",
    title: product?.title || "",
    description: product?.description || "",
    amount: product?.amount || "",
    quantity: product?.totalInventory || "",
    price: product?.amount || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      imageUrl: "",
      title: "",
      description: "",
      amount: "",
      quantity: "",
      price: "",
    });
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
        {product ? "Update Product" : "Add Product"}
      </h2>
      <h2 className="text-xl font-semibold mb-4">
      </h2>
      
    </div>
  );
};

const ProductFormModal = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div>
        <button onClick={() => setIsOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded">Open Form</button>
            {isOpen && <ProductForm onSubmit={(data) => console.log("Submitted:", data)} 
            onClose={() => setIsOpen(false)} 
            />}
      </div>
    );
  };

export default ProductFormModal;