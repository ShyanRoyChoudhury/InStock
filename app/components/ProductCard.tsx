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

  
//   export default function ProductCard({ product }: { product: Product }) {

//     const { setProduct } = useProductContext();
//     const { setIsModalOpen } = usePopUpContext()
//     const { setIsProductFormModalOpen } = useProductFormContext()
//     return (
//         <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
//             <td className="px-6 py-4">
//                 {product?.image && <img src={product.image} alt={product.title} className="w-16 h-16 object-cover" />}
//             </td>
//             <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                 {product.title}
//             </th>
//             <td className="px-6 py-4">
//                 {product.totalInventory}
//             </td>
//             <td className="px-6 py-4">
//                 {product.description}
//             </td>
//             <td className="px-6 py-4">
//                 {product.amount}
//             </td>
//             <td className="px-6 py-4 flex space-x-2 items-center mt-2">
//                 <div className="transition-all rounded-lg bg-gray-300 p-2 duration-200 bg-opacity-40 hover:bg-opacity-80"
//                     onClick={()=> {
//                         setProduct(product)
//                         setIsProductFormModalOpen(true)
//                     }}
//                 >
//                     <Edit />
//                 </div>
//                 <div 
//                     className="transition-all rounded-lg bg-gray-300 duration-200 p-2 bg-opacity-40 hover:bg-opacity-80" 
//                     onClick={() => {
//                         setProduct(product)
//                         setIsModalOpen(true)
//                     }} 
//                 >
//                     <Trash className="text-red-500"/>
//                 </div>
//             </td>
//         </tr>   
//     )
// }


export default function ProductCard({ product }: { product: Product }) {
    const { setProduct } = useProductContext();
    const { setIsModalOpen } = usePopUpContext();
    const { setIsProductFormModalOpen } = useProductFormContext();

    return (
        <>
            {/* Desktop View: Table Row */}
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hidden sm:table-row">
                <td className="px-4 py-2">
                    <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded-md" />
                </td>
                <th className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {product.title}
                </th>
                <td className="px-4 py-2 hidden sm:table-cell">{product.totalInventory}</td>
                <td className="px-4 py-2 hidden md:table-cell">{product.description}</td>
                <td className="px-4 py-2">{product.amount}</td>
                <td className="px-4 py-2 flex space-x-2 items-center">
                    <button
                        className="transition-all rounded-lg bg-gray-300 p-2 hover:bg-opacity-80"
                        onClick={() => {
                            setProduct(product);
                            setIsProductFormModalOpen(true);
                        }}
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        className="transition-all rounded-lg bg-gray-300 p-2 hover:bg-opacity-80"
                        onClick={() => {
                            setProduct(product);
                            setIsModalOpen(true);
                        }}
                    >
                        <Trash className="text-red-500" size={18} />
                    </button>
                </td>
            </tr>

            {/* Mobile View: Card Layout */}
            <div className="sm:hidden p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 my-2">
                <div className="flex items-center space-x-4">
                    <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{product.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                        <p className="text-md font-bold text-gray-700 dark:text-gray-300">₹{product.amount}</p>
                    </div>
                </div>
                <div className="flex justify-between mt-4">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-all"
                        onClick={() => {
                            setProduct(product);
                            setIsProductFormModalOpen(true);
                        }}
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-all"
                        onClick={() => {
                            setProduct(product);
                            setIsModalOpen(true);
                        }}
                    >
                        <Trash className="text-red-500" size={18} />
                    </button>
                </div>
            </div>
        </>
    );
}
