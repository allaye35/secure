import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import AgentService from "../../services/AgentService";
import ZoneForm from "./ZoneForm";

const ZoneCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        nom: "",
        typeZone: "VILLE",
        codePostal: "",
        ville: "",
        departement: "",
        region: "",
        pays: ""
    });
    const [error, setError] = useState(null);
    const [agents, setAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Charger la liste des agents disponibles
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await AgentService.getAllAgents();
                setAgents(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des agents:", err);
                setError("Impossible de charger la liste des agents.");
                setLoading(false);
            }
        };

        fetchAgents();
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            // Inclure les agents sélectionnés dans les données envoyées au serveur
            const dataToSend = {
                ...data,
                agentIds: selectedAgents.length > 0 ? selectedAgents : []
            };
            
            // Utiliser simplement la méthode create puisque les deux méthodes font la même chose
            const zoneResponse = await ZoneService.create(dataToSend);
            
            navigate("/zones");
        } catch (err) {
            console.error("Erreur lors de la création de la zone:", err);
            setError("Échec de la création. Vérifiez la console pour plus de détails.");
        }
    };

    if (loading) {
        return <div className="loading">Chargement des données...</div>;
    }

    return (
        <ZoneForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            agents={agents}
            selectedAgents={selectedAgents}
            setSelectedAgents={setSelectedAgents}
        />
    );
};

export default ZoneCreate;
