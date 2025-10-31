// src/api/categoryApi.js
import apiClient from "./apiClient";

const categoryApi = {
    //  Get all categories of the current user
    getMyCategories: async (token) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/category");
        return res.data;
    },

    //  Create a new category
    createCategory: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/category", dto);
        return res.data;
    },

    //  Update existing category
    updateCategory: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.put(`/category/${id}`, dto);
        return res.data;
    },

    //  Delete a category
    deleteCategory: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.delete(`/category/${id}`);
        return res.data;
    },
};

export default categoryApi;
