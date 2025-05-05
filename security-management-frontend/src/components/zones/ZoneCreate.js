import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import ZoneForm from "./ZoneForm";

const ZoneCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        nom: "",
        typeZone: "VILLE",
        codePostal: "",
        ville: "",
        departement: "",
        region: "",
        pays: ""
    });
    const [error, setError] = useState(null);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await ZoneService.createZone(data);
            navigate("/zones");
        } catch {
            setError("Échec de la création.");
        }
    };

    return (
        <ZoneForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default ZoneCreate;
