import api from "./api";

const CarteProService = {
    getAll:       () => api.get("/cartes-professionnelles"),
    getById:      id => api.get(`/cartes-professionnelles/${id}`),
    getByAgent:   aid => api.get(`/cartes-professionnelles/agent/${aid}`),
    create:      data => api.post("/cartes-professionnelles", data),
    update: (id, data) => api.put(`/cartes-professionnelles/${id}`, data),
    delete:       id => api.delete(`/cartes-professionnelles/${id}`),
};

export default CarteProService;
