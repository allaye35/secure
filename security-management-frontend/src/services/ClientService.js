import api from "./api";

// Le chemin correct sans duplication de "/api" car baseURL contient déjà "http://localhost:8080/api"
const PATH = "/clients";

const ClientService = {
    /** Récupérer tous les clients */
    getAll: () => api.get(PATH),
    
    /** Récupérer un client par son ID */
    getById: (id) => api.get(`${PATH}/${id}`),
    
    /** Rechercher un client par son email */
    getByEmail: (email) => api.get(`${PATH}/email/${email}`),
    
    /** Rechercher un client par son nom */
    getByNom: (nom) => api.get(`${PATH}/nom/${nom}`),
    
    /** Créer un nouveau client */
    create: (dto) => api.post(PATH, dto),
    
    /** Mettre à jour un client existant */
    update: (id, dto) => api.put(`${PATH}/${id}`, dto),
    
    /** Supprimer un client */
    delete: (id) => api.delete(`${PATH}/${id}`),
    
    /** Récupérer tous les clients d'une entreprise spécifique */
    getByEntreprise: (entrepriseId) => api.get(`${PATH}/entreprise/${entrepriseId}`),
    
    /** Récupérer les statistiques des clients (nombres, répartition, etc.) */
    getStatistiques: () => api.get(`${PATH}/statistiques`),
    
    /** Calculer le chiffre d'affaires généré par un client */
    calculerChiffreAffaires: (clientId, dateDebut, dateFin) => 
        api.get(`${PATH}/${clientId}/chiffre-affaires`, { params: { dateDebut, dateFin } }),
    
    /** Obtenir l'historique des factures d'un client */
    getHistoriqueFactures: (clientId) => api.get(`${PATH}/${clientId}/factures`),
    
    /** Obtenir les entreprises associées à un client */
    getEntreprises: (clientId) => api.get(`${PATH}/${clientId}/entreprises`),
    
    /** Associer un client à une entreprise */
    associerEntreprise: (clientId, entrepriseId) => 
        api.post(`${PATH}/${clientId}/entreprises/${entrepriseId}`),
    
    /** Dissocier un client d'une entreprise */
    dissocierEntreprise: (clientId, entrepriseId) => 
        api.delete(`${PATH}/${clientId}/entreprises/${entrepriseId}`),
    
    /** Calculer la rentabilité d'un client */
    calculerRentabilite: (clientId) => api.get(`${PATH}/${clientId}/rentabilite`),
    
    /** Récupérer les missions actives d'un client */
    getMissionsActives: (clientId) => api.get(`${PATH}/${clientId}/missions/actives`),
    
    /** Obtenir les contrats en cours avec un client */
    getContratsEnCours: (clientId) => api.get(`${PATH}/${clientId}/contrats/en-cours`)
};

export default ClientService;
