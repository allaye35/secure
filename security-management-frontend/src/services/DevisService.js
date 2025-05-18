import api from "./api";

// Le chemin correct sans duplication de "/api" car baseURL contient déjà "http://localhost:8080/api"
const PATH = "/devis";

const DevisService = {
    /** Récupérer tous les devis */
    getAll: () => api.get(PATH),
    
    /** Récupérer uniquement les devis disponibles (non liés à un contrat) */
    getDisponibles: () => api.get(`${PATH}/disponibles`),
    
    /** Récupérer un devis par son ID */
    getById: (id) => api.get(`${PATH}/${id}`),
    
    /** Créer un nouveau devis */
    create: (dto) => api.post(PATH, dto),
    
    /** Mettre à jour un devis existant */
    update: (id, dto) => api.put(`${PATH}/${id}`, dto),
    
    /** Supprimer un devis */
    delete: (id) => api.delete(`${PATH}/${id}`),
    
    /** Rechercher un devis par sa référence */
    search: (ref) => api.get(`${PATH}/search`, { params: { reference: ref } })
};

export default DevisService;
