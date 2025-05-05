// src/components/contrats-de-travail/ContratDeTravailCreate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContratDeTravailService, { MetaService } from "../../services/ContratDeTravailService";
import ContratDeTravailForm from "./ContratDeTravailForm";

export default function ContratDeTravailCreate() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        referenceContrat: "",
        typeContrat: "CDD",
        dateDebut: "",
        dateFin: "",
        description: "",
        salaireDeBase: "",
        periodiciteSalaire: "MENSUEL", // Correction de "Mensuelle" à "MENSUEL" pour correspondre à l'enum du backend
        agentDeSecuriteId: "",
        entrepriseId: "",
        missionId: "",
        clauseIds: [],
        documentPdf: null
    });
    const [meta, setMeta] = useState({
        missions: [], 
        agents: [], 
        entreprises: [], 
        clauses: []
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        // Charger toutes les données nécessaires pour le formulaire
        Promise.all([
            MetaService.getMissions(),
            MetaService.getAgents(),
            MetaService.getEntreprises(),
            MetaService.getClauses()
        ]).then(([missionsResponse, agentsResponse, entreprisesResponse, clausesResponse]) => {
            console.log("Données de missions reçues:", missionsResponse.data);
            
            // S'assurer que chaque tableau existe avec une valeur par défaut
            setMeta({ 
                missions: Array.isArray(missionsResponse.data) ? missionsResponse.data : [], 
                agents: Array.isArray(agentsResponse.data) ? agentsResponse.data : [], 
                entreprises: Array.isArray(entreprisesResponse.data) ? entreprisesResponse.data : [], 
                clauses: Array.isArray(clausesResponse.data) ? clausesResponse.data : []
            });
            setIsLoading(false);
        }).catch(err => {
            console.error("Erreur lors du chargement des données:", err);
            setError("Erreur lors du chargement des données: " + (err.message || "Erreur inconnue"));
            setIsLoading(false);
        });
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            console.log("Données du formulaire à envoyer:", data);
            
            // Créer un objet JSON plutôt que FormData
            const jsonData = {
                referenceContrat: data.referenceContrat,
                typeContrat: data.typeContrat,
                dateDebut: data.dateDebut,
                dateFin: data.dateFin,
                description: data.description,
                // Assurer que la valeur est un nombre avec 2 décimales maximum
                salaireDeBase: Number(parseFloat(data.salaireDeBase).toFixed(2)),
                periodiciteSalaire: data.periodiciteSalaire,
                agentDeSecuriteId: parseInt(data.agentDeSecuriteId) || null,
                entrepriseId: parseInt(data.entrepriseId) || null,
                missionId: parseInt(data.missionId) || null
            };

            // Ajouter clauseIds uniquement s'il y en a
            if (data.clauseIds && data.clauseIds.length > 0) {
                jsonData.clauseIds = data.clauseIds.map(id => parseInt(id));
            }

            console.log("Données JSON à envoyer:", jsonData);
            
            // Envoi de l'objet JSON au lieu du FormData
            const response = await ContratDeTravailService.create(jsonData);
            console.log("Réponse de création:", response);
            navigate("/contrats-de-travail");
        } catch (err) {
            console.error("Erreur lors de la création:", err);
            const errorMessage = err.response?.data?.message || err.message || "Erreur inconnue";
            setError(`Échec de la création: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !meta.missions.length) {
        return <div style={{textAlign: 'center', padding: '20px'}}>Chargement des données...</div>;
    }

    return (
        <ContratDeTravailForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
            {...meta}
        />
    );
}
