// src/api/analyticsApi.js
import apiClient from "./apiClient";
import { Buffer } from "buffer";

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

        const res = await apiClient.get(`/analytics/export?format=${format}`, {
            responseType: "arraybuffer", // get file bytes
        });

        // return { contentType, fileName, base64 }
        const contentType =
            res.headers["content-type"] ||
            (format === "pdf"
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        const contentDisposition = res.headers["content-disposition"];
        const fileNameMatch = contentDisposition?.match(/filename\*?="?([^";]+)"?/i);
        const fileName =
            decodeURIComponent(fileNameMatch?.[1] || "") ||
            (format === "pdf"
                ? "transaction_history_report.pdf"
                : "transaction_history_report.xlsx");

        const base64 = Buffer.from(res.data, "binary").toString("base64");

        return { base64, contentType, fileName };
    },
};

export default AnalyticsApi;
