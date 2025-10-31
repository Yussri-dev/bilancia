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
    }
}
/*

je veux faire alias babel : 
pour les apis et les screens on va débuteer avec les apis et apres on rajoute les screens : 

*/