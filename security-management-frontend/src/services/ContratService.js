import api from "./api";

const RESOURCE = "/contrats";

const ContratService = {
  /* ---------- Lecture ---------- */
  getAll:         ()   => api.get(RESOURCE),
  getById:        id   => api.get(`${RESOURCE}/${id}`),
  getByReference: ref  => api.get(`${RESOURCE}/ref/${ref}`),

  /* ---------- Création ---------- */
  create: data => api.post(RESOURCE, data),

  /* ---------- Mise à jour ---------- */
  update: (id, data) => api.put(`${RESOURCE}/${id}`, data),

  /* ---------- Suppression ---------- */
  remove: id => api.delete(`${RESOURCE}/${id}`),
};

export default ContratService;
