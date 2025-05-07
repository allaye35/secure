import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DiplomeService from "../../services/DiplomeService";
import AgentService from "../../services/AgentService";
import DiplomeForm from "./DiplomeForm";

const DiplomeCreate = () => {
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

    // Chargement des agents au montage du composant
    useEffect(() => {
        setLoading(true);
        AgentService.getAllAgents()
            .then(response => {
                setAgents(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents:", err);
                setError("Impossible de charger la liste des agents.");
                setLoading(false);
            });
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        
        // Vérifier que agentId est bien défini
        if (!data.agentId) {
            setError("Veuillez sélectionner un agent");
            return;
        }
        
        try {
            // Préparer le payload en s'assurant que tous les champs sont dans le bon format
            const payload = {
                agentId: Number(data.agentId), // Assure que c'est bien un nombre
                niveau: data.niveau,
                dateObtention: data.dateObtention || null,
                dateExpiration: data.dateExpiration || null
            };
            
            console.log("Envoi des données:", payload);
            
            // Appel à l'API avec un meilleur traitement des erreurs
            const response = await DiplomeService.create(payload);
            console.log("Réponse du serveur:", response);
            navigate("/diplomes-ssiap");
        } catch (err) {
            console.error("Erreur lors de la création:", err);
            
            // Afficher un message d'erreur plus détaillé
            if (err.response) {
                console.error("Réponse d'erreur:", err.response);
                setError(`Échec de la création: ${err.response.data?.message || `Statut ${err.response.status}`}`);
            } else {
                setError("Échec de la création. Vérifiez votre connexion réseau.");
            }
        }
    };

    // Afficher un message de chargement si nécessaire
    if (loading) {
        return <div className="loading">Chargement des données...</div>;
    }

    return (
        <DiplomeForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            agents={agents}
        />
    );
};

export default DiplomeCreate;
