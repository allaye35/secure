import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DiplomeService from "../../services/DiplomeService";
import DiplomeForm    from "./DiplomeForm";

const DiplomeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        niveau: "SSIAP1",
        dateObtention: "",
        dateExpiration: ""
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        DiplomeService.getById(id)
            .then(res => {
                const dto = res.data;
                setData({
                    agentId:       dto.agentId,
                    niveau:        dto.niveau,
                    dateObtention: dto.dateObtention?.slice(0,10) || "",
                    dateExpiration:dto.dateExpiration?.slice(0,10) || ""
                });
            })
            .catch(() => setError("Impossible de charger le diplôme."));
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await DiplomeService.update(id, {
                ...data,
                dateObtention: data.dateObtention || null,
                dateExpiration: data.dateExpiration || null
            });
            navigate("/diplomes-ssiap");
        } catch {
            setError("Échec de la mise à jour.");
        }
    };

    return (
        <DiplomeForm
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default DiplomeEdit;
