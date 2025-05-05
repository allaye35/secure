// src/services/ContratService.js
import api from "./api";

const RESOURCE = "/contrats";

export default {
    getAll:          ()        => api.get(RESOURCE),
    getById:         id        => api.get(`${RESOURCE}/${id}`),
    getByReference:  ref       => api.get(`${RESOURCE}/ref/${ref}`),
    create:          dto       => api.post(RESOURCE, dto),
    update:          (id, dto) => api.put(`${RESOURCE}/${id}`, dto),
    remove:          id        => api.delete(`${RESOURCE}/${id}`)
};
