import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PointageService from "../../services/PointageService";
import "../../styles/PointageForm.css";

export default function PointageForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [dto, setDto] = useState({
        datePointage: "",
        estPresent: false,
        estRetard: false,
        positionActuelle: { latitude: "", longitude: "" },
        missionId: ""
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            PointageService.getById(id)
                .then(({ data }) => setDto({
                    datePointage: data.datePointage.slice(0, 16),
                    estPresent: data.estPresent,
                    estRetard: data.estRetard,
                    positionActuelle: data.positionActuelle || { latitude: "", longitude: "" },
                    missionId: data.mission?.id ?? ""
                }))
                .catch(() => setError("Impossible de charger ce pointage"));
        }
    }, [id, isEdit]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        if (name === "latitude" || name === "longitude") {
            setDto(d => ({
                ...d,
                positionActuelle: { ...d.positionActuelle, [name]: value }
            }));
        } else if (type === "checkbox") {
            setDto(d => ({ ...d, [name]: checked }));
        } else {
            setDto(d => ({ ...d, [name]: value }));
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        setError("");
        const payload = {
            datePointage: new Date(dto.datePointage).toISOString(),
            estPresent: dto.estPresent,
            estRetard: dto.estRetard,
            positionActuelle: {
                latitude: parseFloat(dto.positionActuelle.latitude),
                longitude: parseFloat(dto.positionActuelle.longitude)
            },
            missionId: parseInt(dto.missionId, 10)
        };
        const call = isEdit
            ? PointageService.update(id, payload)
            : PointageService.create(payload);

        call.then(() => navigate("/pointages"))
            .catch(err => setError(err.response?.data?.message || "Erreur serveur"));
    };

    return (
        <div className="pointage-form">
            <h2>{isEdit ? "Modifier" : "Créer"} un pointage</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Date & heure *
                    <input
                        type="datetime-local"
                        name="datePointage"
                        value={dto.datePointage}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Présent
                    <input
                        type="checkbox"
                        name="estPresent"
                        checked={dto.estPresent}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Retard
                    <input
                        type="checkbox"
                        name="estRetard"
                        checked={dto.estRetard}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Latitude
                    <input
                        name="latitude"
                        value={dto.positionActuelle.latitude}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Longitude
                    <input
                        name="longitude"
                        value={dto.positionActuelle.longitude}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Mission ID *
                    <input
                        name="missionId"
                        type="number"
                        value={dto.missionId}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit" className="btn-submit">
                    {isEdit ? "Mettre à jour" : "Créer"}
                </button>
            </form>
        </div>
    );
}