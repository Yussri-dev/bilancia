// src/api/transactionApi.js
import axios from "axios";

// const API_BASE = "https://saasfinanceapp-v8zp.onrender.com/api/transaction";
const API_BASE = "https://saasfinanceapp-v8zp.onrender.com/api/transaction";

// Helper function to convert string booleans
const convertBooleans = (obj) => {
    const converted = { ...obj };
    Object.keys(converted).forEach(key => {
        if (converted[key] === 'true') converted[key] = true;
        if (converted[key] === 'false') converted[key] = false;
    });
    return converted;
};

export const transactionApi = {
    // GET /api/transaction
    getMyTransactions: async (token) => {
        try {
            const res = await axios.get(API_BASE, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const list = res.data || [];
            return list.map((t) => ({
                id: t.id ?? t.Id,
                amount: t.amount ?? t.Amount,
                date: t.date ?? t.Date,
                description: t.description ?? t.Description,
                categoryId: t.categoryId ?? t.CategoryId,
                categoryName: t.categoryName ?? t.CategoryName,
                type: (t.type ?? t.Type)?.toLowerCase() || "expense", // normalize
            }));
        } catch (error) {
            console.error("Error fetching transactions:", error.message);
            throw error;
        }
    },
    // POST /api/transaction
    createTransaction: async (token, dto) => {
        const res = await axios.post(API_BASE, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // PUT /api/transaction/{id}
    updateTransaction: async (token, id, dto) => {
        const res = await axios.put(`${API_BASE}/${id}`, dto, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // DELETE /api/transaction/{id}
    deleteTransaction: async (token, id) => {
        const res = await axios.delete(`${API_BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // GET /api/Transaction/range?startUtc=...&endUtc=...
    getByRange: async (token, startUtc, endUtc) => {
        const res = await axios.get(`${API_BASE}/range`, {
            params: { startUtc, endUtc },
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.map(transaction => convertBooleans(transaction)) || [];
    },

    // GET /api/transaction/paged?page=1&pageSize=25
    getPagedTransactionsAsync: async (token, page = 1, pageSize = 25) => {
        const res = await axios.get(`${API_BASE}/paged`, {
            params: { page, pageSize },
            headers: { Authorization: `Bearer ${token}` },
        });
        // Handle paged response structure
        if (res.data?.items) {
            return {
                ...res.data,
                items: res.data.items.map(transaction => convertBooleans(transaction))
            };
        }
        return res.data?.map(transaction => convertBooleans(transaction)) || [];
    },
};