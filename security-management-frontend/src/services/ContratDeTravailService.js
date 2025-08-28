import api from "./api";
const BASE = "/contrats-de-travail";

const ContratDeTravailService = {
    getAll:        () => api.get(BASE),
    getById:     id => api.get(`${BASE}/${id}`),
    create:      dto => api.post(BASE, dto),
    update:    (id, dto) => api.put(`${BASE}/${id}`, dto),
    delete:       id => api.delete(`${BASE}/${id}`),
    prolonger: (id, date) =>
        api.patch(`${BASE}/${id}/prolonger`, null, { params: { nouvelleDateFin: date } }),
    getByAgent: agentId => api.get(`${BASE}/agent/${agentId}`),
    uploadContratDocument: (id, formData) => 
        api.post(`${BASE}/${id}/upload-document`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    checkReferenceExists: (reference) => 
        api.get(`${BASE}/check-reference/${reference}`),
};

export const MetaService = {
    getMissions: () => api.get(`/missions`),
    getAgents: () => api.get(`/agents`),
    getEntreprises: () => api.get(`/entreprises`),
    getClauses: () => api.get(`/articles-contrat-travail`)
};

export default ContratDeTravailService;
