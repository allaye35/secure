import axios from "axios";
const BASE = `${process.env.REACT_APP_API_BASE}/diplomes-ssiap`;

const DiplomeService = {
    getAll:       () => axios.get(BASE),
    getById:      id => axios.get(`${BASE}/${id}`),
    getByAgent:   aid => axios.get(`${BASE}/agent/${aid}`),
    create:      data => axios.post(BASE, data),
    update: (id, data) => axios.put(`${BASE}/${id}`, data),
    delete:       id => axios.delete(`${BASE}/${id}`),
};

export default DiplomeService;
