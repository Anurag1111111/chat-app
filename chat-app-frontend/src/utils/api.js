import axios from 'axios';

const API = axios.create({
    baseURL : 'https://chat-app-production-dfe7.up.railway.app/api',
    withCredentials : true,
})

API.interceptors.request.use((req)=>{
    const token = localStorage.getItem("token");
    if (token){
        req.headers.Authorization = `Bearer ${token}`
    }
    return req;
})

export default API;