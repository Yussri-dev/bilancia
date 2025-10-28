import axios from "axios";

const API_BASE = "https://saasfinanceapp-v8zp.onrender.com/api/Goal";

export const goalApi = {
    getGoals: async (token, activeOnly) => {
        const res = await axios.get(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
            params: { activeOnly },
        });
        return res.data;
    },

    createGoal: async (token, dto) => {
        const res = await axios.post(API_BASE, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    updateGoal: async (token, id, dto) => {
        const res = await axios.put(`${API_BASE}/${id}`, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    deleteGoal: async (token, id) => {
        const res = await axios.delete(`${API_BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    contributeAsync: async (token, id, amount) => {
        const res = await axios.post(`${API_BASE}/${id}/contribute`, amount, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return res.data;
    },
};
