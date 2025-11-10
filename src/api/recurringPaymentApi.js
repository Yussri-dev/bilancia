// src/api/recurringPaymentApi.js
import apiClient from "@apiClient";

// Helper : convertir les booléens string → bool
const convertBooleans = (obj) => {
    const converted = { ...obj };
    for (const key in converted) {
        if (converted[key] === "true") converted[key] = true;
        if (converted[key] === "false") converted[key] = false;
    }
    return converted;
};

export const recurringPaymentApi = {
    // GET /api/RecurringPayment
    getAll: async (token) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/RecurringPayment");
        return res.data?.map(convertBooleans) || [];
    },

    // POST /api/RecurringPayment
    create: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/RecurringPayment", dto);
        return res.data;
    },

    // PUT /api/RecurringPayment/{id}
    update: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.put(`/RecurringPayment/${id}`, dto);
        return res.data;
    },

    // DELETE /api/RecurringPayment/{id}
    delete: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.delete(`/RecurringPayment/${id}`);
        return res.data;
    },

    // POST /api/RecurringPayment/{id}/pay
    markAsPaid: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post(`/RecurringPayment/${id}/pay`);
        return res.data;
    },
};
