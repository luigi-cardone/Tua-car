import axios from "axios";
const BASE_URL = 'https://new.leads.tua-car.it'
//https://new.leads.tua-car.it
//http://localhost:8000
export default axios.create({
    baseURL: BASE_URL
})


export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers : { 'Content-Type' : 'application/json'},
    withCredentials : true
})