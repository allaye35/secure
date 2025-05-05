// src/services/RapportService.js
import api from "./api";

const API_URL = "/rapports";

const RapportService = {
    /** 🔹 Tous les rapports */
    getAllRapports: () =>
        api.get(API_URL),

    /** 🔹 Détail d’un rapport par son ID */
    getRapportById: id =>
        api.get(`${API_URL}/${id}`),

    /** 🔹 Création (POST /api/rapports) */
    createRapport: rapport =>
        api.post(API_URL, rapport),

    /** 🔹 Mise à jour (PUT /api/rapports/{id}) */
    updateRapport: (id, rapport) =>
        api.put(`${API_URL}/${id}`, rapport),

    /** 🔹 Suppression */
    deleteRapport: id =>
        api.delete(`${API_URL}/${id}`)
};

export default RapportService;
