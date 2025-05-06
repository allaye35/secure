import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api"
});

// Configuration simple sans authentification
api.interceptors.request.use(config => {
    // Gestion automatique du Content-Type
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else {
        config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
}, error => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
});

// Gestion simplifiée des erreurs
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error(
                `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
                `Status: ${error.response.status}`
            );
        } else if (error.request) {
            console.error("API Error: No response received");
        } else {
            console.error("API Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
