import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import "../../styles/TarifMissionForm.css";

export default function TarifMissionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tarif, setTarif] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        TarifMissionService.getById(id)
            .then(({ data }) => setTarif(data))
            .catch(() => setError("Impossible de charger le tarif"));
    }, [id]);

    if (error)   return <p className="error">{error}</p>;
    if (!tarif)  return <p>Chargement…</p>;

    return (
        <div className="tarif-form">
            <h2>Détail du tarif #{tarif.id}</h2>
            <p><strong>Type mission :</strong> {tarif.typeMission}</p>
            <p><strong>Prix unitaire HT :</strong> {tarif.prixUnitaireHT}</p>
            <p><strong>Maj. nuit :</strong> {tarif.majorationNuit}</p>
            <p><strong>Maj. weekend :</strong> {tarif.majorationWeekend}</p>
            <p><strong>Maj. dimanche :</strong> {tarif.majorationDimanche}</p>
            <p><strong>Maj. férié :</strong> {tarif.majorationFerie}</p>
            <p><strong>TVA :</strong> {tarif.tauxTVA}</p>

            <Link to={`/tarifs/edit/${id}`} className="btn-submit">✏️ Modifier</Link>
            <button onClick={() => navigate("/tarifs")} className="btn-add">← Retour</button>
        </div>
    );
}
