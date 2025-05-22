import axios from "axios";

// Utilise la variable d'environnement correctement
const API_URL = `${process.env.REACT_APP_API_BASE}/geolocalisations-gps`;

const getAllGeolocalisations = async () => {
  try {
    const response = await axios.get(API_URL);
    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération des geolocalisations:", error);
    throw error;
  }
};

const getGeolocalisationById = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

const createGeolocalisation = async (data) => {
  return await axios.post(API_URL, data);
};

const updateGeolocalisation = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

const deleteGeolocalisation = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};

export default {
  getAllGeolocalisations,
  getGeolocalisationById,
  createGeolocalisation,
  updateGeolocalisation,
  deleteGeolocalisation,
  // Alias pour getAllGeolocalisations pour correspondre à la convention des autres services
  getAll: () => getAllGeolocalisations().then(response => response.data)
};
