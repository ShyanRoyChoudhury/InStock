import { createContext, useContext } from "react";

type PopUpContextType = {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
  
  // Provide a default value (or use `null` initially)
  export const PopUpContext = createContext<PopUpContextType | undefined>(undefined);



  export const usePopUpContext = () => {
    const context = useContext(PopUpContext);
    if (!context) {
      throw new Error("usePopUpContext must be used within a PopUpProvider");
    }
    return context;
  };