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
            </div>            <div className="field">
                <span className="label">Conditions générales :</span>
                <p>{devis.conditionsGenerales || "—"}</p>
            </div>

            {/* Affichage des totaux calculés */}
            <div className="totals-section">
                <h3>Montants totaux</h3>
                <div className="field-group">
                    <div className="field">
                        <span className="label">Montant total HT :</span>
                        <span className="amount">{devis.montantTotalHT?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                    </div>
                    <div className="field">
                        <span className="label">TVA totale :</span>
                        <span className="amount">{devis.montantTotalTVA?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                    </div>
                    <div className="field">
                        <span className="label">Montant total TTC :</span>
                        <span className="amount highlight">{devis.montantTotalTTC?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                    </div>
                </div>
                <div className="field-group">
                    <div className="field">
                        <span className="label">Nombre total d'agents :</span>
                        <span>{devis.nombreTotalAgents}</span>
                    </div>
                    <div className="field">
                        <span className="label">Nombre total d'heures :</span>
                        <span>{devis.nombreTotalHeures}</span>
                    </div>
                </div>
            </div>

            <div className="field">
                <span className="label">Missions liées :</span>
                {(devis.missions && devis.missions.length > 0)
                    ? (
                        <div className="missions-list">
                            <table className="missions-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Titre</th>
                                        <th>Type</th>
                                        <th>Statut</th>
                                        <th>Période</th>
                                        <th>Agents</th>
                                        <th>Heures</th>
                                        <th>Montant HT</th>
                                        <th>Montant TTC</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devis.missions.map(mission => (
                                        <tr key={mission.id}>
                                            <td>{mission.id}</td>
                                            <td>{mission.titre || "—"}</td>
                                            <td>{mission.typeMission || "—"}</td>
                                            <td>{mission.statutMission || "—"}</td>
                                            <td>
                                                {mission.dateDebut ? new Date(mission.dateDebut).toLocaleDateString() : "—"} 
                                                {" → "}
                                                {mission.dateFin ? new Date(mission.dateFin).toLocaleDateString() : "—"}
                                            </td>
                                            <td>{mission.nombreAgents}</td>
                                            <td>{mission.quantite}</td>
                                            <td>{mission.montantHT?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</td>
                                            <td>{mission.montantTTC?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</td>
                                            <td>
                                                <button
                                                    className="btn-link"
                                                    onClick={() => navigate(`/missions/${mission.id}`)}
                                                >
                                                    Détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                    : <em>Aucune mission associée à ce devis</em>
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
