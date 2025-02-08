import axios from "axios"
import { BASE_URL } from "utils"

export async function editProduct(formData: any, id: string){
    try{
        const response = await axios.put(`${BASE_URL}/update-product`,{
            id,
            title: formData?.title
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