import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import ZoneForm from "./ZoneForm";

const ZoneEdit = () => {
    const { id } = useParams();
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

    useEffect(() => {
        ZoneService.getZoneById(id)
            .then(res => setData(res.data))
            .catch(() => setError("Impossible de charger la zone."));
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await ZoneService.updateZone(id, data);
            navigate("/zones");
        } catch {
            setError("Échec de la mise à jour.");
        }
    };

    return (
        <ZoneForm
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default ZoneEdit;
