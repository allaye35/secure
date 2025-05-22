import api from "./api";

// Le chemin correct sans duplication de "/api" car baseURL contient déjà "http://localhost:8080/api"
const PATH = "/devis";

const DevisService = {
    /** Récupérer tous les devis */
    getAll: () => api.get(PATH).then(response => response.data),
    
    /** Récupérer uniquement les devis disponibles (non liés à un contrat) */
    getDisponibles: () => api.get(`${PATH}/disponibles`).then(response => response.data),
    
    /** Récupérer un devis par son ID */
    getById: (id) => api.get(`${PATH}/${id}`).then(response => response.data),
    
    /** Créer un nouveau devis */
    create: (dto) => api.post(PATH, dto).then(response => response.data),
    
    /** Mettre à jour un devis existant */
    update: (id, dto) => api.put(`${PATH}/${id}`, dto).then(response => response.data),
    
    /** Supprimer un devis */
    delete: (id) => api.delete(`${PATH}/${id}`).then(response => response.data),
    
    /** Rechercher un devis par sa référence */
    search: (ref) => api.get(`${PATH}/search`, { params: { reference: ref } }).then(response => response.data)
};

export default DevisService;
