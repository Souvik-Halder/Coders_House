import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../store/authSlice";
import axios from "axios";


export function useLoadingWithRefresh(){
    const [loading, setLoading] = useState(true);
    const dispatch=useDispatch();
    useEffect(() => {
        //here we making the function and then imediately calling it
       (async()=>{
        try {
           const {data} = await axios.get(`${process.env.REACT_APP_API_URL}/api/refresh`, {
                     withCredentials: true,
                 }
                 );
                 
                 dispatch(setAuth(data));
                 setLoading(false)
                 console.log(data);
                
 
             } catch (error) {
                     console.log(error.message);
                     setLoading(false);
             }
       })();
    }, []);

    return {loading};
}