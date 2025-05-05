// src/services/FicheDePaieService.js
import api from "./api"; // ou import axios from "axios";

const PATH = "/fiches-paie"; // Corrigé pour éviter la duplication de /api/

const FicheDePaieService = {
    getAll: ()             => api.get(PATH),
    getById: id            => api.get(`${PATH}/${id}`),
    create: dto            => api.post(PATH, dto),
    update: (id, dto)      => api.put(`${PATH}/${id}`, dto),
    remove: id             => api.delete(`${PATH}/${id}`)
};

export default FicheDePaieService;
