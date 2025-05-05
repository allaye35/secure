import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CarteProService from "../../services/CarteProService";
import CarteProForm from "./CarteProForm";

const CarteProEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({
        agentId: "",
        typeCarte: "SSP",
        numeroCarte: "",
        dateDebut: "",
        dateFin: ""
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        CarteProService.getById(id)
            .then(res => {
                const dto = res.data;
                setData({
                    agentId:     dto.agentId,
                    typeCarte:   dto.typeCarte,
                    numeroCarte: dto.numeroCarte,
                    dateDebut:   dto.dateDebut.slice(0,10),
                    dateFin:     dto.dateFin.slice(0,10)
                });
            })
            .catch(() => setError("Impossible de charger la carte."));
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await CarteProService.update(id, {
                ...data,
                dateDebut: data.dateDebut,
                dateFin:   data.dateFin
            });
            navigate("/cartes-professionnelles");
        } catch {
            setError("Échec de la mise à jour.");
        }
    };

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
