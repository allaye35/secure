// src/components/rapports/CreateRapport.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }               from "react-router-dom";
import MissionService                from "../../services/MissionService";
import AgentService                  from "../../services/AgentService";
import RapportService                from "../../services/RapportService";

export default function CreateRapport() {
    const navigate = useNavigate();               // ← pour redirection
    const [missions, setMissions]     = useState([]);
    const [availableAgents, setAgents]= useState([]);
    const [form, setForm] = useState({
        missionId: "",
        dateIntervention: "",
        description: "",
        contenu: "",
        agentId: "",
        agentNom: "",
        agentEmail: "",
        agentTelephone: "",
        status: "EN_COURS"
    });
    const [error, setError] = useState("");

    // 1) charger toutes les missions
    useEffect(() => {
        MissionService.getAllMissions()
            .then(res => setMissions(res.data))
            .catch(() => setError("Impossible de charger les missions"));
    }, []);

    // 2) dès qu’on choisit une mission, on va chercher ses agents
    useEffect(() => {
        const mid = form.missionId;
        if (!mid) {
            setAgents([]);
            return setForm(f => ({
                ...f,
                agentId: "",
                agentNom: "",
                agentEmail: "",
                agentTelephone: ""
            }));
        }

        MissionService.getMissionById(mid)
            .then(({ data: m }) => {
                const ids = Array.from(m.agentIds || []);
                return Promise.all(ids.map(id =>
                    AgentService.getAgentById(id).then(r => r.data)
                ));
            })
            .then(list => setAgents(list))
            .catch(() => {
                console.error("Erreur chargement agents");
                setAgents([]);
            });
    }, [form.missionId]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleAgentChange = e => {
        const id = parseInt(e.target.value, 10);
        const ag = availableAgents.find(a => a.id === id) || {};
        setForm(f => ({
            ...f,
            agentId: id,
            agentNom: ag.nom || "",
            agentEmail: ag.email || "",
            agentTelephone: ag.telephone || ""
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const { data: created } = await RapportService.createRapport({
                dateIntervention: form.dateIntervention,
                description:      form.description,
                contenu:          form.contenu,
                agentNom:         form.agentNom,
                agentEmail:       form.agentEmail,
                agentTelephone:   form.agentTelephone,
                status:           form.status,
                missionId:        parseInt(form.missionId, 10)
            });
            // ← Une fois réussi, on redirige vers le détail du rapport
            navigate(`/rapports/${created.id}`);
        } catch {
            setError("Erreur lors de la création du rapport");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
            {error && <p style={{ color:"red" }}>{error}</p>}

            <label>
                Mission
                <select
                    name="missionId"
                    value={form.missionId}
                    onChange={handleChange}
                    required
                >
                    <option value="">— choisissez —</option>
                    {missions.map(m => (
                        <option key={m.id} value={m.id}>
                            #{m.id} – {m.titre}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Date & heure
                <input
                    type="datetime-local"
                    name="dateIntervention"
                    value={form.dateIntervention}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Description
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />
            </label>

            <label>
                Contenu
                <textarea
                    name="contenu"
                    value={form.contenu}
                    onChange={handleChange}
                />
            </label>

            <label>
                Agent
                <select
                    name="agentId"
                    value={form.agentId}
                    onChange={handleAgentChange}
                    disabled={!availableAgents.length}
                    required
                >
                    <option value="">— choisissez l’agent —</option>
                    {availableAgents.map(a => (
                        <option key={a.id} value={a.id}>
                            {a.nom} ({a.email})
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Statut
                <select name="status" value={form.status} onChange={handleChange}>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ANNULE">Annulé</option>
                </select>
            </label>

            <button type="submit">Créer le rapport</button>
        </form>
    );
}
