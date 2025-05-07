import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DiplomeService from "../../services/DiplomeService";
import AgentService from "../../services/AgentService";
import DiplomeForm from "./DiplomeForm";

const DiplomeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        niveau: "SSIAP_1", // Valeur mise à jour avec underscore
        dateObtention: "",
        dateExpiration: ""
    });
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Charger le diplôme et la liste des agents en parallèle
        Promise.all([
            DiplomeService.getById(id),
            AgentService.getAllAgents()
        ])
            .then(([diplomeRes, agentsRes]) => {
                const dto = diplomeRes.data;
                setData({
                    agentId: dto.agentId,
                    niveau: dto.niveau,
                    dateObtention: dto.dateObtention?.slice(0,10) || "",
                    dateExpiration: dto.dateExpiration?.slice(0,10) || ""
                });
                
                setAgents(agentsRes.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger le diplôme ou la liste des agents.");
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            // Convertir agentId en nombre avant l'envoi
            const payload = {
                ...data,
                agentId: parseInt(data.agentId, 10), // Conversion en nombre entier
                dateObtention: data.dateObtention || null,
                dateExpiration: data.dateExpiration || null
            };
            
            console.log("Envoi des données de mise à jour:", payload); // Pour déboguer
            await DiplomeService.update(id, payload);
            navigate("/diplomes-ssiap");
        } catch (err) {
            console.error("Erreur lors de la mise à jour:", err);
            setError("Échec de la mise à jour.");
        }
    };

    // Afficher un message de chargement si nécessaire
    if (loading) {
        return <div className="loading">Chargement des données...</div>;
    }

    return (
        <DiplomeForm
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            agents={agents}
        />
    );
};

export default DiplomeEdit;
