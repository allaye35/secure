import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CarteProService from "../../services/CarteProService";
import CarteProForm from "./CarteProForm";

const CarteProCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        typeCarte: "CQP_APS",
        numeroCarte: "",
        dateDebut: "",
        dateFin: ""
    });
    const [error, setError] = useState(null);

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
            
            await CarteProService.create(formattedData);
            navigate("/cartes-professionnelles");
        } catch (err) {
            console.error("Erreur lors de la création:", err);
            setError(err.message || "Échec de la création de la carte professionnelle");
        }
    };

    return (
        <CarteProForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default CarteProCreate;
