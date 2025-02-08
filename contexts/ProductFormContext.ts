import { createContext, useContext } from "react";

type ProductModalContext = {
    isProductFormModalOpen: boolean;
    setIsProductFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
  
  // Provide a default value (or use `null` initially)
  export const ProductModalContext = createContext<ProductModalContext | undefined>(undefined);



  export const useProductFormContext = () => {
    const context = useContext(ProductModalContext);
    if (!context) {
      throw new Error("usePopUpContext must be used within a PopUpProvider");
    }
    return context;
  };