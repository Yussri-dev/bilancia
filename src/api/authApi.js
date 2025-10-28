//authApi
import axios from "axios"

const API_BASE = "https://saasfinanceapp-v8zp.onrender.com/api/auth";

export const loginUser = async (data) => {
    const res = await axios.post(`${API_BASE}/login`, data);
    return res.data;
};

export const registerUser = async (data) => {
    const res = await axios.post(`${API_BASE}/register`, data);
    return res.data;
};

export const getProfile = async (token) => {
    const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};