import axios from "axios"
import { BASE_URL } from "utils"

export const getProductDetails = async (id: string) => {
    try{
        console.log('hit')
        const res = await axios.get(`${BASE_URL}/product?id=gid://shopify/Product/${id}`)
        console.log('response', res);
        if(res?.data?.status === "Success") return res.data;
        return null;
    }catch(err){
        console.error(err);
        return 
    }

}
