import api from "./api";

const RESOURCE = "/contrats";

const ContratService = {
  /* ---------- Lecture ---------- */
  getAll:         ()   => api.get(RESOURCE),
  getById:        id   => api.get(`${RESOURCE}/${id}`),
  getByReference: ref  => api.get(`${RESOURCE}/ref/${ref}`),

  /* ---------- Création ---------- */
  create: formData =>
    api.post(RESOURCE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /* ---------- Mise à jour ---------- */
  update: (id, formData) =>
    api.put(`${RESOURCE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /* ---------- Suppression ---------- */
  remove: id => api.delete(`${RESOURCE}/${id}`),
};

export default ContratService;
