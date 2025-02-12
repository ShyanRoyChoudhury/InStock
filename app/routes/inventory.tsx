'use client'

import { useProductFormContext } from "contexts/ProductFormContext";
import { Button } from "flowbite-react";
import { Plus, PlusCircle } from "lucide-react";
import InventoryList from "~/components/InventoryList";

export default function Inventory() {

    const {setIsProductFormModalOpen} = useProductFormContext();
    return ( 
      <div className="w-full">
        <div className="px-4 h-screen">
          <div className="flex justify-between items-center px-4 py-2.5 mt-6 bg-gray-50 shadow-sm rounded-lg">
            <div>
              <h1 className="text-2xl md:text-3xl text-wrap whitespace-nowrap text-gray-600 font-bold">Listing</h1>
            </div>

            <div className=" px-4 py-2.5">
              <div  className="bg-black cursor-pointer space-x-1.5 flex text-white px-2 py-1.5 rounded-lg" onClick={()=>setIsProductFormModalOpen(true)}>
                <PlusCircle className="text-xl"/>
                <p>Product</p>
              </div>
            </div>
          </div>
          <InventoryList />
        </div>
      </div> 
    );
  }