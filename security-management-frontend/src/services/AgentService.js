// src/services/AgentService.js
import api from "./api"; // axios.create({ baseURL: "http://localhost:8080/api", … })

const AgentService = {
  /** Récupère la liste complète des agents */
  getAllAgents: () => api.get("/agents"),

  /** Récupère un agent par son ID */
  getAgentById: (id) => api.get(`/agents/${id}`),

  /** Crée un nouvel agent */
  createAgent: (agent) => api.post("/agents", agent),

  /** Met à jour un agent existant */
  updateAgent: (id, agent) => api.put(`/agents/${id}`, agent),

  /** Supprime un agent */
  deleteAgent: (id) => api.delete(`/agents/${id}`),

  // Si vous avez d'autres endpoints dédiés, vous pouvez les ajouter ici :
  // assignZone: (agentId, zoneId) => api.put(`/agents/${agentId}/zone/${zoneId}`),
  // addDisponibilite: (agentId, dispo) => api.post(`/agents/${agentId}/disponibilites`, dispo),
  // addCarte: (agentId, carte) => api.post(`/agents/${agentId}/cartesProfessionnelles`, carte),
  // changeRole: (agentId, role) => api.put(`/agents/${agentId}/role`, null, { params: { role } }),
};

export default AgentService;
