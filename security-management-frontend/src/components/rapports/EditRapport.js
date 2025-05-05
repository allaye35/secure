// src/components/rapports/EditRapport.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate }     from "react-router-dom";
import RapportService                 from "../../services/RapportService";
import MissionService                 from "../../services/MissionService";

export default function EditRapport() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [rapport, setRapport]   = useState(null);
    const [missions, setMissions] = useState([]);
    const [error, setError]       = useState("");

    // 1) charger le rapport
    useEffect(() => {
        RapportService.getRapportById(id)
            .then(res => setRapport(res.data))
            .catch(() => setError("Impossible de charger le rapport."));
    }, [id]);

    // 2) charger la liste des missions
    useEffect(() => {
        MissionService.getAllMissions()
            .then(res => setMissions(res.data))
            .catch(() => console.error("Impossible de charger les missions"));
    }, []);

    if (error)    return <p style={{ color: "red" }}>{error}</p>;
    if (!rapport) return <p>Chargement…</p>;

    const onChange = e => {
        const { name, value, type } = e.target;
        setRapport(prev => ({
            ...prev,
            [name]: type === "number" ? parseInt(value, 10) : value
        }));
    };

    const onSubmit = e => {
        e.preventDefault();
        RapportService.updateRapport(id, rapport)
            .then(() => navigate("/rapports"))
            .catch(() => setError("Échec de la mise à jour."));
    };

    return (
        <form onSubmit={onSubmit} style={{ padding: 16, maxWidth: 600 }}>
            <h2>✏️ Modifier Rapport #{id}</h2>

            {/* Date & heure */}
            <div>
                <label>Date &amp; heure :</label><br/>
                <input
                    type="datetime-local"
                    name="dateIntervention"
                    value={rapport.dateIntervention?.substring(0,16) || ""}
                    onChange={onChange}
                    required
                />
            </div>

            {/* Nom de l’agent */}
            <div>
                <label>Nom de l’agent :</label><br/>
                <input
                    type="text"
                    name="agentNom"
                    value={rapport.agentNom}
                    onChange={onChange}
                    required
                />
            </div>

            {/* Email de l’agent */}
            <div>
                <label>Email de l’agent :</label><br/>
                <input
                    type="email"
                    name="agentEmail"
                    value={rapport.agentEmail}
                    onChange={onChange}
                    required
                />
            </div>

            {/* Téléphone */}
            <div>
                <label>Téléphone :</label><br/>
                <input
                    type="text"
                    name="agentTelephone"
                    value={rapport.agentTelephone}
                    onChange={onChange}
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label>Description :</label><br/>
                <textarea
                    name="description"
                    value={rapport.description}
                    onChange={onChange}
                    required
                />
            </div>

            {/* Contenu */}
            <div>
                <label>Contenu :</label><br/>
                <textarea
                    name="contenu"
                    value={rapport.contenu}
                    onChange={onChange}
                    required
                />
            </div>

            {/* Mission (nouveau) */}
            <div>
                <label>Mission :</label><br/>
                <select
                    name="missionId"
                    value={rapport.missionId ?? ""}
                    onChange={onChange}
                    required
                >
                    <option value="">— choisissez —</option>
                    {missions.map(m => (
                        <option key={m.id} value={m.id}>
                            #{m.id} – {m.titre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Statut */}
            <div>
                <label>Status :</label><br/>
                <select
                    name="status"
                    value={rapport.status}
                    onChange={onChange}
                >
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ANNULE">Annulé</option>
                </select>
            </div>

            <br/>
            <button type="submit">Sauvegarder</button>
        </form>
    );
}
