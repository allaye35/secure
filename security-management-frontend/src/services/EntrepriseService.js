// src/services/EntrepriseService.js
import api from "./api";

const EntrepriseService = {
    getAllEntreprises:   ()           => api.get("/entreprises"),
    getEntrepriseById:   id           => api.get(`/entreprises/${id}`),
    createEntreprise:    entreprise   => api.post("/entreprises", entreprise),
    updateEntreprise:    (id, ent)    => api.put(`/entreprises/${id}`, ent),
    deleteEntreprise:    id           => api.delete(`/entreprises/${id}`)
};

export default EntrepriseService;
