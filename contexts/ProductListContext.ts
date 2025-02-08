import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "~/components/ProductCard";

type ProductListContextType = {
  productList: Product[] | null; // Allow null
  setProductList: React.Dispatch<React.SetStateAction<Product[] | null>>; // Ensure setProduct allows null
};

// Create context with an initial value of `null`
export const ProductListContext = createContext<ProductListContextType | null>(null);

// Custom hook to use ProductContext safely
export const useProductListContext = () => {
    const context = useContext(ProductListContext);
    if (!context) {
      throw new Error("useProductContext must be used within a ProductProvider");
    }
    return context;
  };