import axios from "axios"
import { BASE_URL } from "utils"

export async function createProduct(formData: any){
    try{
        const response = await axios.post(`${BASE_URL}/add-product`,{
            title: formData?.title,
            description: formData?.description,
            amount: formData?.price,
            totalInventory: formData?.quantity,

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