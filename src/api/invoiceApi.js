// src/api/invoiceApi.js
import apiClient from "./apiClient";

// --- Helper : convertir "true"/"false" en bool --- //
const convertBooleans = (obj) => {
    const converted = { ...obj };
    for (const key in converted) {
        if (converted[key] === "true") converted[key] = true;
        if (converted[key] === "false") converted[key] = false;
    }
    return converted;
};

// --- Normalisation complète d'une facture --- //
const normalizeInvoice = (i) => {
    if (!i) return null;

    // Cas : API renvoie juste { id: X } après Create
    if (i.id && Object.keys(i).length === 1) {
        return { id: i.id, success: true };
    }

    const invoice = convertBooleans({
        id: i.id ?? i.Id,
        client: i.client ?? i.Client,
        amount: i.amount ?? i.Amount,
        tax: i.tax ?? i.Tax,
        status: i.status ?? i.Status,
        issueDate: i.issueDate ?? i.IssueDate,
        paidDate: i.paidDate ?? i.PaidDate,
    });

    // Total calculé
    invoice.total = Number(invoice.amount || 0) + Number(invoice.tax || 0);

    return invoice;
};

export const invoiceApi = {
    // --- POST /api/invoice --- //
    create: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/invoice", dto);

        // API renvoie { id: x }
        return normalizeInvoice(res.data);
    },

    // --- GET /api/invoice --- //
    getAll: async (token) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/invoice");

        return (res.data || []).map((i) => normalizeInvoice(i));
    },

    getInvoices: async (token) => await invoiceApi.getAll(token),

    // --- PUT /api/invoice/{id} --- //
    update: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.put(`/invoice/${id}`, dto);

        // Si 204 NoContent → aucune data
        if (!res.data) return { success: true };

        return normalizeInvoice(res.data);
    },

    // --- DELETE /api/invoice/{id} --- //
    delete: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.delete(`/invoice/${id}`);

        // API retourne 204 NoContent
        if (!res.data) return { success: true };

        return res.data;
    },

    // --- POST /api/invoice/{id}/validate-to-transaction --- //
    validateToTransaction: async (token, id, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post(`/invoice/${id}/validate-to-transaction`, dto);

        return res.data || { success: true };
    },
};

export default invoiceApi;
