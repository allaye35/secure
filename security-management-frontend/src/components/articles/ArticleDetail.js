// src/components/articles/ArticleDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArticleService from "../../services/ArticleService";
import ContratService from "../../services/ContratService";
import "../../styles/ArticleDetail.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, faPencilAlt, faTrash, faArrowLeft, 
    faFileContract, faFileAlt, faLink, faCalendarAlt,
    faExclamationTriangle, faHourglassHalf, faCheckCircle, 
    faTimesCircle, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

export default function ArticleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [contrat, setContrat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1) Charger l'article
        ArticleService.getById(id)
            .then(res => {
                setArticle(res.data);
                // 2) si un contrat est référencé, le charger aussi
                if (res.data.contratId) {
                    return ContratService.getById(res.data.contratId)
                        .then(r2 => setContrat(r2.data))
                        .catch(() => {
                            // si échec, on laisse contrat à null
                            console.warn("Impossible de charger le contrat associé");
                        });
                }
            })
            .catch(err => {
                console.error(err);
                setError("Impossible de charger l'article.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
            ArticleService.remove(id)
                .then(() => {
                    navigate("/articles");
                })
                .catch(err => {
                    console.error(err);
                    alert("Une erreur est survenue lors de la suppression");
                });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary loading-spinner" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="article-error-state">
                <FontAwesomeIcon icon={faExclamationTriangle} className="error-state-icon" />
                <h3>Une erreur est survenue</h3>
                <p className="text-muted">{error}</p>
                <button 
                    className="btn btn-outline-primary mt-3" 
                    onClick={() => navigate("/articles")}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour à la liste
                </button>
            </div>
        );
    }

    return (
        <div className="article-detail-container container py-4">
            <div className="article-header">
                <div>
                    <h1 className="article-title">
                        <FontAwesomeIcon icon={faFileAlt} className="me-3" />
                        {article.titre}
                        <span className="article-numero">#{article.numero}</span>
                    </h1>
                </div>
                <div>
                    <span className="badge bg-primary article-badge">Article #{article.id}</span>
                </div>
            </div>

            <div className="article-content-card">
                <div className="article-content-section">
                    <h3 className="article-content-section-title">
                        <FontAwesomeIcon icon={faFileContract} /> Contenu de l'article
                    </h3>
                    {article.contenu ? (
                        <div className="article-content-text">
                            {article.contenu}
                        </div>
                    ) : (
                        <p className="text-muted fst-italic">Aucun contenu disponible pour cet article.</p>
                    )}
                </div>
            </div>

            {contrat ? (
                <div className="article-related-contract">
                    <div className="contract-header">
                        <h3 className="contract-title">
                            <FontAwesomeIcon icon={faLink} /> Contrat associé
                        </h3>
                        <span className="contract-reference">{contrat.referenceContrat}</span>
                    </div>
                    
                    <div className="contract-info-grid">
                        <div className="contract-info-item">
                            <div className="contract-info-label">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Date de signature
                            </div>
                            <div className="contract-info-value">
                                {new Date(contrat.dateSignature).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                        
                        <div className="contract-info-item">
                            <div className="contract-info-label">
                                <FontAwesomeIcon icon={faHourglassHalf} className="me-1" /> Durée
                            </div>
                            <div className="contract-info-value">
                                {contrat.dureeMois} mois
                            </div>
                        </div>
                        
                        {contrat.taciteReconduction != null && (
                            <div className="contract-info-item">
                                <div className="contract-info-label">Tacite reconduction</div>
                                <div className="contract-info-value">
                                    {contrat.taciteReconduction ? (
                                        <span className="contract-badge badge-success">
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Oui
                                        </span>
                                    ) : (
                                        <span className="contract-badge badge-danger">
                                            <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Non
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="contract-info-item">
                            <div className="contract-info-label">
                                <FontAwesomeIcon icon={faInfoCircle} className="me-1" /> Préavis
                            </div>
                            <div className="contract-info-value">
                                {contrat.preavisMois} mois
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        className="btn btn-outline-info mt-3" 
                        onClick={() => navigate(`/contrats/${contrat.id}`)}
                    >
                        <FontAwesomeIcon icon={faEye} className="me-2" /> Voir le contrat complet
                    </button>
                </div>
            ) : (
                <div className="article-empty-state">
                    <FontAwesomeIcon icon={faLink} className="empty-state-icon" />
                    <h3>Aucun contrat associé</h3>
                    <p className="text-muted">Cet article n'est associé à aucun contrat.</p>
                </div>
            )}

            <div className="article-actions">
                <button className="btn-return" onClick={() => navigate("/articles")}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Retour à la liste
                </button>
                <button className="btn-edit" onClick={() => navigate(`/articles/edit/${id}`)}>
                    <FontAwesomeIcon icon={faPencilAlt} /> Modifier l'article
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                    <FontAwesomeIcon icon={faTrash} /> Supprimer l'article
                </button>
            </div>
        </div>
    );
}
