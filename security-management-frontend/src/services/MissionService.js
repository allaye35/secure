import api from "./api";

const PATH = "/missions";

const MissionService = {
    /**
     * Récupérer toutes les missions
     */
    getAll: () => api.get(PATH).then(response => response.data),

    /**
     * Récupérer toutes les missions (alias pour getAll)
     */
    getAllMissions: () => api.get(PATH).then(response => response.data),    /**
     * Récupérer une mission par son ID
     */
    getById: (id) => api.get(`${PATH}/${id}`),
      /**
     * Alias pour getById (pour compatibilité avec le code existant) - Avec gestion d'erreurs améliorée
     */
    getMissionById: (id) => api.get(`${PATH}/${id}`)
      .then(response => {
        if (!response || !response.data) {
          console.error("Réponse API vide pour getMissionById", response);
          throw new Error("La mission n'a pas pu être récupérée depuis le serveur");
        }
        return response.data;
      })
      .catch(error => {
        console.error(`Erreur lors de la récupération de la mission ${id}:`, error);
        if (error.response) {
          // Le serveur a répondu avec un statut d'erreur
          if (error.response.status === 404) {
            throw new Error(`Mission avec l'ID ${id} introuvable`);
          } else {
            throw new Error(`Erreur serveur: ${error.response.data?.message || error.response.statusText}`);
          }
        } else if (error.request) {
          // La requête a été envoyée mais pas de réponse reçue
          throw new Error("Aucune réponse du serveur, veuillez vérifier votre connexion");
        } else {
          // Erreur de configuration de la requête
          throw error;
        }
      }),

    /**
     * Obtenir les missions associées à un devis
     */
    getByDevis: (devisId) => api.get(`${PATH}/devis/${devisId}`).then(response => response.data),
      /**
     * Récupérer les missions associées à un contrat
     */
    getByContratId: (contratId) => api.get(`${PATH}/contrat/${contratId}`).then(response => response.data),
      /**
     * Récupérer les missions associées à un client
     */
    getMissionsByClient: (clientId) => api.get(`${PATH}/client/${clientId}`).then(response => response.data),
      /**
     * Récupérer les missions actives d'un client (alternative à l'API du client)
     */
    getActivesByClient: (clientId) => api.get(`${PATH}/client/${clientId}/actives`).then(response => response.data),
      /**
     * Créer une nouvelle mission
     */
    createMission: (missionData) => api.post(PATH, missionData).then(response => response.data),
      /**
     * Mettre à jour une mission
     */
    update: (id, missionData) => api.put(`${PATH}/${id}`, missionData).then(response => response.data),    /**
     * Mettre à jour une mission (alias pour update)
     */
    updateMission: (id, missionData) => api.put(`${PATH}/${id}`, missionData).then(response => response.data),
    
    /**
     * Associer une mission à une facture
     */
    associerFacture: (missionId, factureId) => api.put(`${PATH}/${missionId}/facture/${factureId}`).then(response => response.data),
    
    /**
     * Simuler un calcul de montants sans créer une mission
     * Cette fonction permet d'obtenir les montants calculés par le backend
     * en fonction des paramètres de la mission (tarif, quantité, etc.)
     */
    simulateCalculation: (missionData) => api.post(`${PATH}/simuler-calcul`, missionData).then(response => response.data),    /**
     * Supprimer une mission
     */
    deleteMission: (id) => api.delete(`${PATH}/${id}`).then(response => response.data),/**
     * Affecter des agents à une mission
     */
    assignAgents: (missionId, agentId) => api.put(`${PATH}/${missionId}/agents`, [agentId]).then(response => response.data),

    /**
     * Retirer un agent d'une mission
     */
    retirerAgent: (missionId, agentId) => api.delete(`${PATH}/${missionId}/agent/${agentId}`).then(response => response.data),

    /**
     * Associer un planning à une mission
     */
    assignPlanning: (missionId, planningId) => api.put(`${PATH}/${missionId}/planning/${planningId}`).then(response => response.data),

    /**
     * Associer un site à une mission
     */
    assignSite: (missionId, siteId) => api.put(`${PATH}/${missionId}/site/${siteId}`).then(response => response.data),

    /**
     * Associer un contrat à une mission
     */
    assignContrat: (missionId, contratId) => api.put(`${PATH}/${missionId}/contrat/${contratId}`).then(response => response.data),    /**
     * Associer une facture à une mission (alias pour associerFacture)
     */
    assignFacture: (missionId, factureId) => api.put(`${PATH}/${missionId}/factures/${factureId}`).then(response => response.data),

    /**
     * Associer un rapport à une mission
     */
    assignRapport: (missionId, rapportId) => api.put(`${PATH}/${missionId}/rapport/${rapportId}`).then(response => response.data),
    
    /**
     * Associer une géolocalisation à une mission
     */
    associerGeoloc: (missionId) => api.put(`${PATH}/${missionId}/geoloc`).then(response => response.data),
    
    /**
     * Dissocier une géolocalisation d'une mission
     */
    dissocierGeoloc: (missionId) => api.delete(`${PATH}/${missionId}/geoloc`).then(response => response.data),
    
    /**
     * Associer un contrat de travail à une mission
     */
    assignContratTravail: (missionId, contratTravailId) => api.put(`${PATH}/${missionId}/contrats-de-travail/${contratTravailId}`).then(response => response.data)
};

export default MissionService;
