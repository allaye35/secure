// src/components/missions/MissionList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                 from "react-router-dom";
import MissionService                  from "../../services/MissionService";
import "../../styles/MissionList.css";
export default function MissionList() {
    const [missions, setMissions] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        MissionService.getAllMissions()
            .then(({ data }) => {
                if (Array.isArray(data)) setMissions(data);
                else                     setError("Format de données inattendu.");
            })
            .catch(() => setError("Erreur lors du chargement."))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = d => d ? new Date(d).toLocaleDateString() : "-";
    const formatTime = t => t ? t.slice(0,5) : "-";

    const handleDelete = id => {
        if (!window.confirm("Confirmer la suppression ?")) return;
        MissionService.deleteMission(id)
            .then(() => setMissions(ms => ms.filter(m => m.id !== id)))
            .catch(() => alert("Échec de la suppression."));
    };

    // Action générique : on demande un ID
    const askAndCall = (label, fn, missionId) => {
        const target = window.prompt(`${label} – saisir l’ID :`);
        if (!target) return;
        fn(missionId, parseInt(target,10))
            .then(() => alert(`${label} réalisé !`))
            .catch(e => alert("Erreur : "+ e.response?.data?.message || e.message));
    };

    if (loading) return <p>Chargement…</p>;
    if (error)   return <p className="error">{error}</p>;

    return (
        <div className="mission-list">
            <h2>Liste des missions</h2>
            <button className="btn btn-add" onClick={() => navigate("/missions/create")}>
                ➕ Nouvelle mission
            </button>

            <table className="tbl-missions">
                <thead>
                <tr>
                    <th>№</th>
                    <th>Titre</th>
                    <th>Description</th>
                    <th>Date début</th>
                    <th>Heure début</th>
                    <th>Date fin</th>
                    <th>Heure fin</th>
                    <th>Statut</th>
                    <th>Type</th>
                    <th>Agents</th>
                    <th>Quantité</th>
                    <th>Montant HT</th>
                    <th>Site</th>
                    <th>Contrat</th>
                    <th>Devis</th>
                    <th>Planning</th>
                    <th>Géo</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {missions.length === 0 ? (
                    <tr>
                        <td colSpan="18" className="no-data">
                            Aucune mission
                        </td>
                    </tr>
                ) : missions.map(m => (
                    <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>{m.titre}</td>
                        <td title={m.description}>{m.description.slice(0,30)}…</td>
                        <td>{formatDate(m.dateDebut)}</td>
                        <td>{formatTime(m.heureDebut)}</td>
                        <td>{formatDate(m.dateFin)}</td>
                        <td>{formatTime(m.heureFin)}</td>
                        <td>{m.statutMission}</td>
                        <td>{m.typeMission}</td>
                        <td>{m.nombreAgents}</td>
                        <td>{m.quantite}</td>
                        <td>{m.montantHT} €</td>
                        <td>{m.site?.nom ?? "-"}</td>
                        <td>{m.contrat?.referenceContrat ?? "-"}</td>
                        <td>{m.devis?.referenceDevis ?? "-"}</td>
                        <td>
                            {m.planning
                                ? `${formatDate(m.planning.dateDebut)} → ${formatDate(m.planning.dateFin)}`
                                : "-"}
                        </td>
                        <td>
                            {m.geolocalisationGPS
                                ? `${m.geolocalisationGPS.latitude},${m.geolocalisationGPS.longitude}`
                                : "-"}
                        </td>
                        <td>
                            <div className="actions-dropdown">
                                <button className="btn-actions">⚙️</button>
                                <ul className="actions-menu">
                                    <li onClick={() => navigate(`/missions/edit/${m.id}`)}>
                                        ✏️ Éditer
                                    </li>
                                    <li onClick={() => handleDelete(m.id)}>
                                        🗑️ Supprimer
                                    </li>
                                    <li onClick={() =>
                                        askAndCall("Affecter un agent", MissionService.assignAgents, m.id)
                                    }>
                                        👤 Affecter agent
                                    </li>
                                    <li onClick={() =>
                                        askAndCall("Retirer un agent", (mid, aid) =>
                                            MissionService.retirerAgent(mid, aid), m.id)
                                    }>
                                        🚫 Retirer agent
                                    </li>
                                    <li onClick={() =>
                                        askAndCall("Associer un rapport", (mid, rid) =>
                                            MissionService.assignAgents(mid,[rid]), m.id)
                                    }>
                                        📄 Associer rapport
                                    </li>
                                    <li onClick={() =>
                                        askAndCall("Associer planning", MissionService.assignPlanning, m.id)
                                    }>
                                        📆 Associer planning
                                    </li>
                                    <li onClick={() =>
                                        askAndCall("Associer site", MissionService.assignSite, m.id)
                                    }>
                                        📍 Associer site
                                    </li>
                                    <li onClick={() =>
                                        MissionService.assignGeolocalisation(m.id)
                                            .then(() => alert("Géolocalisation assignée"))
                                            .catch(e => alert("Erreur : "+ e.message))
                                    }>
                                        🛰️ Associer géoloc
                                    </li>
                                    <li onClick={() =>
                                        askAndCall("Associer contrat de travail", (mid, cid) =>
                                            MissionService.assignContrat(mid, cid), m.id)
                                    }>
                                        📑 Associer contrat
                                    </li>
                                    <li onClick={() =>
                                        askAndCall("Associer facture", (mid, fid) =>
                                            MissionService.assignFacture(mid, fid), m.id)
                                    }>
                                        💶 Associer facture
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
