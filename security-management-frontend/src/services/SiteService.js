// src/services/SiteService.js
import api from "./api";       // axios.create({ baseURL:"http://localhost:8080/api" })

const SiteService = {
  getAllSites: () => {
    console.log("SiteService: getAllSites() - Récupération de tous les sites");
    return api.get("/sites")
      .then(response => {
        console.log("SiteService: getAllSites() - Succès", response.data);
        return response.data;  // Retourne directement response.data
      })
      .catch(error => {
        console.error("SiteService: getAllSites() - Erreur", error.response || error);
        throw error;
      });
  },
  getSiteById: (id) => {
    console.log(`SiteService: getSiteById(${id}) - Récupération du site #${id}`);
    return api.get(`/sites/${id}`)
      .then(response => {
        console.log(`SiteService: getSiteById(${id}) - Succès`, response.data);
        return response.data;  // Retourne directement response.data
      })
      .catch(error => {
        console.error(`SiteService: getSiteById(${id}) - Erreur`, error.response || error);
        throw error;
      });
  },

  createSite: (site) => {
    console.log("SiteService: createSite() - Création du site", site);
    return api.post("/sites", site)
      .then(response => {
        console.log("SiteService: createSite() - Succès", response.data);
        return response;
      })
      .catch(error => {
        console.error("SiteService: createSite() - Erreur", error.response || error);
        throw error;
      });
  },

  updateSite: (id, site) => {
    console.log(`SiteService: updateSite(${id}) - Mise à jour du site #${id}`, site);
    return api.put(`/sites/${id}`, site)
      .then(response => {
        console.log(`SiteService: updateSite(${id}) - Succès`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`SiteService: updateSite(${id}) - Erreur`, error.response || error);
        throw error;
      });
  },

  deleteSite: (id) => {
    console.log(`SiteService: deleteSite(${id}) - Suppression du site #${id}`);
    return api.delete(`/sites/${id}`)
      .then(response => {
        console.log(`SiteService: deleteSite(${id}) - Succès`);
        return response;
      })
      .catch(error => {
        console.error(`SiteService: deleteSite(${id}) - Erreur`, error.response || error);
        throw error;
      });
  }
};

export default SiteService;
