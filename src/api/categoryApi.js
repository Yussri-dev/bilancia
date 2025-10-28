// src/api/categoryApi.js
import axios from "axios";

const API_BASE = "https://saasfinanceapp-v8zp.onrender.com/api/category";

// Helper function to convert string booleans
const convertBooleans = (obj) => {
    const converted = { ...obj };
    Object.keys(converted).forEach(key => {
        if (converted[key] === 'true') converted[key] = true;
        if (converted[key] === 'false') converted[key] = false;
    });
    return converted;
};

export const categoryApi = {
    // POST /api/category
    createCategory: async (token, dto) => {
        const res = await axios.post(API_BASE, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // GET /api/category
    getCategories: async (token) => {
        const res = await axios.get(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.map(category => convertBooleans(category)) || [];
    },

    // GET /api/category (same as getCategories)
    getMyCategories: async (token) => {
        const res = await axios.get(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.map(category => convertBooleans(category)) || [];
    },

    // PUT /api/category/{id}
    updateCategory: async (token, id, dto) => {
        const res = await axios.put(`${API_BASE}/${id}`, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // DELETE /api/category/{id}
    deleteCategory: async (token, id) => {
        const res = await axios.delete(`${API_BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // POST /api/Goal/{id}/contribute
    contributeAsync: async (token, id, amount) => {
        const res = await axios.post(
            `https://saasfinanceapp-v8zp.onrender.com/api/Goal/${id}/contribute`,
            amount,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return res.data;
    },
};