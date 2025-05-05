import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContratDeTravailService, { MetaService } from "../../services/ContratDeTravailService";
import ContratDeTravailForm from "./ContratDeTravailForm";

const ContratDeTravailEdit = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [meta, setMeta] = useState({
        missions: [],
        agents: [],
        entreprises: [],
        clauses: []
    });

    useEffect(() => {
        // Chargement du contrat
        ContratDeTravailService.getById(id)
            .then(res => {
                const dto = res.data;
                dto.dateDebut = dto.dateDebut?.slice(0,10);
                if (dto.dateFin) dto.dateFin = dto.dateFin.slice(0,10);
                setData(dto);
            })
            .catch(() => setError("Impossible de charger le contrat."));
        
        // Chargement des données de référence nécessaires aux menus déroulants
        Promise.all([
            MetaService.getMissions(),
            MetaService.getAgents(),
            MetaService.getEntreprises(),
            MetaService.getClauses()
        ])
            .then(([missionsRes, agentsRes, entreprisesRes, clausesRes]) => {
                setMeta({
                    missions: missionsRes.data || [],
                    agents: agentsRes.data || [],
                    entreprises: entreprisesRes.data || [],
                    clauses: clausesRes.data || []
                });
            })
            .catch(err => {
                console.error("Erreur lors du chargement des données de référence:", err);
                setError(prev => prev ? prev + " Erreur lors du chargement des références." : "Erreur lors du chargement des références.");
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault(); setError(null);
        try {
            // S'assurer que salaireDeBase est correctement formaté
            const dataToSubmit = { 
                ...data,
                salaireDeBase: Number(parseFloat(data.salaireDeBase).toFixed(2))
            };
            await ContratDeTravailService.update(id, dataToSubmit);
            nav("/contrats-de-travail");
        } catch {
            setError("Échec de la mise à jour.");
        }
    };

    if (!data || isLoading) return <p>Chargement…</p>;
    return (
        <ContratDeTravailForm
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
            missions={meta.missions}
            agents={meta.agents}
            entreprises={meta.entreprises}
            clauses={meta.clauses}
        />
    );
};

export default ContratDeTravailEdit;
