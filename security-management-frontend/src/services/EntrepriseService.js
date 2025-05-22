// src/services/EntrepriseService.js
import api from "./api";

const EntrepriseService = {
    getAllEntreprises:   ()           => api.get("/entreprises").then(response => response.data),
    getEntrepriseById:   id           => api.get(`/entreprises/${id}`).then(response => response.data),
    createEntreprise:    entreprise   => api.post("/entreprises", entreprise).then(response => response.data),
    updateEntreprise:    (id, ent)    => api.put(`/entreprises/${id}`, ent).then(response => response.data),
    deleteEntreprise:    id           => api.delete(`/entreprises/${id}`).then(response => response.data)
};

export default EntrepriseService;
