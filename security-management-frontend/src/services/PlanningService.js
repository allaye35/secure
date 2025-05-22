// src/services/PlanningService.js
import api from "./api";

const PATH = "/plannings";

const PlanningService = {  // CRUD
  getAllPlannings: ()          => api.get(PATH).then(response => response.data),
  getPlanningById: id          => api.get(`${PATH}/${id}`).then(response => response.data),
  createPlanning: obj          => api.post(PATH, obj),
  updatePlanning: (id, obj)    => api.put(`${PATH}/${id}`, obj),
  deletePlanning: id           => api.delete(`${PATH}/${id}`),

  // relations mission <-> planning
  addMissionToPlanning: (plId, mid)    => api.post(`${PATH}/${plId}/missions/${mid}`),
  removeMissionFromPlanning: (plId, mid)=> api.delete(`${PATH}/${plId}/missions/${mid}`),

  // filtres
  getPlanningsByAgent:   aid => api.get(`${PATH}/agents/${aid}`).then(r => r.data),
  getPlanningsByMission: mid => api.get(`${PATH}/missions/${mid}`).then(r => r.data),
  getPlanningsByDateRange: (d1, d2) =>
      api
          .get(`${PATH}/rechercher`, {
            params: { dateDebut: `${d1}T00:00:00`, dateFin: `${d2}T23:59:59` }
          })
          .then(r => r.data)
};

export default PlanningService;
