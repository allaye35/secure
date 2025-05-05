// src/components/devis/DevisDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams }     from "react-router-dom";
import DevisService                    from "../../services/DevisService";
import "../../styles/DevisDetail.css";

export default function DevisDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [devis, setDevis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    useEffect(() => {
        DevisService.getById(id)
            .then(response => {
                if (response && response.data) {
                    setDevis(response.data);
                } else {
                    setError("Données du devis non reçues");
                }
            })
            .catch(err => {
                console.error("Erreur lors du chargement du devis:", err);
                setError("Devis introuvable");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Chargement du détail…</p>;
    if (error)   return <p className="error">{error}</p>;
    if (!devis)  return <p className="error">Aucun détail disponible</p>;

    return (
        <div className="devis-detail">
            <h2>Détail du devis #{devis.id}</h2>

            <div className="field">
                <span className="label">Référence :</span>
                <span>{devis.referenceDevis}</span>
            </div>

            <div className="field">
                <span className="label">Description :</span>
                <p>{devis.description || "—"}</p>
            </div>

            <div className="field-group">
                <div className="field">
                    <span className="label">Statut :</span>
                    <span>{devis.statut}</span>
                </div>
                <div className="field">
                    <span className="label">Date création :</span>
                    <span>{devis.dateCreation ? new Date(devis.dateCreation).toLocaleDateString() : "—"}</span>
                </div>
                <div className="field">
                    <span className="label">Date validité :</span>
                    <span>{devis.dateValidite ? new Date(devis.dateValidite).toLocaleDateString() : "—"}</span>
                </div>
            </div>

            <div className="field-group">
                <div className="field">
                    <span className="label">Entreprise :</span>
                    <span>{devis.entrepriseId || "—"}</span>
                </div>
                <div className="field">
                    <span className="label">Client :</span>
                    <span>{devis.clientId || "—"}</span>
                </div>
            </div>

            <div className="field">
                <span className="label">Conditions générales :</span>
                <p>{devis.conditionsGenerales || "—"}</p>
            </div>

            <div className="field">
                <span className="label">Missions liées :</span>
                {devis.missionIds?.length > 0
                    ? (
                        <ul>
                            {devis.missionIds.map(mid => (
                                <li key={mid}>
                                    <button
                                        className="link"
                                        onClick={() => navigate(`/missions/${mid}`)}
                                    >
                                        Mission #{mid}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )
                    : <em>Aucune</em>
                }
            </div>

            <div className="actions">
                <button onClick={() => navigate("/devis")}>← Retour</button>
                <button onClick={() => navigate(`/devis/edit/${devis.id}`)}>✏️ Modifier</button>
                <button
                    onClick={() => {
                        if (window.confirm("Confirmer la suppression ?")) {
                            DevisService.delete(devis.id).then(() => navigate("/devis"));
                        }
                    }}
                    style={{ color: "red" }}
                >
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    );
}
