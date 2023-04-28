
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    // http://localhost:5500/api/send-otp
})





//List of all the endpoints

export const sendOtp = async (data) => api.post('/api/send-otp', data);

export const verifyOtp = (data) => api.post('/api/verify-otp', data);

export const activate = (data) => api.post('/api/activate', data);

export const logout=()=> api.post('/api/logout');

export const createRoom=(data)=>api.post('/api/rooms',data)

export const getAllRooms=()=>api.get('/api/rooms');

// Interceptors to get the access token from the refresh token after access token expires we will generate the accessToken from RefreshToken 
api.interceptors.response.use(
    (config) => {
        return config;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && originalRequest && !originalRequest.isRetry) {
            originalRequest._isRetry = true;
            try {
           await axios.get(`${process.env.REACT_APP_API_URL}/api/refresh`, {
                    withCredentials: true,
                }
                );

                return api.request(originalRequest)

            } catch (error) {
                    console.log(error.message);
            }
        }
        throw error;
    })

export default api;