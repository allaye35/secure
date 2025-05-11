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
     * Récupérer les missions associées à un contrat
     */
    getByContratId: (contratId) => api.get(`${PATH}/contrat/${contratId}`),
    
    /**
     * Récupérer les missions associées à un client
     */
    getMissionsByClient: (clientId) => api.get(`${PATH}/client/${clientId}`),
    
    /**
     * Récupérer les missions actives d'un client (alternative à l'API du client)
     */
    getActivesByClient: (clientId) => api.get(`${PATH}/client/${clientId}/actives`),
    
    /**
     * Créer une nouvelle mission
     */
    createMission: (missionData) => api.post(PATH, missionData),
    
    /**
     * Mettre à jour une mission
     */
    update: (id, missionData) => api.put(`${PATH}/${id}`, missionData),
    
    /**
     * Mettre à jour une mission (alias pour update)
     */
    updateMission: (id, missionData) => api.put(`${PATH}/${id}`, missionData),
    
    /**
     * Associer une mission à une facture
     */
    associerFacture: (missionId, factureId) => api.put(`${PATH}/${missionId}/facture/${factureId}`),

    /**
     * Simuler un calcul de montants sans créer une mission
     * Cette fonction permet d'obtenir les montants calculés par le backend
     * en fonction des paramètres de la mission (tarif, quantité, etc.)
     */
    simulateCalculation: (missionData) => api.post(`${PATH}/simuler-calcul`, missionData)
};

export default MissionService;
