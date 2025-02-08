import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "~/components/ProductCard";

type ProductContextType = {
  product: Product | null; // Allow null
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>; // Ensure setProduct allows null
};

// Create context with an initial value of `null`
export const ProductContext = createContext<ProductContextType | null>(null);

// Custom hook to use ProductContext safely
export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (!context) {
      throw new Error("useProductContext must be used within a ProductProvider");
    }
    return context;
  };