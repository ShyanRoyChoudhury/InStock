import axios from "axios"
import { BASE_URL } from "utils"

export async function createProduct(formData: any){
    try{
        console.log("formdata", JSON.stringify(formData))
        console.log("Object.values(formData?.variants)", Object.values(formData?.variants))
        const variants = formData.variants.map((variant) => ({
            name: variant.name,
            value: variant.values.map((value) => ({ name: value.name })), // Ensure "value" is an array of objects
        }));

        const prices = formData.prices.map((price) => ({
            variant: price.variant, // Ensure variant is an object
            amount: price.amount, // Ensure amount is a string or number
        }));
        const response = await axios.post(`${BASE_URL}/add-product`,{
            title: formData?.title,
            description: formData?.description,
            // amount: formData?.price,
            // totalInventory: formData?.quantity,
            variant: variants,
            price: prices,

        },{
            headers: {
                "Content-Type": "application/json"
            }
        })
        if(response?.data?.status === "Success") return response.data;
        return null;
    }catch(error){
        console.error("erropr", error)
    }
}