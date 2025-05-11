import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DiplomeService from "../../services/DiplomeService";
import AgentService from "../../services/AgentService";
import DiplomeForm from "./DiplomeForm";

const DiplomeCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        niveau: "SSIAP_1",
        dateObtention: "",
        dateExpiration: ""
    });
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chargement des agents au montage du composant
    useEffect(() => {
        setLoading(true);
        AgentService.getAllAgents()
            .then(response => {
                // Trier les agents par nom pour une meilleure lisibilité
                const sortedAgents = [...response.data].sort((a, b) => 
                    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
                );
                setAgents(sortedAgents);
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
        setIsSubmitting(true);
        
        // Vérifier que agentId est bien défini
        if (!data.agentId) {
            setError("Veuillez sélectionner un agent");
            setIsSubmitting(false);
            return;
        }
        
        try {
            // Préparer le payload en s'assurant que tous les champs sont dans le bon format
            const payload = {
                agentId: Number(data.agentId),
                niveau: data.niveau,
                dateObtention: data.dateObtention || null,
                dateExpiration: data.dateExpiration || null
            };
            
            // Appel à l'API
            await DiplomeService.create(payload);
            
            // Redirection après création réussie
            navigate("/diplomes-ssiap");
        } catch (err) {
            console.error("Erreur lors de la création:", err);
            
            // Afficher un message d'erreur plus détaillé
            if (err.response) {
                setError(`Échec de la création: ${err.response.data?.message || `Erreur ${err.response.status}`}`);
            } else if (err.request) {
                setError("Aucune réponse du serveur. Vérifiez votre connexion internet.");
            } else {
                setError(`Erreur: ${err.message || "Une erreur inconnue s'est produite"}`);
            }
            setIsSubmitting(false);
        }
    };

    return (
        <DiplomeForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            agents={agents}
            isSubmitting={isSubmitting}
        />
    );
};

export default DiplomeCreate;
