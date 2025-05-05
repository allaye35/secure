import api from "./api"; // axios.create({ baseURL: "http://localhost:8080/api" })

const LigneCotisationService = {
    getAll: () =>
        api.get("/lignes-cotisation"),
    getById: id =>
        api.get(`/lignes-cotisation/${id}`),
    getByFiche: ficheId =>
        api.get(`/lignes-cotisation/fiche/${ficheId}`),
    create: dto =>
        api.post("/lignes-cotisation", dto),
    update: (id, dto) =>
        api.put(`/lignes-cotisation/${id}`, dto),
    delete: id =>
        api.delete(`/lignes-cotisation/${id}`)
};

export default LigneCotisationService;
