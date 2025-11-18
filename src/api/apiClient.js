import axios from "axios";

const API_BASE_URL = "https://saasfinanceapp-v8zp.onrender.com/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
});

apiClient.setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common["Authorization"];
    }
};

//  Retry once automatically if a network error
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.config._retry && !error.response) {
            error.config._retry = true;
            console.warn("Retrying request once due to network error...");
            return apiClient(error.config);
        }

        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            Object.values(error.response?.data?.errors || {})[0]?.[0] ||
            error.response?.data?.title ||
            "Erreur réseau ou serveur";

        console.error("API error:", message);
        return Promise.reject(new Error(message));
    }
);


export default apiClient;
