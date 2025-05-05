// src/components/missions/AssignMissionRelations.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import AgentService from "../../services/AgentService";
import SiteService from "../../services/SiteService";
import PlanningService from "../../services/PlanningService";
import EntrepriseService from "../../services/EntrepriseService";
import GeolocalisationService from "../../services/GeolocalisationService";

const AssignMissionRelations = () => {
  const { id: missionId } = useParams();
  const navigate = useNavigate();

  // Listes d’options
  const [agents, setAgents] = useState([]);
  const [sites, setSites] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [geolocs, setGeolocs] = useState([]);

  // Sélections faites par l’utilisateur
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedPlanning, setSelectedPlanning] = useState("");
  const [selectedEntreprise, setSelectedEntreprise] = useState("");
  const [selectedGeoloc, setSelectedGeoloc] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  // Charger toutes les listes au montage
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const agentsRes = await AgentService.getAllAgents();
        setAgents(Array.isArray(agentsRes.data) ? agentsRes.data : (agentsRes.data ? [agentsRes.data] : []));
        
        const sitesRes = await SiteService.getAllSites();
        setSites(Array.isArray(sitesRes.data) ? sitesRes.data : (sitesRes.data ? [sitesRes.data] : []));
        
        const planRes = await PlanningService.getAllPlannings();
        setPlannings(Array.isArray(planRes.data) ? planRes.data : (planRes.data ? [planRes.data] : []));
        
        const entRes = await EntrepriseService.getAllEntreprises();
        setEntreprises(Array.isArray(entRes.data) ? entRes.data : (entRes.data ? [entRes.data] : []));
        
        const geoRes = await GeolocalisationService.getAllGeolocalisations();
        setGeolocs(Array.isArray(geoRes.data) ? geoRes.data : (geoRes.data ? [geoRes.data] : []));
      } catch (err) {
        console.error("Erreur lors du chargement des listes :", err);
        setErrorMessage("Impossible de charger les listes d’affectation.");
      }
    };
    fetchAll();
  }, []);

  // Gestion de la sélection multiple d’agents
  const handleAgentsSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setSelectedAgents(selected);
  };

  // Méthodes d'affectation
  const handleAssignAgents = async () => {
    try {
      if (selectedAgents.length === 0) return;
      await MissionService.assignAgents(missionId, selectedAgents);
      alert("✅ Agents assignés avec succès !");
    } catch (error) {
      console.error("Erreur lors de l’assignation des agents :", error);
      setErrorMessage("Impossible d’assigner les agents.");
    }
  };

  const handleAssignSite = async () => {
    try {
      if (!selectedSite) return;
      await MissionService.assignSite(missionId, selectedSite);
      alert("✅ Site assigné avec succès !");
    } catch (error) {
      console.error("Erreur lors de l’assignation du site :", error);
      setErrorMessage("Impossible d’assigner le site.");
    }
  };

  const handleAssignPlanning = async () => {
    try {
      if (!selectedPlanning) return;
      await MissionService.assignPlanning(missionId, selectedPlanning);
      alert("✅ Planning assigné avec succès !");
    } catch (error) {
      console.error("Erreur lors de l’assignation du planning :", error);
      setErrorMessage("Impossible d’assigner le planning.");
    }
  };

  const handleAssignEntreprise = async () => {
    try {
      if (!selectedEntreprise) return;
      await MissionService.assignEntreprise(missionId, selectedEntreprise);
      alert("✅ Entreprise assignée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l’assignation de l’entreprise :", error);
      setErrorMessage("Impossible d’assigner l’entreprise.");
    }
  };

  const handleAssignGeoloc = async () => {
    try {
      if (!selectedGeoloc) return;
      await MissionService.assignGeolocalisation(missionId, selectedGeoloc);
      alert("✅ Géolocalisation assignée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l’assignation de la géolocalisation :", error);
      setErrorMessage("Impossible d’assigner la géolocalisation.");
    }
  };

  return (
    <div>
      <h2>Affecter des relations à la mission (ID : {missionId})</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Affecter des agents */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Assigner des agents</h3>
        {agents.length > 0 ? (
          <>
            <select multiple onChange={handleAgentsSelect} style={{ minWidth: 200, minHeight: 80 }}>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.nom} {agent.prenom}
                </option>
              ))}
            </select>
            <br />
            <button onClick={handleAssignAgents}>Assigner ces agents</button>
          </>
        ) : (
          <p>Aucun agent disponible.</p>
        )}
      </div>

      {/* Affecter un site */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Assigner un site</h3>
        {sites.length > 0 ? (
          <>
            <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
              <option value="">(Aucun)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
            <button onClick={handleAssignSite}>Assigner le site</button>
          </>
        ) : (
          <p>Aucun site disponible.</p>
        )}
      </div>

      {/* Affecter un planning */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Assigner un planning</h3>
        {plannings.length > 0 ? (
          <>
            <select value={selectedPlanning} onChange={(e) => setSelectedPlanning(e.target.value)}>
              <option value="">(Aucun)</option>
              {plannings.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.date}
                </option>
              ))}
            </select>
            <button onClick={handleAssignPlanning}>Assigner le planning</button>
          </>
        ) : (
          <p>Aucun planning disponible.</p>
        )}
      </div>

      {/* Affecter une entreprise */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Assigner une entreprise</h3>
        {entreprises.length > 0 ? (
          <>
            <select value={selectedEntreprise} onChange={(e) => setSelectedEntreprise(e.target.value)}>
              <option value="">(Aucune)</option>
              {entreprises.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.nom}
                </option>
              ))}
            </select>
            <button onClick={handleAssignEntreprise}>Assigner l'entreprise</button>
          </>
        ) : (
          <p>Aucune entreprise disponible.</p>
        )}
      </div>

      {/* Affecter une géolocalisation */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Assigner une géolocalisation</h3>
        {geolocs.length > 0 ? (
          <>
            <select value={selectedGeoloc} onChange={(e) => setSelectedGeoloc(e.target.value)}>
              <option value="">(Aucune)</option>
              {geolocs.map((g) => (
                <option key={g.id} value={g.id}>
                  {`[${g.id}] ${g.position?.latitude}, ${g.position?.longitude}`}
                </option>
              ))}
            </select>
            <button onClick={handleAssignGeoloc}>Assigner la géolocalisation</button>
          </>
        ) : (
          <p>Aucune géolocalisation disponible.</p>
        )}
      </div>

      <button onClick={() => navigate("/missions")}>Retour à la liste des missions</button>
    </div>
  );
};

export default AssignMissionRelations;
