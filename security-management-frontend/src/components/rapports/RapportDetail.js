// src/components/rapports/RapportDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import RapportService from "../../services/RapportService";
import MissionService from "../../services/MissionService";
import { 
    Container, Row, Col, Card, Badge, Button, 
    Spinner, Alert, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFileAlt, faCalendarAlt, faUser, faBuilding,
    faEdit, faTrashAlt, faArrowLeft, faCheckCircle,
    faExclamationTriangle, faClock, faPhone, faEnvelope
} from '@fortawesome/free-solid-svg-icons';

export default function RapportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // 1️⃣ Chargement du rapport
    useEffect(() => {
        setLoading(true);
        RapportService.getRapportById(id)
            .then(({ data }) => {
                setReport(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement du rapport:", err);
                setError("Impossible de charger les détails du rapport.");
                setLoading(false);
            });
    }, [id]);

    // 2️⃣ Dès que report est chargé, on va chercher la mission
    useEffect(() => {
        if (!report?.missionId) return;

        MissionService.getById(report.missionId)
            .then(({ data }) => setMission(data))
            .catch(err => {
                console.error("Erreur lors du chargement de la mission:", err);
                // On ne bloque pas l'affichage du rapport si la mission n'est pas trouvée
            });
    }, [report]);

    // Fonction pour obtenir la couleur du badge selon le statut
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'TERMINE': return 'success';
            case 'EN_COURS': return 'warning';
            case 'ANNULE': return 'danger';
            default: return 'secondary';
        }
    };

    // Affichage du nom de statut
    const getStatusDisplayName = (status) => {
        switch (status) {
            case 'TERMINE': return 'Terminé';
            case 'EN_COURS': return 'En cours';
            case 'ANNULE': return 'Annulé';
            default: return status;
        }
    };

    // Fonction pour obtenir l'icône du statut
    const getStatusIcon = (status) => {
        switch (status) {
            case 'TERMINE': return faCheckCircle;
            case 'EN_COURS': return faClock;
            case 'ANNULE': return faExclamationTriangle;
            default: return faFileAlt;
        }
    };

    // Fonction pour supprimer le rapport
    const handleDelete = () => {
        setLoading(true);
        RapportService.deleteRapport(id)
            .then(() => {
                navigate('/rapports', { state: { message: 'Rapport supprimé avec succès', type: 'success' } });
            })
            .catch(err => {
                console.error("Erreur lors de la suppression:", err);
                setError("Impossible de supprimer le rapport.");
                setLoading(false);
                setShowDeleteConfirm(false);
            });
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement du rapport...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    {error}
                </Alert>
                <Button as={Link} to="/rapports" variant="outline-primary">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour à la liste des rapports
                </Button>
            </Container>
        );
    }

    if (!report) return null;

    return (
        <Container className="py-4">
            {/* Confirmation de suppression */}
            {showDeleteConfirm && (
                <Alert variant="danger" className="mb-4">
                    <Alert.Heading>Confirmer la suppression</Alert.Heading>
                    <p>Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.</p>
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                            Annuler
                        </Button>
                        <Button variant="danger" onClick={handleDelete} disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                                    Suppression...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                                    Confirmer la suppression
                                </>
                            )}
                        </Button>
                    </div>
                </Alert>
            )}

            {/* Navigation */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button as={Link} to="/rapports" variant="outline-secondary" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour à la liste
                </Button>
                <div>
                    <Button as={Link} to={`/rapports/edit/${report.id}`} variant="outline-primary" className="me-2">
                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                        Modifier
                    </Button>
                    <Button variant="outline-danger" onClick={() => setShowDeleteConfirm(true)}>
                        <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                        Supprimer
                    </Button>
                </div>
            </div>

            {/* Titre principal avec ID et statut */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 d-flex align-items-center">
                    <FontAwesomeIcon icon={faFileAlt} className="me-3 text-primary" />
                    Rapport d'intervention <Badge bg="secondary" className="ms-2">#{report.id}</Badge>
                </h2>
                <Badge bg={getStatusBadgeVariant(report.status)} className="fs-6 py-2 px-3">
                    <FontAwesomeIcon icon={getStatusIcon(report.status)} className="me-2" />
                    {getStatusDisplayName(report.status)}
                </Badge>
            </div>

            <Row>
                {/* Informations générales */}
                <Col lg={6} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white">
                            <h3 className="fs-5 mb-0">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                                Informations générales
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold">Date d'intervention</div>
                                        {new Date(report.dateIntervention).toLocaleString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold">Mission</div>
                                        {mission ? (
                                            <div>
                                                {mission.titre}
                                                {mission.siteId && (
                                                    <Badge bg="info" pill className="ms-2">
                                                        Site #{mission.siteId}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            report.missionId ? (
                                                <div className="d-flex align-items-center">
                                                    Mission #{report.missionId}
                                                    {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                                                </div>
                                            ) : "—"
                                        )}
                                    </div>
                                </ListGroup.Item>
                                {report.dateCreation && (
                                    <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                        <div className="ms-2 me-auto">
                                            <div className="fw-bold">Créé le</div>
                                            {new Date(report.dateCreation).toLocaleString()}
                                        </div>
                                    </ListGroup.Item>
                                )}
                                {report.dateModification && (
                                    <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                        <div className="ms-2 me-auto">
                                            <div className="fw-bold">Dernière modification</div>
                                            {new Date(report.dateModification).toLocaleString()}
                                        </div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Informations sur l'agent */}
                <Col lg={6} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white">
                            <h3 className="fs-5 mb-0">
                                <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                                Informations sur l'agent
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center mb-3">
                                <div className="avatar-placeholder bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                                    <FontAwesomeIcon icon={faUser} size="2x" className="text-secondary" />
                                </div>
                                <h4 className="mt-2 mb-0 fs-5">{report.agentNom}</h4>
                            </div>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" />
                                    <a href={`mailto:${report.agentEmail}`}>{report.agentEmail}</a>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faPhone} className="me-2 text-secondary" />
                                    <a href={`tel:${report.agentTelephone}`}>{report.agentTelephone}</a>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Détails du rapport */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white">
                    <h3 className="fs-5 mb-0">
                        <FontAwesomeIcon icon={faFileAlt} className="me-2 text-primary" />
                        Détails du rapport
                    </h3>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={12}>
                            <h4 className="fs-6 fw-bold">Description</h4>
                            <div className="p-3 bg-light rounded mb-4">
                                {report.description || <em className="text-muted">Aucune description fournie</em>}
                            </div>
                        </Col>
                        <Col md={12}>
                            <h4 className="fs-6 fw-bold">Contenu détaillé</h4>
                            <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-line' }}>
                                {report.contenu || <em className="text-muted">Aucun contenu détaillé fourni</em>}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Actions en bas de page */}
            <div className="d-flex justify-content-between mt-4">
                <Button as={Link} to="/rapports" variant="outline-secondary">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour à la liste
                </Button>
                <Button as={Link} to={`/rapports/edit/${report.id}`} variant="primary">
                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                    Modifier ce rapport
                </Button>
            </div>
        </Container>
    );
}
