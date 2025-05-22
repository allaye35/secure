import api from "./api";

const RESOURCE = "/contrats";

const ContratService = {  /* ---------- Lecture ---------- */
  getAll:         ()   => api.get(RESOURCE).then(response => response.data),
  getById:        id   => api.get(`${RESOURCE}/${id}`).then(response => response.data),
  getByReference: ref  => api.get(`${RESOURCE}/ref/${ref}`).then(response => response.data),
  /* ---------- Création ---------- */
  create: data => api.post(RESOURCE, data).then(response => response.data),
  /* ---------- Mise à jour ---------- */
  update: (id, data) => api.put(`${RESOURCE}/${id}`, data).then(response => response.data),
  /* ---------- Suppression ---------- */
  remove: id => api.delete(`${RESOURCE}/${id}`).then(response => response.data),
};

export default ContratService;
