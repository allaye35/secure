import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import EntrepriseService from "../../services/EntrepriseService";
import SiteService from "../../services/SiteService";
import PlanningService from "../../services/PlanningService";

const EditMission = () => {
  const { id } = useParams();
  const [mission, setMission] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    statutMission: "PLANIFIEE",
    siteId: "",
    planningId: "",
    entrepriseId: "",
  });

  const [entreprises, setEntreprises] = useState([]);
  const [sites, setSites] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger les entreprises, sites et plannings
    const fetchData = async () => {
      try {
        const entreprisesData = await EntrepriseService.getAllEntreprises();
        setEntreprises(entreprisesData.data);

        const sitesData = await SiteService.getAllSites();
        setSites(sitesData.data);

        const planningsData = await PlanningService.getAllPlannings();
        setPlannings(planningsData.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };

    // Charger les données existantes de la mission
    MissionService.getMissionById(id)
      .then((response) => {
        const missionData = response.data;
        setMission({
          ...missionData,
          dateDebut: missionData.dateDebut ? missionData.dateDebut.split("T")[0] : "",
          dateFin: missionData.dateFin ? missionData.dateFin.split("T")[0] : "",
          entrepriseId: missionData.entreprise ? missionData.entreprise.id : "",
          siteId: missionData.site ? missionData.site.id : "",
          planningId: missionData.planning ? missionData.planning.id : "",
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des détails de la mission", error);
      });

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMission({ ...mission, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!mission.titre || !mission.description || !mission.dateDebut || !mission.dateFin || !mission.entrepriseId) {
      setErrorMessage("⚠️ Tous les champs obligatoires doivent être remplis !");
      setIsLoading(false);
      return;
    }

    const payload = {
      titre: mission.titre,
      description: mission.description,
      dateDebut: mission.dateDebut,
      dateFin: mission.dateFin,
      statutMission: mission.statutMission,
      entreprise: mission.entrepriseId ? { id: Number(mission.entrepriseId) } : null,
      site: mission.siteId ? { id: Number(mission.siteId) } : null,
      planning: mission.planningId ? { id: Number(mission.planningId) } : null,
    };

    try {
      await MissionService.updateMission(id, payload);
      alert("✅ Mission mise à jour avec succès !");
      navigate("/missions");
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de la mission :", error.response?.data || error.message);
      setErrorMessage("⚠️ Erreur : " + (error.response?.data?.message || "Erreur inconnue"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Modifier la Mission</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>Titre:</label>
        <input type="text" name="titre" value={mission.titre} onChange={handleChange} required />

        <label>Description:</label>
        <textarea name="description" value={mission.description} onChange={handleChange} required />

        <label>Date de début:</label>
        <input type="date" name="dateDebut" value={mission.dateDebut} onChange={handleChange} required />

        <label>Date de fin:</label>
        <input type="date" name="dateFin" value={mission.dateFin} onChange={handleChange} required />

        <label>Statut:</label>
        <select name="statutMission" value={mission.statutMission} onChange={handleChange} required>
          <option value="PLANIFIEE">Plannifiée</option>
          <option value="EN_COURS">En Cours</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ANNULEE">Annulée</option>
        </select>

        <label>Entreprise:</label>
        <select name="entrepriseId" value={mission.entrepriseId} onChange={handleChange} required>
          <option value="">Sélectionner une entreprise</option>
          {entreprises.map((entreprise) => (
            <option key={entreprise.id} value={entreprise.id}>
              {entreprise.nom}
            </option>
          ))}
        </select>

        <label>Site:</label>
        <select name="siteId" value={mission.siteId} onChange={handleChange}>
          <option value="">Sélectionner un site</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.nom}
            </option>
          ))}
        </select>

        <label>Planning:</label>
        <select name="planningId" value={mission.planningId} onChange={handleChange}>
          <option value="">Sélectionner un planning</option>
          {plannings.map((planning) => (
            <option key={planning.id} value={planning.id}>
              {planning.date}
            </option>
          ))}
        </select>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Mise à jour..." : "Mettre à jour la Mission"}
        </button>
      </form>
    </div>
  );
};

export default EditMission;
