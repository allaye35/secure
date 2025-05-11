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
        niveau: "SSIAP_1",
        dateObtention: "",
        dateExpiration: ""
    });
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Charger le diplôme et la liste des agents en parallèle
                const [diplomeRes, agentsRes] = await Promise.all([
                    DiplomeService.getById(id),
                    AgentService.getAllAgents()
                ]);
                
                // Préparer les données du diplôme
                const dto = diplomeRes.data;
                setData({
                    agentId: dto.agentId,
                    niveau: dto.niveau,
                    dateObtention: dto.dateObtention?.slice(0,10) || "",
                    dateExpiration: dto.dateExpiration?.slice(0,10) || ""
                });
                
                // Trier les agents par nom pour une meilleure lisibilité
                const sortedAgents = [...agentsRes.data].sort((a, b) => 
                    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
                );
                setAgents(sortedAgents);
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                
                if (err.response && err.response.status === 404) {
                    setError(`Diplôme introuvable (ID: ${id})`);
                } else {
                    setError("Impossible de charger le diplôme ou la liste des agents.");
                }
                
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        try {
            // Convertir agentId en nombre avant l'envoi
            const payload = {
                ...data,
                agentId: parseInt(data.agentId, 10),
                dateObtention: data.dateObtention || null,
                dateExpiration: data.dateExpiration || null
            };
            
            // Appel à l'API
            await DiplomeService.update(id, payload);
            
            // Redirection après mise à jour réussie
            navigate("/diplomes-ssiap");
        } catch (err) {
            console.error("Erreur lors de la mise à jour:", err);
            
            // Afficher un message d'erreur plus détaillé
            if (err.response) {
                setError(`Échec de la mise à jour: ${err.response.data?.message || `Erreur ${err.response.status}`}`);
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
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            agents={agents}
            isSubmitting={isSubmitting}
        />
    );
};

export default DiplomeEdit;
