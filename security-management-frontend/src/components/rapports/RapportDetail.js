// src/components/rapports/RapportDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams }            from "react-router-dom";
import RapportService                 from "../../services/RapportService";
import MissionService                 from "../../services/MissionService";

export default function RapportDetail() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [mission, setMission] = useState(null);

    // 1️⃣ Chargement du rapport
    useEffect(() => {
        RapportService.getRapportById(id)
            .then(({ data }) => setReport(data))
            .catch(console.error);
    }, [id]);    // 2️⃣ Dès que report est chargé, on va chercher la mission
    useEffect(() => {
        if (!report?.missionId) return;

        MissionService.getById(report.missionId)
            .then(({ data }) => setMission(data))
            .catch(console.error);
    }, [report]);

    if (!report) {
        return <p>Chargement du rapport…</p>;
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Rapport #{report.id}</h2>
            <ul>
                <li><strong>Date :</strong> {new Date(report.dateIntervention).toLocaleString()}</li>
                <li>
                    <strong>Mission :</strong>{" "}
                    {mission
                        ? `${mission.titre} (site #${mission.siteId})`
                        : report.missionId
                            ? `#${report.missionId} (chargement…)`
                            : <em>—</em>
                    }
                </li>
                <li>
                    <strong>Agent :</strong> {report.agentNom} — {report.agentEmail} — {report.agentTelephone}
                </li>
                <li><strong>Statut :</strong> {report.status}</li>
                <li><strong>Description :</strong> {report.description}</li>
                <li><strong>Contenu :</strong> {report.contenu}</li>
            </ul>

            <p>
                ← <Link to="/rapports">Retour</Link>{" | "}
                <Link to={`/rapports/edit/${report.id}`}>Modifier</Link>
            </p>
        </div>
    );
}
