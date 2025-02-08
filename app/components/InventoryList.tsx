import { getProducts } from "~/api/getProductList"
import ProductCard, { Product } from "./ProductCard"
import { useContext, useEffect, useState } from "react"
import { PopUpContext } from "contexts/PopupContext";
import PopUpModal from "~/components/PopUpModal"
import { useProductListContext } from "contexts/ProductListContext";
function InventoryList() {
    // const [products, setProducts] = useState(null);
    const productListContext = useProductListContext()
    const { productList, setProductList } = productListContext;
    async function getList(){
        const response = await getProducts()
        if(response!== null) {
            const cleanedRes = response?.data?.map((product: any) => ({
                totalInventory: product.node.totalInventory,
                id: product.node.id,
                title: product.node.title,
                description: product.node.description,
                image: product.node.featuredImage?.url || "https://archive.org/download/placeholder-image/placeholder-image.jpg", // Handle null images
                amount: product.node.priceRange.maxVariantPrice.amount
            }));

            setProductList(cleanedRes);
        }
        }
        const context = useContext(PopUpContext);
        if (!context) {
        throw new Error("PopUpContext must be used within a PopUpProvider");
        }
        const { isModalOpen, setIsModalOpen } = context;
    useEffect(()=> {
        getList()
    }, [])
    
  return (
    <div className="p-4 h-full overflow-y-scroll">
        <PopUpModal />
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        image
                    </th>
                    <th scope="col" className="px-6 py-3">
                        title
                    </th>
                    <th scope="col" className="px-6 py-3">
                        totalInventory
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Description
                    </th>
                    <th scope="col" className="px-6 py-3">
                        amount
                    </th>
                    <th scope="col" className="px-6 py-3">
                        action
                    </th>
                </tr>
            </thead>
            <tbody>
                {productList && productList.map((product: Product) => (
                <ProductCard key={product?.id} product={product} />
            ))}

            </tbody>
        </table>

    </div>
      
  )
}

export default InventoryList