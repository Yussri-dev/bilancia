// src/api/goalApi.js
import apiClient from "./apiClient";

export const goalApi = {
    getAll: async (token, activeOnly = false) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/Goal", { params: { activeOnly } });
        return res.data;
    },

    create: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/Goal", dto);
        return res.data;
    },

    update: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.put(`/Goal/${id}`, dto);
        return res.data;
    },

    delete: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.delete(`/Goal/${id}`);
        return res.data;
    },

    contribute: async (token, id, amount) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post(`/Goal/${id}/contribute`, { amount });
        return res.data;
    },
};
