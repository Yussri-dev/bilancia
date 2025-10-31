// src/api/goalApi.js
import apiClient from "./apiClient";

export const goalApi = {
    // GET /api/Goal?activeOnly=true
    getAll: async (token, activeOnly = false) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/Goal", { params: { activeOnly } });
        return res.data;
    },

    // POST /api/Goal
    create: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/Goal", dto);
        return res.data;
    },

    // PUT /api/Goal/{id}
    update: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.put(`/Goal/${id}`, dto);
        return res.data;
    },

    // DELETE /api/Goal/{id}
    delete: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.delete(`/Goal/${id}`);
        return res.data;
    },

    // POST /api/Goal/{id}/contribute
    contribute: async (token, id, amount) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post(`/Goal/${id}/contribute`, amount);
        return res.data;
    },
};
