import api from "./api";

const PATH = "/tarifs";

const TarifMissionService = {
    /** Lister tous les tarifs */
    getAll: () => api.get(PATH),

    /** Récupérer un tarif par son ID */
    getById: (id) => api.get(`${PATH}/${id}`),

    /** Récupérer un tarif par type de mission */
    getByType: (type) => api.get(`${PATH}/type/${type}`),

    /** Créer un nouveau tarif */
    create: (dto) => api.post(PATH, dto),

    /** Mettre à jour un tarif existant */
    update: (id, dto) => api.put(`${PATH}/${id}`, dto),

    /** Supprimer un tarif */
    delete: (id) => api.delete(`${PATH}/${id}`),
    
    /** Associer une mission à un tarif */
    associateMission: (tarifId, missionId) => api.post(`${PATH}/${tarifId}/missions/${missionId}`),
    
    /** Retirer une mission d'un tarif */
    removeMission: (tarifId, missionId) => api.delete(`${PATH}/${tarifId}/missions/${missionId}`),
    
    /** Obtenir les missions associées à un tarif */
    getMissions: (tarifId) => api.get(`${PATH}/${tarifId}/missions`),
    
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
