import api from "./api";

const DisponibiliteService = {
    getAll: () => api.get("/disponibilites"),
    getById: id => api.get(`/disponibilites/${id}`),
    getByAgent: agentId => api.get(`/disponibilites/agent/${agentId}`),
    create: data => api.post("/disponibilites", data),
    update: (id, data) => api.put(`/disponibilites/${id}`, data),
    delete: id => api.delete(`/disponibilites/${id}`),
};

export default DisponibiliteService;
