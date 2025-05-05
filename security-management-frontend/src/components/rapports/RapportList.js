// src/components/rapports/RapportList.jsx
import React, { useEffect, useState } from "react";
import { Link }                       from "react-router-dom";
import RapportService                 from "../../services/RapportService";
import MissionService                 from "../../services/MissionService";

export default function RapportList() {
    const [rapports, setRapports] = useState([]);
    const [missions, setMissions] = useState([]);

    // 🔄 recharge la liste des rapports
    const refreshRapports = () =>
        RapportService.getAllRapports()
            .then(res => {
                const unique = new Map(res.data.map(r => [r.id, r]));
                setRapports(Array.from(unique.values()));
            })
            .catch(console.error);

    // 1) on récupère d’abord tous les rapports…
    useEffect(() => {
        refreshRapports();
    }, []);

    // 2) …et en même temps on charge toutes les missions
    useEffect(() => {
        MissionService.getAllMissions()
            .then(res => setMissions(res.data))
            .catch(console.error);
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Supprimer ce rapport ?")) return;
        RapportService.deleteRapport(id)
            .then(refreshRapports)
            .catch(console.error);
    };

    return (
        <div style={{ padding: 16 }}>
            <h2>Rapports d’intervention</h2>
            <Link to="/rapports/create">Créer un nouveau rapport</Link>

            <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Agent</th>
                    <th>Mission</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {rapports.length > 0 ? rapports.map((r, idx) => {
                    // retrouve l’objet mission correspondant
                    const mission = missions.find(m => m.id === r.missionId);
                    return (
                        <tr key={`${r.id}-${idx}`}>
                            <td>{r.id}</td>
                            <td>{r.dateIntervention?.replace("T"," ").slice(0,16)}</td>
                            <td>{r.agentNom}</td>
                            <td>
                                {mission
                                    ? <>
                                        {mission.titre}
                                        {mission.siteId && <em> (site #{mission.siteId})</em>}
                                    </>
                                    : r.missionId
                                        ? `#${r.missionId} (chargement…)`
                                        : "–"
                                }
                            </td>
                            <td>{r.status}</td>
                            <td>
                                <Link to={`/rapports/${r.id}`}>Voir</Link>{" • "}
                                <Link to={`/rapports/edit/${r.id}`}>Modifier</Link>{" • "}
                                <button onClick={() => handleDelete(r.id)}>Supprimer</button>
                            </td>
                        </tr>
                    );
                }) : (
                    <tr>
                        <td colSpan="6" style={{ textAlign:"center", fontStyle:"italic" }}>
                            Aucun rapport trouvé.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
