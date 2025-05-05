// src/components/contrats/ContratDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate }     from "react-router-dom";
import ContratService                  from "../../services/ContratService";
import DevisService                    from "../../services/DevisService";
import MissionService                  from "../../services/MissionService";
// import "./ContratDetail.css";
import "../../styles/ContratDetail.css";

export default function ContratDetail() {
    const { id } = useParams();
    const nav    = useNavigate();

    const [contrat, setContrat]   = useState(null);
    const [devis, setDevis]       = useState(null);
    const [missions, setMissions] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState("");

    useEffect(() => {
        ContratService.getById(id)
            .then(({ data }) => {
                setContrat(data);
                if (data.devisId) {
                    DevisService.getById(data.devisId)
                        .then(r => setDevis(r.data))
                        .catch(() => setDevis(null));
                }
                return MissionService.getAllMissions();
            })
            .then(res => {
                const liées = res.data.filter(m => m.contratId === Number(id));
                setMissions(liées);
            })
            .catch(() => setError("Impossible de charger les données."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p className="loading">⏳ Chargement…</p>;
    if (error)   return <p className="error">{error}</p>;

    return (
        <div className="contrat-detail">
            <h2 className="title">📄 Contrat #{contrat.id}</h2>

            {/* Carte Détails */}
            <div className="card">
                <h3>Détails</h3>
                <div className="grid-2cols">
                    <span>Référence :</span><span>{contrat.referenceContrat}</span>
                    <span>Date de signature :</span><span>{contrat.dateSignature}</span>
                    <span>Durée :</span><span>{contrat.dureeMois ?? "—"} mois</span>
                    <span>Tacite reconduction :</span>
                    <span>{contrat.taciteReconduction ? "Oui" : "Non"}</span>
                    <span>Préavis :</span><span>{contrat.preavisMois ?? "—"} mois</span>
                </div>
            </div>

            {/* Carte Devis */}
            <div className="card">
                <h3>Devis associé</h3>
                {!contrat.devisId && <em>(aucun devis)</em>}
                {contrat.devisId && !devis && <em>chargement…</em>}
                {devis && (
                    <div className="grid-2cols">
                        <span>Réf. Devis :</span><span>{devis.referenceDevis}</span>
                        <span>Date Devis :</span><span>{devis.dateDevis}</span>
                    </div>
                )}
            </div>

            {/* Carte Missions */}
            <div className="card">
                <h3>Missions liées</h3>
                {!missions && <em>chargement…</em>}
                {missions && missions.length === 0 && <em>(aucune mission)</em>}
                {missions && missions.length > 0 && (
                    <ul className="mission-list">
                        {missions.map(m => (
                            <li key={m.id}>
                                <strong>{m.titreMission}</strong>
                                <div className="small">{m.dateDebutMission} → {m.dateFinMission}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Carte PDF */}
            <div className="card">
                <h3>Document PDF</h3>
                {contrat.documentPdf
                    ? <a
                        className="pdf-link"
                        href={`data:application/pdf;base64,${contrat.documentPdf}`}
                        target="_blank" rel="noreferrer"
                    >Ouvrir le PDF signé</a>
                    : <em>(aucun document)</em>
                }
            </div>

            {/* Boutons */}
            <div className="actions">
                <button className="btn" onClick={() => nav("/contrats")}>🔙 Retour</button>
                <button className="btn primary" onClick={() => nav(`/contrats/edit/${id}`)}>✏ Modifier</button>
            </div>
        </div>
    );
}
