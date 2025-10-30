// src/api/invoiceApi.js
import axios from "axios";

const API_BASE = "https://saasfinanceapp-v8zp.onrender.com/api/invoice";

const convertBooleans = (obj) => {
    const converted = { ...obj };
    Object.keys(converted).forEach(key => {
        if (converted[key] === 'true') converted[key] = true;
        if (converted[key] === 'false') converted[key] = false;
    });
    return converted;
};

export const invoiceApi = {
    createInvoice: async (token, dto) => {
        const res = await axios.post(API_BASE, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    getInvoices: async (token) => {
        const res = await axios.get(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.map(invoice => convertBooleans(invoice)) || [];
    },

    getAll: async (token) => {
        const res = await axios.get(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.map(invoice => convertBooleans(invoice)) || [];
    },

    updateInvoice: async (token, id, dto) => {
        const res = await axios.put(`${API_BASE}/${id}`, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    deleteInvoice: async (token, id) => {
        const res = await axios.delete(`${API_BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    validateToTransaction: async (token, id, dto) => {
        const res = await axios.post(
            `${API_BASE}/${id}/validate-to-transaction`,
            dto,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return res.data;
    },
};

export default invoiceApi;