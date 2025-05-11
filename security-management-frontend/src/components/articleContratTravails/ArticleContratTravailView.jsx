// src/components/articleContratTravails/ArticleContratTravailView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import { Container, Card, Button, Row, Col, Spinner, Alert, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
    FaFileContract, FaArrowLeft, FaEdit, FaTrash, FaRegFileAlt, 
    FaClock, FaCalendarAlt, FaTimes, FaRegTimesCircle, FaPrint,
    FaShare, FaDownload, FaRegLightbulb, FaFileSignature, FaLink,
    FaRegCalendarAlt, FaUserTie
} from "react-icons/fa";
import "../../styles/ArticleContratTravailView.css";

export default function ArticleContratTravailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [contrat, setContrat] = useState(null);
    const [contratLoading, setContratLoading] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Charger les données de l'article
    useEffect(() => {
        setLoading(true);
        ArticleContratTravailService.getById(id)
            .then(res => {
                console.log("Article récupéré:", res.data);
                setArticle(res.data);
                
                // Si l'article a un contrat associé, récupérer les infos du contrat
                if (res.data.contratDeTravailId) {
                    loadContratDetails(res.data.contratDeTravailId);
                } else {
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Erreur lors du chargement de l'article:", err);
                setError("Impossible de charger l'article. Veuillez réessayer.");
                setLoading(false);
            });
    }, [id]);
    
    // Fonction pour charger les détails du contrat associé
    const loadContratDetails = (contratId) => {
        setContratLoading(true);
        ContratDeTravailService.getById(contratId)
            .then(res => {
                console.log("Contrat récupéré:", res.data);
                setContrat(res.data);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des détails du contrat:", err);
                // Ne pas bloquer l'affichage de l'article en cas d'erreur sur le contrat
            })
            .finally(() => {
                setContratLoading(false);
                setLoading(false);
            });
    };

    const handleDelete = () => {
        setLoading(true);
        ArticleContratTravailService.remove(id)
            .then(() => {
                navigate('/article-contrat-travail', { 
                    state: { message: "Article supprimé avec succès!" }
                });
            })
            .catch(err => {
                console.error("Erreur lors de la suppression:", err);
                setError("Erreur lors de la suppression de l'article.");
                setLoading(false);
                setShowDeleteModal(false);
            });
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement de l'article...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    <Alert.Heading>
                        <FaRegTimesCircle className="me-2" />
                        Erreur
                    </Alert.Heading>
                    <p>{error}</p>
                    <div className="d-flex justify-content-end">
                        <Button variant="outline-danger" onClick={() => navigate('/article-contrat-travail')}>
                            <FaArrowLeft className="me-2" /> Retour à la liste
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    if (!article) return null;    return (
        <Container className="article-view-container py-4">
            <Card className="shadow-sm article-detail-card">
                <Card.Header className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0 d-flex align-items-center">
                            <FaFileContract className="me-2 text-primary" />
                            Article de contrat de travail
                        </h2>
                        <div className="d-flex">
                            <OverlayTrigger placement="top" overlay={<Tooltip>Retour à la liste</Tooltip>}>
                                <Button 
                                    variant="outline-secondary"
                                    className="btn-circle me-2"
                                    onClick={() => navigate('/article-contrat-travail')}
                                >
                                    <FaArrowLeft />
                                </Button>
                            </OverlayTrigger>
                            
                            <OverlayTrigger placement="top" overlay={<Tooltip>Télécharger au format PDF</Tooltip>}>
                                <Button 
                                    variant="outline-primary"
                                    className="btn-circle me-2"
                                >
                                    <FaDownload />
                                </Button>
                            </OverlayTrigger>
                            
                            <OverlayTrigger placement="top" overlay={<Tooltip>Imprimer cet article</Tooltip>}>
                                <Button 
                                    variant="outline-dark"
                                    className="btn-circle"
                                    onClick={() => window.print()}
                                >
                                    <FaPrint />
                                </Button>
                            </OverlayTrigger>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body className="px-4 py-4">
                    <Row className="animate-fade-in-up">
                        <Col xs={12} className="mb-4">
                            <Card className="border-0 bg-light info-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between flex-wrap">
                                        <div>
                                            <Badge bg="primary" className="badge-custom badge-id mb-2 px-3 py-2">
                                                ID: {article.id}
                                            </Badge>
                                            {article.contratDeTravailId && (
                                                <Badge bg="success" className="badge-custom badge-contract mb-2 px-3 py-2">
                                                    <FaFileSignature className="me-1" /> Contrat #{article.contratDeTravailId}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="d-flex mt-2 mt-md-0">
                                            <Button 
                                                as={Link} 
                                                to={`/article-contrat-travail/edit/${article.id}`} 
                                                variant="warning"
                                                className="action-btn action-btn-edit me-2"
                                            >
                                                <FaEdit className="me-2" /> Modifier
                                            </Button>
                                            <Button 
                                                variant="danger"
                                                className="action-btn action-btn-delete"
                                                onClick={() => setShowDeleteModal(true)}
                                            >
                                                <FaTrash className="me-2" /> Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {contrat && (
                            <Col xs={12} className="mb-4 animate-fade-in-up animation-delay-100">
                                <Card className="border-0 shadow-sm hover-effect">
                                    <Card.Body>
                                        <h5 className="section-title">
                                            <FaLink className="section-icon" />
                                            Contrat associé
                                        </h5>
                                        <Row>
                                            <Col md={6}>
                                                <div className="contract-meta">
                                                    <FaFileContract className="contract-meta-icon text-primary" />
                                                    <strong>Référence:</strong> <span className="ms-1">{contrat.referenceContrat || "Non définie"}</span>
                                                </div>
                                                <div className="contract-meta">
                                                    <FaFileSignature className="contract-meta-icon text-success" />
                                                    <strong>Type:</strong> <span className="ms-1">{contrat.typeContrat || "Non défini"}</span>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                {contrat.dateDebut && (
                                                    <div className="contract-meta">
                                                        <FaRegCalendarAlt className="contract-meta-icon text-info" />
                                                        <strong>Début:</strong> <span className="ms-1">{new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                )}
                                                {contrat.dateFin && (
                                                    <div className="contract-meta">
                                                        <FaRegCalendarAlt className="contract-meta-icon text-warning" />
                                                        <strong>Fin:</strong> <span className="ms-1">{new Date(contrat.dateFin).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                )}
                                            </Col>
                                        </Row>
                                        <div className="text-end mt-2">
                                            <Button 
                                                as={Link} 
                                                to={`/contrats-de-travail/${contrat.id}`} 
                                                variant="outline-primary" 
                                                size="sm"
                                            >
                                                Voir le contrat complet
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}

                        <Col xs={12} className="mb-4 animate-fade-in-up animation-delay-200">
                            <h3 className="article-title">
                                {article.libelle || "Sans titre"}
                            </h3>
                        </Col>

                        <Col xs={12} className="mb-4 animate-fade-in-up animation-delay-300">
                            <div className="article-content-container">
                                <h5 className="section-title mb-3">
                                    <FaRegFileAlt className="section-icon" />
                                    Contenu de l'article
                                </h5>
                                <div className="article-content">
                                    {article.contenu 
                                        ? <div className="article-content-text">{article.contenu}</div>
                                        : <p className="text-muted fst-italic">Aucun contenu disponible</p>
                                    }
                                </div>
                            </div>
                            
                            <Card className="mt-4 border-0 bg-light">
                                <Card.Body className="d-flex align-items-start">
                                    <FaRegLightbulb className="text-warning mt-1" size={20} />
                                    <div className="ms-3">
                                        <h6 className="mb-1">À propos de cet article</h6>
                                        <p className="text-muted mb-0">
                                            Cet article fait partie des termes et conditions qui définissent les relations professionnelles.
                                            Il sera appliqué dans le cadre du contrat de travail auquel il est rattaché.
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>                    </Row>

                    {/* Modal de confirmation de suppression */}
                    <div className={`delete-confirmation-modal ${showDeleteModal ? 'show' : ''}`}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <FaTrash className="me-2 text-danger" />
                                    Confirmation de suppression
                                </h5>
                                <Button 
                                    variant="link" 
                                    className="close-button"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    <FaTimes />
                                </Button>
                            </div>
                            <div className="modal-body">
                                <p>Êtes-vous sûr de vouloir supprimer l'article "<strong>{article.libelle}</strong>" ?</p>
                                <p className="text-danger fw-bold">Cette action est irréversible et supprimera définitivement cet article du contrat de travail associé.</p>
                            </div>
                            <div className="modal-footer">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Annuler
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <FaTrash className="me-2" /> Supprimer définitivement
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card.Body>

                <Card.Footer className="bg-white py-3">
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0">
                            <div className="d-flex">
                                <Button 
                                    variant="outline-primary" 
                                    className="action-btn action-btn-back"
                                    onClick={() => navigate(-1)}
                                >
                                    <FaArrowLeft className="me-2" /> Retour
                                </Button>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex justify-content-md-end">
                                <Button 
                                    as={Link} 
                                    to={`/article-contrat-travail/edit/${article.id}`} 
                                    variant="warning"
                                    className="action-btn action-btn-edit me-2"
                                >
                                    <FaEdit className="me-2" /> Modifier
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    className="action-btn"
                                >
                                    <FaShare className="me-2" /> Partager
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Footer>
            </Card>
        </Container>    );
}
