import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CarteProService from "../../services/CarteProService";
import CarteProForm from "./CarteProForm";

const CarteProCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        typeCarte: "SSP",
        numeroCarte: "",
        dateDebut: "",
        dateFin: ""
    });
    const [error, setError] = useState(null);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await CarteProService.create({
                ...data,
                dateDebut: data.dateDebut,
                dateFin:   data.dateFin
            });
            navigate("/cartes-professionnelles");
        } catch {
            setError("Échec de la création.");
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
