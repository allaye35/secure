import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CarteProService from "../../services/CarteProService";
import CarteProForm from "./CarteProForm";

const CarteProEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({
        agentId: "",
        typeCarte: "CQP_APS",
        numeroCarte: "",
        dateDebut: "",
        dateFin: ""
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        CarteProService.getById(id)
            .then(res => {
                const dto = res.data;
                setData({
                    agentId:     dto.agentId || "",
                    typeCarte:   dto.typeCarte || "CQP_APS",
                    numeroCarte: dto.numeroCarte || "",
                    dateDebut:   dto.dateDebut ? dto.dateDebut.slice(0,10) : "",
                    dateFin:     dto.dateFin ? dto.dateFin.slice(0,10) : ""
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement:", err);
                setError("Impossible de charger la carte.");
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            // S'assurer que agentId est un nombre
            const formattedData = {
                ...data,
                agentId: parseInt(data.agentId, 10)
            };
            
            // Vérifier que toutes les données requises sont présentes
            if (!formattedData.agentId || isNaN(formattedData.agentId)) {
                throw new Error("Veuillez sélectionner un agent valide");
            }
            
            await CarteProService.update(id, formattedData);
            navigate("/cartes-professionnelles");
        } catch (err) {
            console.error("Erreur lors de la mise à jour:", err);
            setError(err.message || "Échec de la mise à jour de la carte professionnelle");
        }
    };

    if (loading) return <div className="loading">Chargement...</div>;

    return (
        <CarteProForm
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default CarteProEdit;
