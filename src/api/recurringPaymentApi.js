// src/api/recurringPaymentApi.js
import axios from "axios";

const API_BASE = "https://saasfinanceapp-v8zp.onrender.com/api/RecurringPayment";

// Helper function to convert string booleans
const convertBooleans = (obj) => {
    const converted = { ...obj };
    Object.keys(converted).forEach(key => {
        if (converted[key] === 'true') converted[key] = true;
        if (converted[key] === 'false') converted[key] = false;
    });
    return converted;
};

export const recurringPaymentApi = {
    // GET /api/RecurringPayment
    getAllAsync: async (token) => {
        const res = await axios.get(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.map(payment => convertBooleans(payment)) || [];
    },

    // POST /api/RecurringPayment
    createAsync: async (token, dto) => {
        const res = await axios.post(API_BASE, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // PUT /api/RecurringPayment/{id}
    updateAsync: async (token, id, dto) => {
        const res = await axios.put(`${API_BASE}/${id}`, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // DELETE /api/RecurringPayment/{id}
    deleteAsync: async (token, id) => {
        const res = await axios.delete(`${API_BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // POST /api/RecurringPayment/{id}/pay
    markAsPaidAsync: async (token, id) => {
        const res = await axios.post(`${API_BASE}/${id}/pay`, null, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
};