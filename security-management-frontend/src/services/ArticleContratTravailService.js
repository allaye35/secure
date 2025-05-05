// src/services/ArticleContratTravailService.js
import api from "./api";

const RESOURCE = "/articles-contrat-travail";  // Corrigé pour éviter la duplication de /api/

export default {
    // Liste de tous les articles
    getAll: () => api.get(`${RESOURCE}`),
    
    // Détail d'un article par son ID
    getById: id => api.get(`${RESOURCE}/${id}`),
    
    // Tous les articles rattachés à un contrat de travail
    getByContratTravail: contratId => api.get(`${RESOURCE}/contrat-travail/${contratId}`),
    
    // Pour la compatibilité avec le code existant
    getByContratId: contratId => api.get(`${RESOURCE}/contrat-travail/${contratId}`),
    
    // Création
    create: article => api.post(RESOURCE, article),
    
    // Mise à jour
    update: (id, article) => api.put(`${RESOURCE}/${id}`, article),
    
    // Suppression
    remove: id => api.delete(`${RESOURCE}/${id}`)
};
