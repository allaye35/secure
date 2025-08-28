import api from "./api";

const DiplomeService = {
    getAll:       () => api.get("/diplomes-ssiap"),
    getById:      id => api.get(`/diplomes-ssiap/${id}`),
    getByAgent:   aid => api.get(`/diplomes-ssiap/agent/${aid}`),
    create:      data => api.post("/diplomes-ssiap", data),
    update: (id, data) => api.put(`/diplomes-ssiap/${id}`, data),
    delete:       id => api.delete(`/diplomes-ssiap/${id}`),
};

export default DiplomeService;
