// src/services/api.js
import axios from "axios";

const api = axios.create({
    // D'après les logs du serveur, le port 8080 est correct
    baseURL: "http://localhost:8080/api",
    // Forcer axios à ne pas transformer les données automatiquement pour FormData
    transformRequest: [(data) => data]
});

// Configuration des intercepteurs de requêtes
api.interceptors.request.use(config => {
    // Assurons-nous que headers existe
    if (!config.headers) config.headers = {};
      // CRUCIAL: Pour les requêtes FormData avec multipart/form-data
    if (config.data instanceof FormData) {
        // PURGE complète des en-têtes Content-Type pour éviter l'erreur 415
        delete config.headers['Content-Type'];
        if (config.headers.common) delete config.headers.common['Content-Type'];
        
        // Le browser doit automatiquement définir multipart/form-data avec boundary
        console.log("📤 Envoi en FormData vers:", config.url);
        console.log("📤 Headers:", Object.entries(config.headers).map(([k,v]) => `${k}: ${v}`).join(", "));
        
        try {
            // Affichage détaillé du contenu FormData pour debug
            const formDataEntries = [...config.data.entries()];
            console.log("FormData contient:", formDataEntries.length, "éléments:");
            formDataEntries.forEach(e => {
                const [key, value] = e;
                if (typeof value === 'object') {
                    if (value instanceof File) {
                        console.log(`- ${key}: File [${value.name}, ${value.type}, ${value.size} bytes]`);
                    } else if (value instanceof Blob) {
                        console.log(`- ${key}: Blob [${value.type}, ${value.size} bytes]`);
                    } else {
                        console.log(`- ${key}: Object`);
                    }
                } else {
                    console.log(`- ${key}: ${typeof value === 'string' ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : value}`);
                }
            });
        } catch (error) {
            console.error("Erreur lors de l'inspection du FormData:", error);
        }
    } else {
        // Par défaut, utiliser JSON
        config.headers['Content-Type'] = 'application/json';
        console.log("📤 Envoi en JSON:", config.url, config.data);
    }
    
    return config;
}, error => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
});

// Gestion des réponses et erreurs
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error(
                `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
                `Status: ${error.response.status}`,
                error.response.data
            );
        } else if (error.request) {
            console.error("API Error: No response received", error.request);
        } else {
            console.error("API Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
