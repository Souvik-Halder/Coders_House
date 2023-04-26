
import axios from 'axios';

const api=axios.create({
    baseURL:process.env.REACT_APP_API_URL,
    headers:{
        'Content-Type':'application/json',
        'Accept':'application/json'
    }
    // http://localhost:5500/api/send-otp
})





//List of all the endpoints

export const sendOtp =async (data)=> api.post('/api/send-otp',data);

export const verifyOtp=(data)=>api.post('/api/verify-otp',data);



export default api;