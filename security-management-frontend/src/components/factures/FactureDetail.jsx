import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import FactureService                  from "../../services/FactureService";
import "../../styles/FactureForm.css";  // on peut réutiliser les styles du form

export default function FactureDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [facture, setFacture] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        FactureService.getById(id)
            .then(({ data }) => setFacture(data))
            .catch(() => setError("Impossible de charger la facture"));
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!facture) return <p>Chargement…</p>;

    return (
        <div className="facture-form">
            <h2>Détail de la facture #{facture.id}</h2>
            <p><strong>Référence :</strong> {facture.referenceFacture}</p>
            <p><strong>Date d’émission :</strong> {facture.dateEmission}</p>
            <p><strong>Statut :</strong> {facture.statut}</p>
            <p><strong>Montant HT :</strong> {facture.montantHT} €</p>
            <p><strong>Montant TVA :</strong> {facture.montantTVA} €</p>
            <p><strong>Montant TTC :</strong> {facture.montantTTC} €</p>
            <p><strong>Devis :</strong> {facture.devisId ?? "-"}</p>
            <p><strong>Entreprise :</strong> {facture.entrepriseId}</p>
            <p><strong>Client :</strong> {facture.clientId}</p>
            <p><strong>Contrat :</strong> {facture.contratId || "-"}</p>
            <Link to={`/factures/edit/${id}`} className="btn-submit">
                ✏️ Modifier
            </Link>
            <button onClick={() => navigate("/factures")} className="btn-add">
                ← Retour à la liste
            </button>
        </div>
    );
}
