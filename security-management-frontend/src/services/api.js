import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api"
    // Ne pas définir Content-Type ici, laissez Axios le déterminer automatiquement
});

// Interceptor pour les requêtes: AUTHENTIFICATION COMPLÈTEMENT DÉSACTIVÉE
api.interceptors.request.use(config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data || "");
    
    // Vérifier si les données sont de type FormData et ne pas définir Content-Type
    if (config.data instanceof FormData) {
        // Pour FormData, laisser Axios définir automatiquement les en-têtes avec boundary
        // Assurez-vous de supprimer tout Content-Type prédéfini
        delete config.headers['Content-Type'];
    } else {
        // Pour les autres types de données (JSON par défaut)
        config.headers['Content-Type'] = 'application/json';
    }
    
    // Pas d'authentification - token JWT désactivé
    return config;
}, error => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
});

// Interceptor pour les réponses: gestion centralisée des erreurs
api.interceptors.response.use(
    response => {
        console.log(`API Response Success: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status, response.data);
        return response;
    },
    error => {
        if (error.response) {
            // La requête a été faite et le serveur a répondu avec un code d'erreur
            console.error(
                `API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
                `Status: ${error.response.status}`,
                `Data:`, error.response.data
            );
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error(
                `API No Response: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
                `No response received:`, error.request
            );
        } else {
            // Une erreur s'est produite lors de la création de la requête
            console.error("API Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
