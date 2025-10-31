// src/api/transactionApi.js
import apiClient from "./apiClient";

// Helper : convertir les booléens string → bool
const convertBooleans = (obj) => {
    const converted = { ...obj };
    for (const key in converted) {
        if (converted[key] === "true") converted[key] = true;
        if (converted[key] === "false") converted[key] = false;
    }
    return converted;
};

const transactionApi = {
    // GET /api/transaction
    getMyTransactions: async (token) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/transaction");
        const list = res.data || [];

        // Normalize keys (camelCase support)
        return list.map((t) => ({
            id: t.id ?? t.Id,
            amount: t.amount ?? t.Amount,
            date: t.date ?? t.Date,
            description: t.description ?? t.Description,
            categoryId: t.categoryId ?? t.CategoryId,
            categoryName: t.categoryName ?? t.CategoryName,
            type: (t.type ?? t.Type)?.toLowerCase() || "expense",
        }));
    },

    // POST /api/transaction
    create: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/transaction", dto);
        return res.data;
    },

    // PUT /api/transaction/{id}
    update: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.put(`/transaction/${id}`, dto);
        return res.data;
    },

    // DELETE /api/transaction/{id}
    delete: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.delete(`/transaction/${id}`);
        return res.data;
    },

    // GET /api/Transaction/range?startUtc=...&endUtc=...
    getByRange: async (token, startUtc, endUtc) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/transaction/range", {
            params: { startUtc, endUtc },
        });
        return res.data?.map(convertBooleans) || [];
    },

    // GET /api/transaction/paged?page=1&pageSize=25
    getPaged: async (token, page = 1, pageSize = 25) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/transaction/paged", {
            params: { page, pageSize },
        });

        if (res.data?.items) {
            return {
                ...res.data,
                items: res.data.items.map(convertBooleans),
            };
        }
        return res.data?.map(convertBooleans) || [];
    },
};

export default transactionApi;