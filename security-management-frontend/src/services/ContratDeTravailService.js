import axios from "axios";
const BASE = `${process.env.REACT_APP_API_BASE}/contrats-de-travail`;
const API_BASE = process.env.REACT_APP_API_BASE;

const ContratDeTravailService = {
    getAll:        () => axios.get(BASE),
    getById:     id => axios.get(`${BASE}/${id}`),
    create:      dto => axios.post(BASE, dto),
    update:    (id, dto) => axios.put(`${BASE}/${id}`, dto),
    delete:       id => axios.delete(`${BASE}/${id}`),
    prolonger: (id, date) =>
        axios.patch(`${BASE}/${id}/prolonger`, null, { params: { nouvelleDateFin: date } }),
    getByAgent: agentId => axios.get(`${BASE}/agent/${agentId}`),
};

export const MetaService = {
    getMissions: () => axios.get(`${API_BASE}/missions`),
    getAgents: () => axios.get(`${API_BASE}/agents`),
    getEntreprises: () => axios.get(`${API_BASE}/entreprises`),
    getClauses: () => axios.get(`${API_BASE}/articles-contrat-travail`)
};

export default ContratDeTravailService;
