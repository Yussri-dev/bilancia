import apiClient from "./apiClient";

const adviceApi = {
    // --- Analyse rule-based (sans IA) ---
    getSavingsAdvice: async (token, months = 3, targetPct = 0.2) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get(`/advice/savings?months=${months}&targetPct=${targetPct}`);
        return res.data;
    },

    // --- Historique des conseils (GET /api/adviceLog) ---
    getLogs: async (token) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get("/adviceLog");
        return res.data;
    },

    // --- Détail d’un conseil spécifique (GET /api/adviceLog/{id}) ---
    getLogById: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.get(`/adviceLog/${id}`);
        return res.data;
    },

    // --- Ajouter un conseil dans l’historique (POST /api/adviceLog) ---
    createLog: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/adviceLog", dto);
        return res.data;
    },

    // --- Supprimer un conseil de l’historique (DELETE /api/adviceLog/{id}) ---
    deleteLog: async (token, id) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.delete(`/adviceLog/${id}`);
        return res.data;
    },

    // --- Générer un conseil via IA (POST /api/adviceLog/generate) ---
    generateAiAdvice: async (token, dto) => {
        apiClient.setAuthToken(token);
        const res = await apiClient.post("/adviceLog/generate", dto);
        return res.data;
    },
};

export default adviceApi;