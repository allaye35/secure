import api from "./api";

const PATH = "/jours-feries";

const JoursFeriesService = {
    /**
     * Récupérer tous les jours fériés d'une année donnée
     * @param {number} annee - L'année pour laquelle récupérer les jours fériés
     */
    getByAnnee: (annee) => api.get(`${PATH}?annee=${annee}`),
};

export default JoursFeriesService;