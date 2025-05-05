import api from "./api";

const PATH = "/factures";

const FactureService = {
    getAll: ()            => api.get(PATH),
    getById: (id)         => api.get(`${PATH}/${id}`),
    create: (dto)         => api.post(PATH, dto),
    update: (id, dto)     => api.put(`${PATH}/${id}`, dto),
    delete: (id)          => api.delete(`${PATH}/${id}`),
    getByReference: (ref) => api.get(`${PATH}/reference/${ref}`)
};

export default FactureService;
