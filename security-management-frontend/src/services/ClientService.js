import api from "./api";

// Le chemin correct sans duplication de "/api" car baseURL contient déjà "http://localhost:8080/api"
const PATH = "/clients";

const ClientService = {
    /** Récupérer tous les clients */
    getAll: () => api.get(PATH).then(response => response.data),
    
    /** Récupérer un client par son ID */
    getById: (id) => api.get(`${PATH}/${id}`).then(response => response.data),
    
    /** Rechercher un client par son email */
    getByEmail: (email) => api.get(`${PATH}/email/${email}`).then(response => response.data),
    
    /** Rechercher un client par son nom */
    getByNom: (nom) => api.get(`${PATH}/nom/${nom}`).then(response => response.data),
    
    /** Créer un nouveau client */
    create: (dto) => api.post(PATH, dto).then(response => response.data),
    
    /** Mettre à jour un client existant */
    update: (id, dto) => api.put(`${PATH}/${id}`, dto).then(response => response.data),
      /** Supprimer un client */
    delete: (id) => api.delete(`${PATH}/${id}`).then(response => response.data),
    
    /** Récupérer tous les clients d'une entreprise spécifique */
    getByEntreprise: (entrepriseId) => api.get(`${PATH}/entreprise/${entrepriseId}`).then(response => response.data),
    
    /** Récupérer les statistiques des clients (nombres, répartition, etc.) */
    getStatistiques: () => api.get(`${PATH}/statistiques`).then(response => response.data),
    
    /** Calculer le chiffre d'affaires généré par un client */
    calculerChiffreAffaires: (clientId, dateDebut, dateFin) => 
        api.get(`${PATH}/${clientId}/chiffre-affaires`, { params: { dateDebut, dateFin } }).then(response => response.data),
    
    /** Obtenir l'historique des factures d'un client */
    getHistoriqueFactures: (clientId) => api.get(`${PATH}/${clientId}/factures`).then(response => response.data),
    
    /** Obtenir les entreprises associées à un client */
    getEntreprises: (clientId) => api.get(`${PATH}/${clientId}/entreprises`).then(response => response.data),
      /** Associer un client à une entreprise */
    associerEntreprise: (clientId, entrepriseId) => 
        api.post(`${PATH}/${clientId}/entreprises/${entrepriseId}`).then(response => response.data),
    
    /** Dissocier un client d'une entreprise */
    dissocierEntreprise: (clientId, entrepriseId) => 
        api.delete(`${PATH}/${clientId}/entreprises/${entrepriseId}`).then(response => response.data),
    
    /** Calculer la rentabilité d'un client */
    calculerRentabilite: (clientId) => api.get(`${PATH}/${clientId}/rentabilite`).then(response => response.data),
    
    /** Récupérer les missions actives d'un client */
    getMissionsActives: (clientId) => api.get(`${PATH}/${clientId}/missions/actives`).then(response => response.data),
    
    /** Obtenir les contrats en cours avec un client */
    getContratsEnCours: (clientId) => api.get(`${PATH}/${clientId}/contrats/en-cours`).then(response => response.data)
};

export default ClientService;
