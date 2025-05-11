import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import AgentService from "../../services/AgentService";
import ZoneForm from "./ZoneForm";

const ZoneCreate = () => {
    const navigate = useNavigate();    const [data, setData] = useState({
        nom: "",
        typeZone: "",
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
    }, []);    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        
        // Validation des données obligatoires
        if (!data.nom) {
            setError("Le nom de la zone est obligatoire.");
            return;
        }
        
        if (!data.typeZone) {
            setError("Le type de zone doit être sélectionné.");
            return;
        }
        
        try {
            // Préparation des données à envoyer
            const dataToSend = {
                nom: data.nom,
                typeZone: data.typeZone,
                // Ne pas envoyer les champs vides 
                ...(data.ville && { ville: data.ville }),
                ...(data.codePostal && { codePostal: data.codePostal }),
                ...(data.departement && { departement: data.departement }),
                ...(data.region && { region: data.region }),
                ...(data.pays && { pays: data.pays }),
                // Ajouter les agentIds si présents
                agentIds: selectedAgents.length > 0 ? selectedAgents : []
            };
            
            console.log("Données envoyées au serveur:", JSON.stringify(dataToSend, null, 2));
            
            // Utiliser createWithAgents qui est spécifiquement conçu pour inclure des agents
            const zoneResponse = await ZoneService.createWithAgents(dataToSend);
            console.log("Réponse du serveur:", zoneResponse);
            
            navigate("/zones", { 
                state: { message: "Zone créée avec succès!" }
            });
        } catch (err) {
            console.error("Erreur lors de la création de la zone:", err);
            const errorMessage = err.response?.data?.message || 
                                 err.response?.data?.error || 
                                 "Échec de la création. Vérifiez les données et réessayez.";
            setError(`Échec de la création: ${errorMessage}`);
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
