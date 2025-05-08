import api from "./api";

const PATH = "/factures";

const FactureService = {
    /**
     * Récupérer toutes les factures
     */
    getAll: () => api.get(PATH),

    /**
     * Récupérer une facture par son ID
     */
    getById: (id) => api.get(`${PATH}/${id}`),

    /**
     * Créer une nouvelle facture
     * @param {Object} factureData - Données de la facture à créer
     */
    create: (factureData) => api.post(PATH, factureData),

    /**
     * Mettre à jour une facture
     */
    update: (id, factureData) => api.put(`${PATH}/${id}`, factureData),

    /**
     * Supprimer une facture
     */
    delete: (id) => api.delete(`${PATH}/${id}`),

    /**
     * Obtenir les factures associées à un client
     */
    getByClient: (clientId) => api.get(`${PATH}/client/${clientId}`),

    /**
     * Créer une facture à partir d'un devis
     */
    createFromDevis: (devisId) => api.post(`${PATH}/from-devis/${devisId}`),

    /**
     * Créer une facture pour un client sur une période donnée
     * @param {Object} periodeData - Données contenant clientId, entrepriseId, dateDebut, dateFin et missionIds 
     */
    createForPeriod: (periodeData) => api.post(`${PATH}/periode`, periodeData),

    /**
     * Obtenir un aperçu des calculs de la facture avant création
     */
    previewFacture: (periodeData) => api.post(`${PATH}/preview`, periodeData),

    /**
     * Télécharger une facture au format PDF
     * @param {string} id - ID de la facture à télécharger
     * @returns {Promise} - Requête HTTP pour télécharger le PDF
     */
    getPdf: (id) => api.get(`${PATH}/${id}/pdf`, {
        responseType: 'blob',
        headers: {
            'Accept': 'application/pdf'
        }
    })
};

export default FactureService;
