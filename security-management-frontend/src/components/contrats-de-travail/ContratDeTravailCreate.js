// src/components/contrats-de-travail/ContratDeTravailCreate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import ContratDeTravailService, { MetaService } from "../../services/ContratDeTravailService";
import ContratDeTravailForm from "./ContratDeTravailForm";

export default function ContratDeTravailCreate() {
    const navigate = useNavigate();    const [data, setData] = useState({
        referenceContrat: "",
        typeContrat: "CDD",
        dateDebut: "",
        dateFin: "",
        description: "",
        salaireDeBase: "",
        periodiciteSalaire: "MENSUEL",
        agentDeSecuriteId: "",
        entrepriseId: "",
        missionId: "",
        clauseIds: [],
        articleIds: [],
        ficheDePaieIds: []
    });
    const [meta, setMeta] = useState({
        missions: [], 
        agents: [], 
        entreprises: [], 
        clauses: []
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
            setInitialLoadComplete(true);
        }).catch(err => {
            console.error("Erreur lors du chargement des données:", err);
            setError("Erreur lors du chargement des données: " + (err.message || "Erreur inconnue"));
            setIsLoading(false);
            setInitialLoadComplete(true);
        });
    }, []);    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            console.log("Données du formulaire à envoyer:", data);
            
            // Vérifier si la référence existe déjà
            try {
                const checkResponse = await ContratDeTravailService.checkReferenceExists(data.referenceContrat);
                if (checkResponse.data && checkResponse.data.exists === true) {
                    setError(`La référence de contrat "${data.referenceContrat}" existe déjà. Veuillez en choisir une autre.`);
                    setIsLoading(false);
                    return;
                }
            } catch (checkError) {
                console.log("Erreur lors de la vérification de référence:", checkError);
                // Continue même si la vérification échoue
            }
              // Préparation des données à envoyer au serveur
            const today = new Date();
            const currentDateStr = today.toISOString().split('T')[0];
            
            const jsonData = {
                referenceContrat: data.referenceContrat,
                typeContrat: data.typeContrat,
                // Utiliser la date du jour pour satisfaire la validation côté backend
                dateDebut: currentDateStr,
                dateFin: data.typeContrat === "CDI" ? null : data.dateFin,
                description: data.description,
                salaireDeBase: Number(parseFloat(data.salaireDeBase || 0).toFixed(2)),
                periodiciteSalaire: data.periodiciteSalaire,
                agentDeSecuriteId: parseInt(data.agentDeSecuriteId) || null,
                entrepriseId: parseInt(data.entrepriseId) || null,
                missionId: parseInt(data.missionId) || null
            };            // Ajouter les IDs des clauses si sélectionnées
            if (data.clauseIds && data.clauseIds.length > 0) {
                jsonData.clauseIds = data.clauseIds.map(id => parseInt(id));
            }
            
            // Ajouter les IDs des fiches de paie si sélectionnées
            if (data.ficheDePaieIds && data.ficheDePaieIds.length > 0) {
                jsonData.ficheDePaieIds = data.ficheDePaieIds.map(id => parseInt(id));
            }            console.log("Données JSON à envoyer:", jsonData);
            
            // Créer le contrat
            const response = await ContratDeTravailService.create(jsonData);
            console.log("Réponse de création:", response);
            
            navigate("/contrats-de-travail");} catch (err) {
            console.error("Erreur lors de la création:", err);
            let errorMessage = err.response?.data?.message || err.message || "Erreur inconnue";
            
            // Vérifier si c'est une erreur de duplication
            if (errorMessage.includes("Duplicate entry") && errorMessage.includes("referenceContrat")) {
                errorMessage = `La référence de contrat "${data.referenceContrat}" existe déjà. Veuillez en choisir une autre.`;
            }
            
            setError(`Échec de la création: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!initialLoadComplete) {
        return (
            <Container className="d-flex justify-content-center align-items-center py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement des données nécessaires...</p>
                </div>
            </Container>
        );
    }

    if (error && !meta.missions.length) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
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
