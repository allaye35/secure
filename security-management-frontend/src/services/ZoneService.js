// src/services/ZoneService.js
import api from "./api";

const ZoneService = {
    getAll : ()          => api.get('/zones'),
    getById: (id)        => api.get(`/zones/${id}`),
    create : (dto)       => {
        // Copier l'objet pour éviter de modifier l'original
        const data = { ...dto };
        
        // S'assurer que les données sont au bon format
        if (data.agentIds) {
            if (!Array.isArray(data.agentIds)) {
                data.agentIds = [data.agentIds];
            }
        } else {
            data.agentIds = []; // Assurer qu'il y a toujours un tableau vide
        }
        
        console.log("API CREATE - Données envoyées:", JSON.stringify(data, null, 2));
        return api.post('/zones', data);
    },
    createWithAgents: (dto) => {
        // Copier l'objet pour éviter de modifier l'original
        const data = { ...dto };
        
        // S'assurer que dto.agentIds est un tableau
        if (data.agentIds && !Array.isArray(data.agentIds)) {
            data.agentIds = [data.agentIds];
        } else if (!data.agentIds) {
            data.agentIds = []; // Assurer qu'il y a toujours un tableau vide
        }
        
        console.log("API CREATE WITH AGENTS - Données envoyées:", JSON.stringify(data, null, 2));
        return api.post('/zones', data);
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
