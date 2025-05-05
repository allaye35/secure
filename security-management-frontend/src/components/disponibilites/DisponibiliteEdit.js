import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DisponibiliteService from "../../services/DisponibiliteService";
import DisponibiliteForm from "./DisponibiliteForm";

const DisponibiliteEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({
        agentId: "",
        dateDebut: "",
        dateFin: ""
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        DisponibiliteService.getById(id)
            .then(res => {
                const dto = res.data;
                setData({
                    agentId:    dto.agentId,
                    dateDebut:  new Date(dto.dateDebut).toISOString().slice(0,16),
                    dateFin:    new Date(dto.dateFin).toISOString().slice(0,16)
                });
            })
            .catch(() => setError("Impossible de charger la disponibilité."));
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await DisponibiliteService.update(id, {
                ...data,
                dateDebut: new Date(data.dateDebut).toISOString(),
                dateFin:   new Date(data.dateFin).toISOString()
            });
            navigate("/disponibilites");
        } catch {
            setError("Échec de la mise à jour.");
        }
    };

    return (
        <DisponibiliteForm
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default DisponibiliteEdit;
