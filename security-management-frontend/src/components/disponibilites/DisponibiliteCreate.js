import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DisponibiliteService from "../../services/DisponibiliteService";
import DisponibiliteForm from "./DisponibiliteForm";

const DisponibiliteCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        dateDebut: "",
        dateFin: ""
    });
    const [error, setError] = useState(null);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await DisponibiliteService.create({
                ...data,
                // convertit en ISO
                dateDebut: new Date(data.dateDebut).toISOString(),
                dateFin:   new Date(data.dateFin).toISOString()
            });
            navigate("/disponibilites");
        } catch {
            setError("Échec de la création.");
        }
    };

    return (
        <DisponibiliteForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default DisponibiliteCreate;
