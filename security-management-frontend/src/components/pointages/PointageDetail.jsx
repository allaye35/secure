import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PointageService                  from "../../services/PointageService";
import "../../styles/PointageForm.css";

export default function PointageDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pt, setPt] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        PointageService.getById(id)
            .then(({ data }) => setPt(data))
            .catch(() => setError("Impossible de charger le pointage"));
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!pt) return <p>Chargement…</p>;

    return (
        <div className="pointage-form">
            <h2>Détail du pointage #{pt.id}</h2>
            <p><strong>Date & Heure :</strong> {new Date(pt.datePointage).toLocaleString()}</p>
            <p><strong>Présent :</strong> {pt.estPresent ? "Oui" : "Non"}</p>
            <p><strong>Retard :</strong> {pt.estRetard ? "Oui" : "Non"}</p>
            <p><strong>Position :</strong> {pt.positionActuelle.latitude}, {pt.positionActuelle.longitude}</p>
            <p><strong>Mission ID :</strong> {pt.mission?.id}</p>
            <Link to={`/pointages/edit/${id}`} className="btn-submit">✏️ Modifier</Link>
            <button onClick={() => navigate("/pointages")} className="btn-add">← Retour</button>
        </div>
}
