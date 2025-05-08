import api from "./api";

const PATH = "/missions";

const MissionService = {
    /**
     * Récupérer toutes les missions
     */
    getAll: () => api.get(PATH),

    /**
     * Récupérer toutes les missions (alias pour getAll)
     */
    getAllMissions: () => api.get(PATH),

    /**
     * Récupérer une mission par son ID
     */
    getById: (id) => api.get(`${PATH}/${id}`),

    /**
     * Obtenir les missions associées à un devis
     */
    getByDevis: (devisId) => api.get(`${PATH}/devis/${devisId}`),
    
    /**
     * Récupérer les missions associées à un client
     */
    getMissionsByClient: (clientId) => api.get(`${PATH}/client/${clientId}`),
    
    /**
     * Récupérer les missions actives d'un client (alternative à l'API du client)
     */
    getActivesByClient: (clientId) => api.get(`${PATH}/client/${clientId}/actives`),
    
    /**
     * Mettre à jour une mission
     */
    update: (id, missionData) => api.put(`${PATH}/${id}`, missionData),
    
    /**
     * Associer une mission à une facture
     */
    associerFacture: (missionId, factureId) => api.put(`${PATH}/${missionId}/facture/${factureId}`)
};

export default MissionService;
