import axios from 'axios'
import { BASE_URL } from 'utils'

export async function getProducts(){
    try{
        const response = await axios.get(`${BASE_URL}/products`)
        console.log('response', response);
        if(response?.data?.status === "Success") return response.data;
        return null;
    }catch(error){
        console.log("error", error)
    }
}