'use client'

import { Button } from "flowbite-react";
import InventoryList from "~/components/InventoryList";
import { ProductForm } from "~/components/ProductForm";

export default function Inventory() {

  
    return ( 
      <div className="w-full">
        <div className="px-4 h-screen">
          <div className=" px-4 py-2.5">
            <Button  className="ml-auto">Add Product</Button>
          </div>
        <InventoryList />
        </div>
      </div> 
    );
  }