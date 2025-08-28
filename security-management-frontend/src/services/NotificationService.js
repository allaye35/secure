import api from "./api";
const BASE = "/notifications";

const NotificationService = {
    getAll:      () => api.get(BASE),
    getById:     id => api.get(`${BASE}/${id}`),
    getByAgent:  aid => api.get(`${BASE}/agent/${aid}`),
    getByClient: cid => api.get(`${BASE}/client/${cid}`),
    create:     data => api.post(BASE, data),
    update: (id, data) => api.put(`${BASE}/${id}`, data),
    delete:      id => api.delete(`${BASE}/${id}`),
};

export default NotificationService;
