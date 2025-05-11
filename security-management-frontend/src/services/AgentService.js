// src/services/AgentService.js
import api from "./api"; // axios.create({ baseURL: "http://localhost:8080/api", … })

const AgentService = {
  /** Récupère la liste complète des agents */
  getAllAgents: () => api.get("/agents"),

  /** Récupère un agent par son ID */
  getAgentById: (id) => api.get(`/agents/${id}`),

  /** Recherche un agent par email */
  getAgentByEmail: (email) => api.get(`/agents/search?email=${email}`),

  /** Crée un nouvel agent */
  createAgent: (agent) => api.post("/agents", agent),

  /** Met à jour un agent existant */
  updateAgent: (id, agent) => api.put(`/agents/${id}`, agent),

  /** Supprime un agent */
  deleteAgent: (id) => api.delete(`/agents/${id}`),

  /** Assigne une zone à un agent */
  assignZone: (agentId, zoneId) => api.put(`/agents/${agentId}/zone/${zoneId}`),

  /** Ajoute une disponibilité à un agent */
  addDisponibilite: (agentId, dispo) => api.post(`/agents/${agentId}/disponibilites`, dispo),

  /** Assigne une disponibilité existante à un agent */
  assignDisponibiliteExistante: (agentId, disponibiliteId) => 
    api.put(`/agents/${agentId}/disponibilites/${disponibiliteId}`),

  /** Ajoute une carte professionnelle à un agent */
  addCarte: (agentId, carte) => api.post(`/agents/${agentId}/cartesProfessionnelles`, carte),

  /** Assigne une carte professionnelle existante à un agent */
  assignCarteExistante: (agentId, carteId) => 
    api.put(`/agents/${agentId}/cartesProfessionnelles/${carteId}`),

  /** Ajoute un diplôme SSIAP à un agent */
  addDiplome: (agentId, diplome) => api.post(`/agents/${agentId}/diplomesSsiap`, diplome),

  /** Assigne un diplôme existant à un agent */
  assignDiplomeExistant: (agentId, diplomeId) => 
    api.put(`/agents/${agentId}/diplomesSsiap/${diplomeId}`),

  /** Change le rôle d'un agent */
  changeRole: (agentId, role) => api.put(`/agents/${agentId}/role?role=${role}`),

  /** Récupère le planning d'un agent */
  getPlanning: (agentId) => api.get(`/agents/${agentId}/planning`)
};

export default AgentService;
