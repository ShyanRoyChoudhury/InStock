'use client'

import { useProductFormContext } from "contexts/ProductFormContext";
import { Button } from "flowbite-react";
import InventoryList from "~/components/InventoryList";

export default function Inventory() {

    const {setIsProductFormModalOpen} = useProductFormContext();
    return ( 
      <div className="w-full">
        <div className="px-4 h-screen">
          <div className=" px-4 py-2.5">
            <Button  className="ml-auto" onClick={()=>setIsProductFormModalOpen(true)}>Add Product</Button>
          </div>
        <InventoryList />
        </div>
      </div> 
    );
  }