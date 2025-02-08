import { usePopUpContext } from 'contexts/PopupContext';
import { useProductContext } from 'contexts/ProductContext';
import { useProductFormContext } from 'contexts/ProductFormContext';
import {Trash, Edit} from 'lucide-react'
export interface Product {
    id: string
    title: string
    description: string
    image: string
    totalInventory: number
    url: string
    amount: number
  }

  
  export default function ProductCard({ product }: { product: Product }) {

    const { setProduct } = useProductContext();
    const { setIsModalOpen } = usePopUpContext()
    const { setIsProductFormModalOpen } = useProductFormContext()
    return (
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
            <td className="px-6 py-4">
                {product?.image && <img src={product.image} alt={product.title} className="w-16 h-16 object-cover" />}
            </td>
            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {product.title}
            </th>
            <td className="px-6 py-4">
                {product.totalInventory}
            </td>
            <td className="px-6 py-4">
                {product.description}
            </td>
            <td className="px-6 py-4">
                {product.amount}
            </td>
            <td className="px-6 py-4 flex space-x-2 items-center mt-2">
                <div className="transition-all rounded-lg bg-gray-300 p-2 duration-200 bg-opacity-40 hover:bg-opacity-80"
                    onClick={()=> {
                        setProduct(product)
                        setIsProductFormModalOpen(true)
                    }}
                >
                    <Edit />
                </div>
                <div 
                    className="transition-all rounded-lg bg-gray-300 duration-200 p-2 bg-opacity-40 hover:bg-opacity-80" 
                    onClick={() => {
                        setProduct(product)
                        setIsModalOpen(true)
                    }} 
                >
                    <Trash className="text-red-500"/>
                </div>
            </td>
        </tr>   
    )
}
