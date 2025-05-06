// src/services/ZoneService.js
import axios from "axios";

// Utiliser une valeur par défaut si REACT_APP_API_BASE n'est pas défini
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
const BASE = `${API_BASE}/zones`;

// Configuration d'axios avec timeout et gestion d'erreur globale
const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000, // 10 secondes de timeout
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Erreur API:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

const ZoneService = {
    getAll : ()          => api.get('/zones'),
    getById: (id)        => api.get(`/zones/${id}`),
    create : (dto)       => {
        // S'assurer que les données sont au bon format même pour la méthode create standard
        // Au cas où des agentIds seraient fournis
        if (dto.agentIds) {
            if (!Array.isArray(dto.agentIds)) {
                dto.agentIds = [dto.agentIds];
            }
        }
        return api.post('/zones', dto);
    },
    createWithAgents: (dto) => {
        // S'assurer que dto.agentIds est un tableau même s'il n'y a qu'un seul agent
        if (dto.agentIds && !Array.isArray(dto.agentIds)) {
            dto.agentIds = [dto.agentIds];
        }
        return api.post('/zones', dto);
    },
    update : (id, dto)   => api.put(`/zones/${id}`, dto),
    remove : (id)        => api.delete(`/zones/${id}`),

    /* filtrage optionnel */
    searchByName: (nom)      => api.get('/zones/recherche', { params: { nom } }),
    searchByType: (typeZone) => api.get(`/zones/type/${typeZone}`),
    
    /* récupération des agents rattachés à une zone */
    getAgentsForZone: (zoneId) => api.get(`/zones/${zoneId}/agents`),
    
    /* Nouvelles méthodes pour assigner/retirer des agents - URLs corrigées */
    assignAgentToZone: (zoneId, agentId) => api.put(`/agents/${agentId}/zone/${zoneId}`),
    removeAgentFromZone: (zoneId, agentId) => api.delete(`/zones/${zoneId}/agents/${agentId}`),
    
    /* Méthode pour assigner plusieurs agents en une seule fois */
    assignMultipleAgentsToZone: (zoneId, agentIds) => {
        if (!Array.isArray(agentIds)) {
            agentIds = [agentIds];
        }
        return api.put(`/zones/${zoneId}/agents`, { agentIds });
    }
};

export default ZoneService;
