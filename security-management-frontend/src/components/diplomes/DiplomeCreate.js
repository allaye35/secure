import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DiplomeService from "../../services/DiplomeService";
import DiplomeForm    from "./DiplomeForm";

const DiplomeCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        niveau: "SSIAP1",
        dateObtention: "",
        dateExpiration: ""
    });
    const [error, setError] = useState(null);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await DiplomeService.create({
                ...data,
                dateObtention: data.dateObtention || null,
                dateExpiration: data.dateExpiration || null
            });
            navigate("/diplomes-ssiap");
        } catch {
            setError("Échec de la création.");
        }
    };

    return (
        <DiplomeForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default DiplomeCreate;
