// src/components/articles/ArticleDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ArticleService from "../../services/ArticleService";
import ContratService from "../../services/ContratService";
import "../../styles/ArticleDetail.css";
import { 
    Container, Row, Col, Card, Badge, Button, 
    Spinner, Alert, Breadcrumb, Overlay, Tooltip 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, faPencilAlt, faTrash, faArrowLeft, 
    faFileContract, faFileAlt, faLink, faCalendarAlt,
    faExclamationTriangle, faHourglassHalf, faCheckCircle, 
    faTimesCircle, faInfoCircle, faCopy, faHome, faListUl,
    faPrint, faDownload, faFileSignature, faUserTie, faPhone,
    faEnvelope, faBuilding, faEdit, faShareAlt
} from '@fortawesome/free-solid-svg-icons';

export default function ArticleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [contrat, setContrat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [copieLien, setCopieLien] = useState(false);
    const shareButtonRef = useRef(null);

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
    }, [id]);    const handleDelete = () => {
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
    
    const handleShare = () => {
        // Copier l'URL dans le presse-papier
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setCopieLien(true);
                setTimeout(() => setCopieLien(false), 2000);
            })
            .catch(err => console.error('Erreur lors de la copie :', err));
    };
    
    const handlePrint = () => {
        window.print();
    };    if (loading) {
        return (
            <Container className="loading-container py-5 text-center">
                <Spinner animation="border" variant="primary" className="loading-spinner" />
                <p className="mt-3 text-primary">Chargement des détails de l'article...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="article-error-state text-center py-5">
                <div className="error-icon-container mb-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="error-state-icon text-danger" size="3x" />
                </div>
                <h3 className="mb-3">Une erreur est survenue</h3>
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
                <Button 
                    variant="outline-primary"
                    onClick={() => navigate("/articles")}
                    className="mt-2"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour à la liste
                </Button>
            </Container>
        );
    }    return (
        <Container fluid className="article-detail-container py-4 px-md-4">
            <Breadcrumb className="article-breadcrumb mb-4">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    <FontAwesomeIcon icon={faHome} className="me-2" /> Accueil
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/articles" }}>
                    <FontAwesomeIcon icon={faListUl} className="me-2" /> Articles
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    #{article.numero || article.id}
                </Breadcrumb.Item>
            </Breadcrumb>
            
            <div className="article-header-actions mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="article-metadata mb-3 mb-md-0">
                        <h1 className="article-title">
                            <FontAwesomeIcon icon={faFileAlt} className="me-3 text-primary" />
                            {article.titre}
                        </h1>
                        <div className="article-identifiers">
                            <Badge bg="info" className="me-2 article-badge">N° {article.numero || "—"}</Badge>
                            <Badge bg="secondary" className="article-badge">Article #{article.id}</Badge>
                        </div>
                    </div>
                    <div className="article-quick-actions d-flex flex-wrap justify-content-start justify-content-md-end">
                        <Button 
                            variant="outline-secondary"
                            size="sm" 
                            className="action-btn me-2 mb-2"
                            title="Imprimer cet article"
                            onClick={handlePrint}
                        >
                            <FontAwesomeIcon icon={faPrint} />
                        </Button>
                        <Button 
                            variant="outline-secondary"
                            size="sm" 
                            className="action-btn me-2 mb-2"
                            title="Partager cet article"
                            onClick={handleShare}
                            ref={shareButtonRef}
                        >
                            <FontAwesomeIcon icon={faShareAlt} />
                        </Button>
                        <Overlay target={shareButtonRef.current} show={copieLien} placement="top">
                            {(props) => (
                                <Tooltip id="copy-tooltip" {...props}>
                                    Lien copié !
                                </Tooltip>
                            )}
                        </Overlay>
                        <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="action-btn me-2 mb-2"
                            title="Modifier cet article"
                            onClick={() => navigate(`/articles/edit/${id}`)}
                        >
                            <FontAwesomeIcon icon={faPencilAlt} className="me-1" /> Modifier
                        </Button>
                        <Button 
                            variant="outline-danger"
                            size="sm"
                            className="action-btn mb-2"
                            title="Supprimer cet article"
                            onClick={handleDelete}
                        >
                            <FontAwesomeIcon icon={faTrash} className="me-1" /> Supprimer
                        </Button>
                    </div>
                </div>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="article-content-card shadow-sm mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h3 className="article-content-section-title mb-0">
                                <FontAwesomeIcon icon={faFileContract} className="me-2 text-primary" /> 
                                Contenu de l'article
                            </h3>
                            {article.createdDate && (
                                <small className="text-muted">
                                    Créé le {new Date(article.createdDate).toLocaleDateString()}
                                </small>
                            )}
                        </Card.Header>
                        <Card.Body>
                            {article.contenu ? (
                                <div className="article-content-text">
                                    {article.contenu.split('\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="light" className="text-center py-4">
                                    <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-muted" />
                                    <span className="fst-italic">Aucun contenu disponible pour cet article.</span>
                                </Alert>
                            )}
                        </Card.Body>
                        {article.notes && (
                            <Card.Footer>
                                <small className="text-muted">
                                    <strong>Notes:</strong> {article.notes}
                                </small>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>                <Col lg={4}>
                    {contrat ? (
                        <Card className="article-related-contract shadow-sm mb-4">
                            <Card.Header className="contract-header bg-primary text-white">
                                <h3 className="mb-0 d-flex align-items-center fs-5">
                                    <FontAwesomeIcon icon={faLink} className="me-2" /> 
                                    Contrat associé
                                </h3>
                            </Card.Header>
                            <Card.Body>
                                <div className="contract-reference mb-3">
                                    <h4 className="mb-3 contract-ref-code">
                                        <Badge bg="info" className="me-2">
                                            <FontAwesomeIcon icon={faFileSignature} className="me-1" />
                                            {contrat.referenceContrat || `Contrat #${contrat.id}`}
                                        </Badge>
                                    </h4>
                                    
                                    {contrat.client && (
                                        <div className="contract-client mb-3">
                                            <div className="client-info">
                                                <FontAwesomeIcon icon={faUserTie} className="me-2 text-secondary" />
                                                <strong>Client:</strong> {contrat.client.nom}
                                            </div>
                                            {contrat.client.telephone && (
                                                <div className="client-info ms-4 ps-1">
                                                    <FontAwesomeIcon icon={faPhone} className="me-2 text-muted" />
                                                    {contrat.client.telephone}
                                                </div>
                                            )}
                                            {contrat.client.email && (
                                                <div className="client-info ms-4 ps-1">
                                                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-muted" />
                                                    {contrat.client.email}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <hr className="contract-divider my-3" />
                                
                                <div className="contract-details">
                                    <div className="contract-detail-item">
                                        <div className="contract-detail-icon">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" />
                                        </div>
                                        <div className="contract-detail-content">
                                            <div className="contract-detail-label">Date de signature</div>
                                            <div className="contract-detail-value">
                                                {contrat.dateSignature ? 
                                                    new Date(contrat.dateSignature).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : "Non spécifiée"
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="contract-detail-item">
                                        <div className="contract-detail-icon">
                                            <FontAwesomeIcon icon={faHourglassHalf} className="text-primary" />
                                        </div>
                                        <div className="contract-detail-content">
                                            <div className="contract-detail-label">Durée</div>
                                            <div className="contract-detail-value">
                                                {contrat.dureeMois} {contrat.dureeMois > 1 ? "mois" : "mois"}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {contrat.taciteReconduction != null && (
                                        <div className="contract-detail-item">
                                            <div className="contract-detail-icon">
                                                {contrat.taciteReconduction ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
                                                )}
                                            </div>
                                            <div className="contract-detail-content">
                                                <div className="contract-detail-label">Tacite reconduction</div>
                                                <div className="contract-detail-value">
                                                    {contrat.taciteReconduction ? "Oui" : "Non"}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="contract-detail-item">
                                        <div className="contract-detail-icon">
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-primary" />
                                        </div>
                                        <div className="contract-detail-content">
                                            <div className="contract-detail-label">Préavis</div>
                                            <div className="contract-detail-value">
                                                {contrat.preavisMois} {contrat.preavisMois > 1 ? "mois" : "mois"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-light">
                                <Button 
                                    variant="outline-primary" 
                                    className="w-100"
                                    onClick={() => navigate(`/contrats/${contrat.id}`)}
                                >
                                    <FontAwesomeIcon icon={faEye} className="me-2" /> 
                                    Voir le contrat complet
                                </Button>
                            </Card.Footer>
                        </Card>
                    ) : (
                        <Card className="article-empty-state shadow-sm mb-4">
                            <Card.Body className="text-center py-4">
                                <div className="empty-state-icon mb-3">
                                    <FontAwesomeIcon icon={faLink} size="3x" className="text-muted" />
                                </div>
                                <h4>Aucun contrat associé</h4>
                                <p className="text-muted mb-4">
                                    Cet article n'est pas associé à un contrat actuellement.
                                </p>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => navigate(`/articles/edit/${id}`)}
                                >
                                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                                    Modifier pour associer un contrat
                                </Button>
                            </Card.Body>
                        </Card>
                    )}
                    
                    {article.createdDate || article.lastModified ? (
                        <Card className="article-metadata-card shadow-sm mb-4">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0 fs-6">Métadonnées</h5>
                            </Card.Header>
                            <Card.Body>
                                <ul className="metadata-list">
                                    {article.createdDate && (
                                        <li>
                                            <span className="metadata-label">Créé le:</span>
                                            <span className="metadata-value">
                                                {new Date(article.createdDate).toLocaleDateString('fr-FR')}
                                            </span>
                                        </li>
                                    )}
                                    {article.lastModified && (
                                        <li>
                                            <span className="metadata-label">Dernière modification:</span>
                                            <span className="metadata-value">
                                                {new Date(article.lastModified).toLocaleDateString('fr-FR')}
                                            </span>
                                        </li>
                                    )}
                                    <li>
                                        <span className="metadata-label">Identifiant:</span>
                                        <span className="metadata-value">{article.id}</span>
                                    </li>
                                </ul>
                            </Card.Body>
                        </Card>
                    ) : null}
                </Col>
            </Row>
            
            <div className="article-footer mt-4 pt-3 border-top d-flex justify-content-between">
                <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate("/articles")}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> 
                    Retour à la liste
                </Button>
                
                <div className="d-flex">
                    <Button 
                        variant="outline-primary" 
                        className="me-2"
                        onClick={() => navigate(`/articles/edit/${id}`)}
                    >
                        <FontAwesomeIcon icon={faPencilAlt} className="me-2" /> 
                        Modifier
                    </Button>
                    <Button 
                        variant="outline-danger"
                        onClick={handleDelete}
                    >
                        <FontAwesomeIcon icon={faTrash} className="me-2" /> 
                        Supprimer
                    </Button>
                </div>
            </div>
        </Container>
    );
}
