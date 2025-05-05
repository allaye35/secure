// src/services/PointageService.js
import api from "./api";

const API = "/pointages";

const PointageService = {
    getAll: () => api.get(API),
    getById: (id) => api.get(`${API}/${id}`),
    create: (dto) => api.post(API, dto),
    update: (id, dto) => api.put(`${API}/${id}`, dto),
    delete: (id) => api.delete(`${API}/${id}`),
};

export default PointageService;