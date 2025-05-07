import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DiplomeService from "../../services/DiplomeService";
import AgentService from "../../services/AgentService";
import "../../styles/DiplomeDetail.css"; // Utilisation d'un fichier CSS dédié

const DiplomeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [diplome, setDiplome] = useState(null);
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Récupérer les informations du diplôme
                const diplomeRes = await DiplomeService.getById(id);
                const diplomeData = diplomeRes.data;
                setDiplome(diplomeData);
                
                // Récupérer les informations de l'agent associé
                try {
                    const agentRes = await AgentService.getAgentById(diplomeData.agentId);
                    setAgent(agentRes.data);
                } catch (err) {
                    console.error(`Erreur lors du chargement de l'agent ${diplomeData.agentId}:`, err);
                    setAgent({ nom: "Inconnu", prenom: "", email: "Agent non trouvé" });
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement du diplôme:", err);
                setError("Impossible de charger les détails du diplôme.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    // Fonction pour déterminer le statut du diplôme
    const getDiplomeStatus = (dateExpiration) => {
        if (!dateExpiration) return { status: "indefini", label: "Pas de date d'expiration" };
        
        const today = new Date();
        const expirationDate = new Date(dateExpiration);
        
        if (expirationDate < today) {
            return { status: "expired", label: "Expiré" };
        }
        
        // Calcul de la différence en jours
        const diffTime = expirationDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 90) { // 3 mois
            return { status: "expiring-soon", label: "Expire bientôt" };
        }
        
        return { status: "valid", label: "Valide" };
    };
    
    // Fonction pour calculer la durée de validité
    const getValidityDuration = (dateObtention, dateExpiration) => {
        if (!dateObtention || !dateExpiration) return "Non définie";
        
        const obtentionDate = new Date(dateObtention);
        const expirationDate = new Date(dateExpiration);
        
        // Calcul de la différence en années et mois
        let years = expirationDate.getFullYear() - obtentionDate.getFullYear();
        let months = expirationDate.getMonth() - obtentionDate.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        if (years > 0 && months > 0) {
            return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
        } else if (years > 0) {
            return `${years} an${years > 1 ? 's' : ''}`;
        } else {
            return `${months} mois`;
        }
    };

    // Fonction pour calculer le temps restant avant expiration
    const getRemainingTime = (dateExpiration) => {
        if (!dateExpiration) return "Non applicable";
        
        const today = new Date();
        const expirationDate = new Date(dateExpiration);
        
        if (expirationDate < today) {
            return "Expiré";
        }
        
        // Calcul de la différence en jours
        const diffTime = expirationDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} mois`;
        } else {
            const years = Math.floor(diffDays / 365);
            const remainingMonths = Math.floor((diffDays % 365) / 30);
            
            if (remainingMonths > 0) {
                return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
            } else {
                return `${years} an${years > 1 ? 's' : ''}`;
            }
        }
    };

    // Fonction pour formater les dates
    const formatDate = (dateString) => {
        if (!dateString) return "Non spécifiée";
        
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Fonction pour afficher la description du niveau SSIAP
    const getNiveauDescription = (niveau) => {
        switch(niveau) {
            case 'SSIAP_1':
                return "Agent de sécurité incendie et d'assistance aux personnes";
            case 'SSIAP_2':
                return "Chef d'équipe de sécurité incendie et d'assistance aux personnes";
            case 'SSIAP_3':
                return "Chef de service de sécurité incendie et d'assistance aux personnes";
            default:
                return "Non spécifié";
        }
    };

    if (loading) return <div className="loading">Chargement des détails...</div>;
    if (error) return <p className="error">{error}</p>;
    if (!diplome) return <p className="error">Diplôme non trouvé.</p>;

    const diplomeStatus = getDiplomeStatus(diplome.dateExpiration);

    return (
        <div className="diplome-detail-container">
            <div className="detail-header">
                <div className="header-title">
                    <h2>Diplôme SSIAP {diplome.niveau?.split('_')[1]}</h2>
                    <div className={`status-badge status-${diplomeStatus.status}`}>
                        {diplomeStatus.label}
                    </div>
                </div>
                <div className="detail-actions">
                    <Link to="/diplomes-ssiap" className="btn btn-secondary">
                        <i className="fas fa-arrow-left"></i> Retour à la liste
                    </Link>
                    <Link to={`/diplomes-ssiap/edit/${id}`} className="btn btn-primary">
                        <i className="fas fa-edit"></i> Modifier
                    </Link>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-card">
                    <div className="card-header">
                        <h3>Informations du diplôme</h3>
                        <div className="diplome-badge">{diplome.niveau?.replace("_", " ")}</div>
                    </div>
                    <div className="card-body">
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Référence :</span>
                                <span className="detail-value">#{diplome.id}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Description :</span>
                                <span className="detail-value">{getNiveauDescription(diplome.niveau)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Date d'obtention :</span>
                                <span className="detail-value">{formatDate(diplome.dateObtention)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Date d'expiration :</span>
                                <span className="detail-value">{formatDate(diplome.dateExpiration)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Durée de validité :</span>
                                <span className="detail-value">{getValidityDuration(diplome.dateObtention, diplome.dateExpiration)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Temps restant :</span>
                                <span className="detail-value">{getRemainingTime(diplome.dateExpiration)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="card-header">
                        <h3>Titulaire du diplôme</h3>
                        {agent && <Link to={`/agents/${agent.id}`} className="btn btn-sm">Voir profil</Link>}
                    </div>
                    <div className="card-body">
                        {agent ? (
                            <div className="agent-profile">
                                <div className="agent-avatar">
                                    {agent.nom && agent.prenom ? `${agent.nom.charAt(0)}${agent.prenom.charAt(0)}` : "??"}
                                </div>
                                <div className="agent-details">
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Nom complet :</span>
                                            <span className="detail-value">{agent.nom} {agent.prenom}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">ID :</span>
                                            <span className="detail-value">{agent.id}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Email :</span>
                                            <span className="detail-value">{agent.email || "Non spécifié"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Téléphone :</span>
                                            <span className="detail-value">{agent.telephone || "Non spécifié"}</span>
                                        </div>
                                        {agent.adresse && (
                                            <div className="detail-item">
                                                <span className="detail-label">Adresse :</span>
                                                <span className="detail-value">{agent.adresse}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="no-data">Informations de l'agent non disponibles.</p>
                        )}
                    </div>
                </div>

                {/* Ajout d'une carte pour les actions avancées */}
                <div className="detail-card actions-card">
                    <div className="card-header">
                        <h3>Actions</h3>
                    </div>
                    <div className="card-body">
                        <div className="action-buttons">
                            <button 
                                className="btn btn-action"
                                onClick={() => window.print()}
                            >
                                <i className="fas fa-print"></i> Imprimer le diplôme
                            </button>
                            
                            <Link to={`/diplomes-ssiap/edit/${id}`} className="btn btn-action">
                                <i className="fas fa-sync-alt"></i> Renouveler le diplôme
                            </Link>
                            
                            <button 
                                className="btn btn-action btn-danger"
                                onClick={() => {
                                    if(window.confirm("Êtes-vous sûr de vouloir supprimer ce diplôme ?")) {
                                        DiplomeService.delete(id)
                                            .then(() => navigate("/diplomes-ssiap"))
                                            .catch(err => alert("Erreur lors de la suppression"));
                                    }
                                }}
                            >
                                <i className="fas fa-trash"></i> Supprimer le diplôme
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiplomeDetail;