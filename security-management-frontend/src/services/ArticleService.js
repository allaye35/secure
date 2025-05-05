// src/services/ArticleService.js
import api from "./api";

// → NOTE : on pointe ici sur "/articles-contrat", pas "/articles"
const RESOURCE = "/articles-contrat";

export default {
    getAll:    ()           => api.get(RESOURCE),
    getById:   id           => api.get(`${RESOURCE}/${id}`),
    getByContratId: cid     => api.get(`${RESOURCE}/contrat/${cid}`),
    create:    article      => api.post(RESOURCE, article),
    update:    (id, article)=> api.put(`${RESOURCE}/${id}`, article),
    remove:    id           => api.delete(`${RESOURCE}/${id}`)
};
