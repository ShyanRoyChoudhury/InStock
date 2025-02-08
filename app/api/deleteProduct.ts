import axios from "axios"
import { BASE_URL } from "utils"

export async function deleteProduct(id: string){
    try{
        const response = await axios.post(`${BASE_URL}/delete-product`,{
            id
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