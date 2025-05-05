import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_BASE}/disponibilites`;

const DisponibiliteService = {
    getAll: () => axios.get(BASE_URL),
    getById: id => axios.get(`${BASE_URL}/${id}`),
    getByAgent: agentId => axios.get(`${BASE_URL}/agent/${agentId}`),
    create: data => axios.post(BASE_URL, data),
    update: (id, data) => axios.put(`${BASE_URL}/${id}`, data),
    delete: id => axios.delete(`${BASE_URL}/${id}`),
};

export default DisponibiliteService;
