import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DisponibiliteService from "../../services/DisponibiliteService";
import AgentService from "../../services/AgentService";
import DisponibiliteForm from "./DisponibiliteForm";

const DisponibiliteEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({
        agentId: "",
        dateDebut: "",
        dateFin: ""
    });
    const [agents, setAgents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Chargement des données de la disponibilité
        DisponibiliteService.getById(id)
            .then(res => {
                const dto = res.data;
                setData({
                    agentId:    dto.agentId,
                    dateDebut:  new Date(dto.dateDebut).toISOString().slice(0,16),
                    dateFin:    new Date(dto.dateFin).toISOString().slice(0,16)
                });
            })
            .catch(() => setError("Impossible de charger la disponibilité."));

        // Chargement de la liste des agents
        AgentService.getAllAgents()
            .then(response => setAgents(response.data))
            .catch(err => {
                console.error("Erreur lors du chargement des agents", err);
                setError(erreur => erreur || "Impossible de charger la liste des agents.");
            });
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await DisponibiliteService.update(id, {
                ...data,
                dateDebut: new Date(data.dateDebut).toISOString(),
                dateFin:   new Date(data.dateFin).toISOString()
            });
            navigate("/disponibilites");
        } catch {
            setError("Échec de la mise à jour.");
        }
    };

    return (
        <DisponibiliteForm
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            agents={agents}
        />
    );
};

export default DisponibiliteEdit;
