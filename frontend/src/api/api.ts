import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3999/api",
});

export default API;
