// src/components/articleContratTravails/ArticleContratTravailView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import { Container, Card, Button, Row, Col, Spinner, Alert, Badge } from "react-bootstrap";
import { 
    FaFileContract, FaArrowLeft, FaEdit, FaTrash, FaRegFileAlt, 
    FaClock, FaCalendarAlt, FaTimes, FaRegTimesCircle
} from "react-icons/fa";
import "../../styles/ArticleContratTravailView.css";

export default function ArticleContratTravailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        ArticleContratTravailService.getById(id)
            .then(res => {
                setArticle(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement de l'article:", err);
                setError("Impossible de charger l'article. Veuillez réessayer.");
                setLoading(false);
            });
    }, [id]);

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

    if (!article) return null;

    return (
        <Container className="article-view-container py-4">
            <Card className="shadow-sm article-detail-card">
                <Card.Header className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0 d-flex align-items-center">
                            <FaFileContract className="me-2 text-primary" />
                            Article de contrat de travail
                        </h2>
                        <div>
                            <Button 
                                variant="outline-secondary"
                                className="btn-circle me-2"
                                onClick={() => navigate('/article-contrat-travail')}
                            >
                                <FaArrowLeft />
                            </Button>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body className="px-4 py-4">
                    <Row>
                        <Col xs={12} className="mb-4">
                            <Card className="border-0 bg-light">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <Badge bg="primary" className="mb-2 px-3 py-2">ID: {article.id}</Badge>
                                            {article.contratDeTravailId && (
                                                <Badge bg="info" className="mb-2 ms-2 px-3 py-2">
                                                    Contrat #{article.contratDeTravailId}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="d-flex">
                                            <Button 
                                                as={Link} 
                                                to={`/article-contrat-travail/edit/${article.id}`} 
                                                variant="warning"
                                                className="me-2"
                                            >
                                                <FaEdit className="me-2" /> Modifier
                                            </Button>
                                            <Button 
                                                variant="danger"
                                                onClick={() => setShowDeleteModal(true)}
                                            >
                                                <FaTrash className="me-2" /> Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} className="mb-4">
                            <h4 className="article-title">
                                {article.libelle || "Sans titre"}
                            </h4>
                            <hr />
                        </Col>

                        <Col xs={12} className="mb-4">
                            <div className="article-content-container">
                                <h5 className="mb-3">
                                    <FaRegFileAlt className="me-2 text-muted" />
                                    Contenu de l'article
                                </h5>
                                <div className="article-content">
                                    {article.contenu 
                                        ? <div className="article-content-text">{article.contenu}</div>
                                        : <p className="text-muted fst-italic">Aucun contenu disponible</p>
                                    }
                                </div>
                            </div>
                        </Col>
                    </Row>

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
                                <p>Êtes-vous sûr de vouloir supprimer cet article ?</p>
                                <p className="text-danger fw-bold">Cette action est irréversible.</p>
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
                    <div className="d-flex justify-content-between align-items-center">
                        <Button 
                            variant="outline-primary" 
                            onClick={() => navigate(-1)}
                        >
                            <FaArrowLeft className="me-2" /> Retour
                        </Button>
                        <Button 
                            as={Link} 
                            to={`/article-contrat-travail/edit/${article.id}`} 
                            variant="warning"
                        >
                            <FaEdit className="me-2" /> Modifier
                        </Button>
                    </div>
                </Card.Footer>
            </Card>
        </Container>    );
}
