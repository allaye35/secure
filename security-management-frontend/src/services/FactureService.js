import api from "./api";

const PATH = "/factures";

const FactureService = {
    getAll: ()            => api.get(PATH),
    getById: (id)         => api.get(`${PATH}/${id}`),
    create: (dto)         => api.post(PATH, dto),
    update: (id, dto)     => api.put(`${PATH}/${id}`, dto),
    delete: (id)          => api.delete(`${PATH}/${id}`),
    getByReference: (ref) => api.get(`${PATH}/reference/${ref}`),
    
    // Méthode corrigée pour générer une facture pour un client sur une période donnée
    createForPeriod: (clientId, dateDebut, dateFin) => 
        api.post(`${PATH}/periode`, { 
            clientId: parseInt(clientId), 
            dateDebut: dateDebut, // La conversion en LocalDate sera faite par Jackson côté serveur
            dateFin: dateFin 
        }),
        
    // Méthode pour générer une facture à partir d'un devis
    createFromDevis: (devisId) => 
        api.post(`${PATH}/from-devis/${devisId}`),
    
    // Méthode pour récupérer un PDF de la facture
    getPdf: (id) => 
        api.get(`${PATH}/${id}/pdf`, { responseType: 'blob' })
};

export default FactureService;
