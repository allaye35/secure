// src/services/MissionService.js
import api from "./api";

const PATH = "/missions";

const MissionService = {
  getAllMissions: () => api.get(PATH),
  getMissionById: (id) => api.get(`${PATH}/${id}`),
  getByDevis: (devisId) => api.get(`${PATH}/devis/${devisId}`),
  getByContratId: (contratId) => api.get(`${PATH}/contrat/${contratId}`),
  getMissionsByClient: (clientId) => api.get(`${PATH}/client/${clientId}`),
  getActivesByClient: (clientId) => api.get(`${PATH}/client/${clientId}/actives`),

  // 👇 NOUVEAU : missions sans devis (global)
  getSansDevis: () => api.get(`${PATH}/sans-devis`),

  createMission: (missionData) => api.post(PATH, missionData),
  update: (id, missionData) => api.patch(`${PATH}/${id}`, missionData),
  updateMission: (id, missionData) => api.patch(`${PATH}/${id}`, missionData),
  deleteMission: (id) => api.delete(`${PATH}/${id}`),
  associerFacture: (missionId, factureId) => api.put(`${PATH}/${missionId}/factures/${factureId}`),
  simulateCalculation: (missionData) => api.post(`${PATH}/simuler-calcul`, missionData),
  assignAgents: (missionId, agentIds) => api.put(`${PATH}/${missionId}/agents`, agentIds),
  retirerAgent: (missionId, agentId) => api.delete(`${PATH}/${missionId}/agent/${agentId}`),
  assignPlanning: (missionId, planningId) => api.put(`${PATH}/${missionId}/planning/${planningId}`),
  assignSite: (missionId, siteId) => api.put(`${PATH}/${missionId}/site/${siteId}`),
  assignContrat: (missionId, contratId) => api.put(`${PATH}/${missionId}/contrat/${contratId}`),
  assignFacture: (missionId, factureId) => api.put(`${PATH}/${missionId}/facture/${factureId}`),
};

export default MissionService;
