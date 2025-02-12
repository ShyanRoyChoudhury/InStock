import { getProducts } from "~/api/getProductList"
import ProductCard, { Product } from "./ProductCard"
import { useContext, useEffect, useState } from "react"
import { PopUpContext } from "contexts/PopupContext";
import PopUpModal from "~/components/PopUpModal"
import { useProductListContext } from "contexts/ProductListContext";
import ProductModal from "./ProductModal";

function InventoryList() {
    const productListContext = useProductListContext();
    const { productList, setProductList } = productListContext;

    async function getList() {
        const response = await getProducts();
        if (response !== null) {
            const cleanedRes = response?.data?.map((product: any) => ({
                totalInventory: product.node.totalInventory,
                id: product.node.id,
                title: product.node.title,
                description: product.node.description,
                image: product.node.featuredImage?.url || "/photo.png",
                amount: product.node.priceRange.maxVariantPrice.amount,
                handle: product?.node?.handle
            }));

            setProductList(cleanedRes);
        }
    }


    useEffect(() => {
        getList();
    }, []);

    return (
        <div className="p-4 h-full overflow-y-scroll">
            <PopUpModal />
            <ProductModal />

            {/* Scrollable Table for Small Screens */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className=" hidden md:table-header-group text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-2">Image</th>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2 hidden sm:table-cell">Inventory</th>
                            <th className="px-4 py-2 hidden md:table-cell">Description</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productList && productList.map((product: Product) => (
                            <ProductCard key={product?.id} product={product} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default InventoryList;
