import api from "./api";

const PATH = "/tarifs";

const TarifMissionService = {
    /** Lister tous les tarifs */
    getAll: () => api.get(PATH).then(response => response.data),

    /** Récupérer un tarif par son ID */
    getById: (id) => api.get(`${PATH}/${id}`).then(response => response.data),

    /** Récupérer un tarif par type de mission */
    getByType: (type) => api.get(`${PATH}/type/${type}`).then(response => response.data),

    /** Créer un nouveau tarif */
    create: (dto) => api.post(PATH, dto).then(response => response.data),

    /** Mettre à jour un tarif existant */
    update: (id, dto) => api.put(`${PATH}/${id}`, dto).then(response => response.data),

    /** Supprimer un tarif */
    delete: (id) => api.delete(`${PATH}/${id}`).then(response => response.data),
      /** Associer une mission à un tarif */
    associateMission: (tarifId, missionId) => api.post(`${PATH}/${tarifId}/missions/${missionId}`).then(response => response.data),
    
    /** Retirer une mission d'un tarif */
    removeMission: (tarifId, missionId) => api.delete(`${PATH}/${tarifId}/missions/${missionId}`).then(response => response.data),
    
    /** Obtenir les missions associées à un tarif */
    getMissions: (tarifId) => api.get(`${PATH}/${tarifId}/missions`).then(response => response.data),
    
    /** Calculer le prix avec TVA */
    calculerPrixTTC: (prixHT, tauxTVA) => {
        if (!prixHT || !tauxTVA) return null;
        return (Number(prixHT) * (1 + Number(tauxTVA) / 100)).toFixed(2);
    },
    
    /** Calculer le prix avec majoration */
    calculerPrixMajore: (prixHT, majoration) => {
        if (!prixHT || majoration === undefined) return null;
        return (Number(prixHT) * (1 + Number(majoration) / 100)).toFixed(2);
    }
};

export default TarifMissionService;
