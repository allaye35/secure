// src/services/MissionService.js
import api from "./api";

const API_URL = "/missions";

const MissionService = {
  /** Récupérer toutes les missions */
  getAllMissions: () =>
      api.get(API_URL),

  /** Récupérer une mission par son ID */
  getMissionById: (id) =>
      api.get(`${API_URL}/${id}`),

  /** Créer une nouvelle mission */
  createMission: (missionData) =>
      api.post(API_URL, missionData),

  /** Mettre à jour une mission existante */
  updateMission: (id, missionData) =>
      api.put(`${API_URL}/${id}`, missionData),

  /** Supprimer une mission */
  deleteMission: (id) =>
      api.delete(`${API_URL}/${id}`),

  /** Assigner une liste d’agents à une mission */
  assignAgents: (missionId, agentIds) =>
      api.put(`${API_URL}/${missionId}/agents`, agentIds),

  /** Assigner un site à une mission */
  assignSite: (missionId, siteId) =>
      api.put(`${API_URL}/${missionId}/site/${siteId}`),

  /** Assigner un planning à une mission */
  assignPlanning: (missionId, planningId) =>
      api.put(`${API_URL}/${missionId}/planning/${planningId}`),

  /** Assigner une entreprise à une mission (si utilisé) */
  assignEntreprise: (missionId, entrepriseId) =>
      api.put(`${API_URL}/${missionId}/entreprise/${entrepriseId}`),

  /** Assigner une géolocalisation à une mission */
  assignGeolocalisation: (missionId) =>
      api.put(`${API_URL}/${missionId}/geoloc`),

  /** Récupérer toutes les missions d’un agent */
  getByAgent: (agentId) =>
      api.get(`${API_URL}/agent/${agentId}`),

  /** Récupérer toutes les missions d’un contrat */
  getByContratId: (contratId) =>
      api.get(`${API_URL}/contrat/${contratId}`),

  /** Récupérer toutes les missions d’un planning */
  getByPlanning: (planningId) =>
      api.get(`${API_URL}/planning/${planningId}`),

  /** Récupérer les missions commençant après une date */
  getAfterDate: (date) =>
      api.get(`${API_URL}/after/${date}`),

  /** Récupérer les missions se terminant avant une date */
  getBeforeDate: (date) =>
      api.get(`${API_URL}/before/${date}`)
};

export default MissionService;
