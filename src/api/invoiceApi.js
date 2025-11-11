// src/api/invoiceApi.js
import apiClient from "./apiClient";

// Helper pour convertir les booléens string -> bool
const convertBooleans = (obj) => {
    const converted = { ...obj };
    for (const key in converted) {
        if (converted[key] === "true") converted[key] = true;
        if (converted[key] === "false") converted[key] = false;
    }
    return converted;
};

export const invoiceApi = {
    // POST /api/invoice
    create: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/invoice", dto);
        return res.data;
    },

    // GET /api/invoice
    getAll: async (token) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/invoice");
        return res.data?.map(convertBooleans) || [];
    },

    getInvoices: async (token) => {
        return await invoiceApi.getAll(token);
    },

    // PUT /api/invoice/{id}
    update: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.put(`/invoice/${id}`, dto);
        return res.data;
    },

    // DELETE /api/invoice/{id}
    delete: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.delete(`/invoice/${id}`);
        return res.data;
    },

    // POST /api/invoice/{id}/validate-to-transaction
    validateToTransaction: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post(`/invoice/${id}/validate-to-transaction`, dto);
        return res.data;
    },
};

export default invoiceApi;
