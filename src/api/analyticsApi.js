// src/api/analyticsApi.js
import apiClient from "./apiClient";

const AnalyticsApi = {
    // --- 1) Overview ---
    async getOverview() {
        const res = await apiClient.get("/analytics/overview");
        return res.data;
    },

    // --- 2) Monthly history ---
    async getMonthlyHistory() {
        const res = await apiClient.get("/analytics/monthly-history");
        return res.data;
    },

    // --- 3) Average monthly expense ---
    async getAverageMonthlyExpense() {
        const res = await apiClient.get("/analytics/average-monthly-expense");
        return res.data;
    },

    // --- 4) Top expense categories ---
    async getTopExpenseCategories() {
        const res = await apiClient.get("/analytics/top-expense-categories");
        return res.data;
    },

    // --- 5) Income/Expense ratio ---
    async getIncomeExpenseRatio() {
        const res = await apiClient.get("/analytics/income-expense-ratio");
        return res.data;
    },

    // --- 6) Prediction ---
    async getNextMonthPrediction() {
        const res = await apiClient.get("/analytics/predict-expense-next-month");
        return res.data;
    },

    // --- 7) Monthly MoM (month-over-month) ---
    async getMonthlyMoM(from = null, to = null) {
        const query = [];
        if (from) query.push(`from=${encodeURIComponent(from)}`);
        if (to) query.push(`to=${encodeURIComponent(to)}`);
        const qs = query.length ? `?${query.join("&")}` : "";
        const res = await apiClient.get(`/analytics/monthly-mom${qs}`);
        return res.data;
    },

    // --- 8) Export reports (PDF / Excel) ---
    async exportReport(format = "pdf") {
        if (!["pdf", "excel"].includes(format.toLowerCase())) {
            throw new Error("Invalid format. Use 'pdf' or 'excel'.");
        }

        try {
            const res = await apiClient.get(`/analytics/export?format=${format}`);

            console.log("Export API Response:", res);
            console.log("Export API Response Data:", res.data);

            // Validate response structure
            if (!res.data) {
                throw new Error("No data received from export API");
            }

            if (!res.data.base64) {
                console.error("Response data:", JSON.stringify(res.data));
                throw new Error("base64 data missing from API response");
            }

            if (!res.data.fileName) {
                console.error("Response data:", JSON.stringify(res.data));
                throw new Error("fileName missing from API response");
            }

            return {
                base64: res.data.base64,
                fileName: res.data.fileName
            };
        } catch (error) {
            console.error("Export API Error:", error);
            console.error("Error response:", error.response?.data);
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                "Failed to export report"
            );
        }
    },
};

export default AnalyticsApi;