import apiClient from "./apiClient";

export const authApi = {
    login: async (data) => {
        const res = await apiClient.post("/auth/login", data);
        return res.data;
    },

    register:async (data)=>{
        const res = await apiClient.post("/auth/register",data);
        return res.data;
    },

    getProfile: async (token) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/auth/profile");
        return res.data;
    },
    
    forgotPassword: async (data) => {
        const res = await apiClient.post("/auth/forgot-password", data);
        return res.data;
    },
}