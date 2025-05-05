// src/services/ZoneService.js
import axios from "axios";

const BASE = `${process.env.REACT_APP_API_BASE}/zones`;

const ZoneService = {
    getAll : ()          => axios.get(BASE),
    getById: id          => axios.get(`${BASE}/${id}`),
    create : dto         => axios.post(BASE, dto),
    update : (id, dto)   => axios.put(`${BASE}/${id}`, dto),
    remove : id          => axios.delete(`${BASE}/${id}`),

    /* filtrage optionnel */
    searchByName: nom      => axios.get(`${BASE}/recherche`, { params: { nom } }),
    searchByType: typeZone => axios.get(`${BASE}/type/${typeZone}`)
};

export default ZoneService;
