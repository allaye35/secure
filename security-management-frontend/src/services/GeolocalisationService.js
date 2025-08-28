import api from "./api";

// Utilise la variable d'environnement correctement
const API_URL = "/geolocalisations-gps";


const getAllGeolocalisations = async () => {
  return await api.get(API_URL);
};

const getGeolocalisationById = async (id) => {
  return await api.get(`${API_URL}/${id}`);
};

const createGeolocalisation = async (data) => {
  return await api.post(API_URL, data);
};

const updateGeolocalisation = async (id, data) => {
  return await api.put(`${API_URL}/${id}`, data);
};

const deleteGeolocalisation = async (id) => {
  return await api.delete(`${API_URL}/${id}`);
};

export default {
  getAllGeolocalisations,
  getGeolocalisationById,
  createGeolocalisation,
  updateGeolocalisation,
  deleteGeolocalisation,
};
