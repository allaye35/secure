import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DisponibiliteService from "../../services/DisponibiliteService";
import AgentService from "../../services/AgentService";
import DisponibiliteForm from "./DisponibiliteForm";

const DisponibiliteCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        dateDebut: "",
        dateFin: ""
    });
    const [agents, setAgents] = useState([]);
    const [error, setError] = useState(null);

    // Chargement de la liste des agents au montage du composant
    useEffect(() => {
        AgentService.getAllAgents()
            .then(response => setAgents(response.data))
            .catch(err => {
                console.error("Erreur lors du chargement des agents", err);
                setError("Impossible de charger la liste des agents.");
            });
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await DisponibiliteService.create({
                ...data,
                // convertit en ISO
                dateDebut: new Date(data.dateDebut).toISOString(),
                dateFin:   new Date(data.dateFin).toISOString()
            });
            navigate("/disponibilites");
        } catch {
            setError("Échec de la création.");
        }
    };

    return (
        <DisponibiliteForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            agents={agents}
        />
    );
};

export default DisponibiliteCreate;
