import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import CarteProService from "../../services/CarteProService";
import AgentService from "../../services/AgentService";
import "../../styles/DetailView.css";

const CarteProDetail = () => {
    const { id } = useParams();
    const [carte, setCarte] = useState(null);
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        CarteProService.getById(id)
            .then(res => {
                setCarte(res.data);
                // Si la carte a un agent associé, récupérer ses informations
                if (res.data.agentId) {
                    return AgentService.getAgentById(res.data.agentId);
                }
                return { data: null };
            })
            .then(agentRes => {
                setAgent(agentRes.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement:", err);
                setError("Impossible de charger les détails de la carte professionnelle");
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="loading">Chargement des détails...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!carte) return <div className="not-found">Carte professionnelle non trouvée</div>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <h2>Détails de la Carte Professionnelle</h2>
                <div className="detail-actions">
                    <Link to="/cartes-professionnelles" className="btn back">
                        ← Retour à la liste
                    </Link>
                    <Link to={`/cartes-professionnelles/edit/${carte.id}`} className="btn edit">
                        ✏️ Modifier
                    </Link>
                </div>
            </div>

            <div className="detail-card">
                <div className="detail-section">
                    <h3>Informations de la carte</h3>
                    <div className="detail-row">
                        <span className="detail-label">Numéro de carte:</span>
                        <span className="detail-value">{carte.numeroCarte}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">
                            {carte.typeCarte && carte.typeCarte.replace(/_/g, " ")}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Date de début:</span>
                        <span className="detail-value">
                            {new Date(carte.dateDebut).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Date de fin:</span>
                        <span className="detail-value">
                            {new Date(carte.dateFin).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Durée de validité:</span>
                        <span className="detail-value">
                            {Math.round(
                                (new Date(carte.dateFin) - new Date(carte.dateDebut)) / 
                                (1000 * 60 * 60 * 24 * 30)
                            )} mois
                        </span>
                    </div>
                </div>

                {agent && (
                    <div className="detail-section">
                        <h3>Agent associé</h3>
                        <div className="detail-row">
                            <span className="detail-label">Nom:</span>
                            <span className="detail-value">{agent.nom}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Prénom:</span>
                            <span className="detail-value">{agent.prenom}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{agent.email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Téléphone:</span>
                            <span className="detail-value">{agent.telephone}</span>
                        </div>
                        <div className="detail-actions">
                            <Link to={`/agents/${agent.id}`} className="btn view">
                                Voir le profil de l'agent
                            </Link>
                        </div>
                    </div>
                )}

                {!agent && (
                    <div className="detail-section">
                        <h3>Agent associé</h3>
                        <p className="no-data">Aucun agent associé à cette carte</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarteProDetail;