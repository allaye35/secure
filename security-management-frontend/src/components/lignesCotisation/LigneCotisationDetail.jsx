import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import LigneCotisationService           from "../../services/LigneCotisationService";
import "../../styles/LigneCotisationForm.css";

export default function LigneCotisationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        LigneCotisationService.getById(id)
            .then(({ data }) => setItem(data))
            .catch(() => setError("Impossible de charger la ligne"));
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!item) return <p>Chargement…</p>;

    return (
        <div className="ligne-form">
            <h2>Détail ligne #{item.id}</h2>
            <p><strong>Libellé :</strong> {item.libelle}</p>
            <p><strong>Taux salarié :</strong> {item.tauxSalarial}%</p>
            <p><strong>Montant salarié :</strong> {item.montantSalarial} €</p>
            <p><strong>Taux employeur :</strong> {item.tauxEmployeur}%</p>
            <p><strong>Montant employeur :</strong> {item.montantEmployeur} €</p>
            <p><strong>Fiche de paie ID :</strong> {item.ficheDePaieId}</p>            <Link to={`/lignes-cotisation/edit/${id}`} className="btn-submit">✏️ Modifier</Link>
            <button onClick={() => navigate("/lignes-cotisation")} className="btn-add">
                ← Retour à la liste
            </button>
        </div>
    );
}
