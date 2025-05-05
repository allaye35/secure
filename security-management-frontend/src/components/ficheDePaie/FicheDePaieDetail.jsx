import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import FicheDePaieService               from "../../services/FicheDePaieService";
import "../../styles/FicheDePaieForm.css"; // réutilise le style du form

export default function FicheDePaieDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [fp, setFp] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        FicheDePaieService.getById(id)
            .then(({ data }) => setFp(data))
            .catch(() => setError("Impossible de charger"));
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!fp)    return <p>Chargement…</p>;

    return (
        <div className="fp-form">
            <h2>Fiche de paie #{fp.id}</h2>
            <p><strong>Réf :</strong> {fp.reference}</p>
            <p><strong>Période :</strong> {fp.periodeDebut} → {fp.periodeFin}</p>
            <p><strong>Salaire de base :</strong> {fp.salaireDeBase} €</p>
            <p><strong>Total brut :</strong> {fp.totalBrut} €</p>
            <p><strong>Net à payer :</strong> {fp.netAPayer} €</p>
            <p><strong>Agent ID :</strong> {fp.agentDeSecuriteId}</p>
            <p><strong>Contrat ID :</strong> {fp.contratDeTravailId ?? "-"}</p>
            <Link to={`/fiches/edit/${id}`} className="btn-submit">
                ✏️ Modifier
            </Link>
            <button onClick={() => nav("/fiches")} className="btn-add">
                ← Retour
            </button>
        </div>
    );
}
