import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DisponibiliteService from "../../services/DisponibiliteService";
import AgentService from "../../services/AgentService";
import "../../styles/DisponibiliteDetail.css"; // Ce fichier CSS sera créé plus tard si nécessaire

const DisponibiliteDetail = () => {
    const { id } = useParams();
    const [disponibilite, setDisponibilite] = useState(null);
    const [agent, setAgent] = useState(null);
    const [overlaps, setOverlaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Récupérer les détails de la disponibilité
                const dispoResponse = await DisponibiliteService.getById(id);
                const dispoData = dispoResponse.data;
                setDisponibilite(dispoData);
                
                // Récupérer les informations de l'agent associé
                if (dispoData.agentId) {
                    const agentResponse = await AgentService.getAgentById(dispoData.agentId);
                    setAgent(agentResponse.data);
                }
                
                // Vérifier les chevauchements avec d'autres disponibilités
                const allDispoResponse = await DisponibiliteService.getAll();
                const allDispo = allDispoResponse.data;
                const conflicts = allDispo.filter(d => 
                    d.id !== parseInt(id) && 
                    d.agentId === dispoData.agentId &&
                    ((new Date(d.dateDebut) < new Date(dispoData.dateFin) && 
                      new Date(d.dateFin) > new Date(dispoData.dateDebut)))
                );
                setOverlaps(conflicts);
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger les détails de la disponibilité.");
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const calculateDuration = (dateDebut, dateFin) => {
        const start = new Date(dateDebut);
        const end = new Date(dateFin);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        const remainingHours = diffHours % 24;
        
        if (diffDays > 0) {
            return `${diffDays} jour${diffDays > 1 ? 's' : ''} et ${remainingHours} heure${remainingHours > 1 ? 's' : ''}`;
        } else {
            return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        }
    };

    const getDisponibiliteStatus = (dateDebut, dateFin) => {
        const now = new Date();
        const start = new Date(dateDebut);
        const end = new Date(dateFin);
        
        if (now < start) {
            return { status: "future", label: "À venir", color: "#007bff" };
        } else if (now > end) {
            return { status: "past", label: "Terminée", color: "#6c757d" };
        } else {
            return { status: "active", label: "En cours", color: "#28a745" };
        }
    };

    if (loading) return <div className="loading">Chargement en cours...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!disponibilite) return <div className="not-found">Disponibilité non trouvée.</div>;

    const status = getDisponibiliteStatus(disponibilite.dateDebut, disponibilite.dateFin);

    return (
        <div className="disponibilite-detail-container">
            <div className="header">
                <h2>Détails de la disponibilité #{id}</h2>
                <Link to="/disponibilites" className="btn back-btn">
                    ← Retour à la liste
                </Link>
            </div>

            <div className="status-block">
                <div 
                    className="status-badge"
                    style={{ backgroundColor: status.color }}
                >
                    {status.label}
                </div>
                <div className="duration">
                    Durée: {calculateDuration(disponibilite.dateDebut, disponibilite.dateFin)}
                </div>
            </div>

            <div className="content">
                <div className="card">
                    <h3>Période de disponibilité</h3>
                    <table className="detail-table">
                        <tbody>
                            <tr>
                                <th>Début:</th>
                                <td>{new Date(disponibilite.dateDebut).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Fin:</th>
                                <td>{new Date(disponibilite.dateFin).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Identifiant:</th>
                                <td>{disponibilite.id}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {agent && (
                    <div className="card">
                        <h3>Informations sur l'agent</h3>
                        <div className="agent-info">
                            <div className="agent-avatar">
                                {agent.nom && agent.prenom ? `${agent.nom.charAt(0)}${agent.prenom.charAt(0)}` : "?"}
                            </div>
                            <div className="agent-details">
                                <table className="detail-table">
                                    <tbody>
                                        <tr>
                                            <th>Nom:</th>
                                            <td>{agent.nom} {agent.prenom}</td>
                                        </tr>
                                        <tr>
                                            <th>Email:</th>
                                            <td>{agent.email || "Non spécifié"}</td>
                                        </tr>
                                        <tr>
                                            <th>Téléphone:</th>
                                            <td>{agent.telephone || "Non spécifié"}</td>
                                        </tr>
                                        <tr>
                                            <th>Statut:</th>
                                            <td>{agent.statut}</td>
                                        </tr>
                                        <tr>
                                            <th>Rôle:</th>
                                            <td>{agent.role}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="agent-actions">
                                    <Link to={`/agents/${agent.id}`} className="btn view-btn">
                                        Voir le profil complet
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {overlaps.length > 0 && (
                    <div className="card conflicts">
                        <h3>
                            <span className="conflict-icon">⚠️</span>
                            Conflits de disponibilité ({overlaps.length})
                        </h3>
                        <table className="overlap-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Début</th>
                                    <th>Fin</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overlaps.map((overlap, index) => (
                                    <tr key={overlap.id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(overlap.dateDebut).toLocaleString()}</td>
                                        <td>{new Date(overlap.dateFin).toLocaleString()}</td>
                                        <td>
                                            <Link to={`/disponibilites/${overlap.id}`} className="btn">
                                                Voir
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="actions-bar">
                <Link to={`/disponibilites/edit/${id}`} className="btn edit-btn">
                    ✏️ Modifier
                </Link>
                <button
                    className="btn delete-btn"
                    onClick={() => {
                        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette disponibilité ?")) {
                            DisponibiliteService.delete(id)
                                .then(() => {
                                    // Redirection vers la liste après suppression
                                    window.location.href = '/disponibilites';
                                })
                                .catch(err => {
                                    console.error("Erreur lors de la suppression:", err);
                                    setError("Impossible de supprimer la disponibilité.");
                                });
                        }
                    }}
                >
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    );
};

export default DisponibiliteDetail;