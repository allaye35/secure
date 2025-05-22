import api from "./api";

const PATH = "/geolocalisations-gps";

const GeolocalisationService = {
  // Récupérer toutes les géolocalisations
  getAllGeolocalisations: () => api.get(PATH),
  
  // Récupérer une géolocalisation par son ID
  getGeolocalisationById: (id) => api.get(`${PATH}/${id}`),
  
  // Créer une nouvelle géolocalisation
  createGeolocalisation: (data) => api.post(PATH, data),
  
  // Mettre à jour une géolocalisation
  updateGeolocalisation: (id, data) => api.put(`${PATH}/${id}`, data),
  
  // Supprimer une géolocalisation
  deleteGeolocalisation: (id) => api.delete(`${PATH}/${id}`),
  
  // Alias pour getAllGeolocalisations pour correspondre à la convention des autres services
  getAll: () => api.get(PATH).then(response => response.data)
};

export default GeolocalisationService;
