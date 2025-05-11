import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
    Container, Row, Col, Card, Badge, Button, Alert, Spinner, 
    Table, ListGroup, Modal, OverlayTrigger, Tooltip 
} from 'react-bootstrap';
import { 
    FaCalendarAlt, FaCalendarCheck, FaCalendarTimes, FaUser, 
    FaEnvelope, FaPhone, FaBriefcase, FaIdBadge, FaExclamationTriangle, 
    FaArrowLeft, FaPencilAlt, FaTrashAlt, FaClock, FaMapMarkerAlt, 
    FaInfoCircle, FaCheckCircle, FaEye
} from 'react-icons/fa';
import DisponibiliteService from "../../services/DisponibiliteService";
import AgentService from "../../services/AgentService";
import "../../styles/DisponibiliteDetail.css";

const DisponibiliteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [disponibilite, setDisponibilite] = useState(null);
    const [agent, setAgent] = useState(null);
    const [overlaps, setOverlaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            return { 
                status: "future", 
                label: "À venir", 
                variant: "primary",
                icon: <FaCalendarAlt className="me-2" />
            };
        } else if (now > end) {
            return { 
                status: "past", 
                label: "Terminée", 
                variant: "secondary",
                icon: <FaCalendarTimes className="me-2" />
            };
        } else {
            return { 
                status: "active", 
                label: "En cours", 
                variant: "success",
                icon: <FaCalendarCheck className="me-2" />
            };
        }
    };

    const handleDelete = () => {
        DisponibiliteService.delete(id)
            .then(() => {
                navigate('/disponibilites');
            })
            .catch(err => {
                console.error("Erreur lors de la suppression:", err);
                setError("Impossible de supprimer la disponibilité.");
                setShowDeleteModal(false);
            });
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted">Chargement des détails de la disponibilité...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger" className="d-flex align-items-center shadow-sm">
                    <FaExclamationTriangle className="me-2" size={24} />
                    <div>
                        <h4>Erreur</h4>
                        <p className="mb-0">{error}</p>
                        <Button 
                            variant="outline-danger" 
                            className="mt-2"
                            onClick={() => navigate('/disponibilites')}
                        >
                            <FaArrowLeft className="me-2" /> Retour à la liste
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    if (!disponibilite) {
        return (
            <Container className="py-4">
                <Alert variant="warning" className="d-flex align-items-center shadow-sm">
                    <FaInfoCircle className="me-2" size={24} />
                    <div>
                        <h4>Disponibilité non trouvée</h4>
                        <p className="mb-0">La disponibilité demandée n'existe pas ou a été supprimée.</p>
                        <Button 
                            variant="outline-warning" 
                            className="mt-2"
                            onClick={() => navigate('/disponibilites')}
                        >
                            <FaArrowLeft className="me-2" /> Retour à la liste
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    const status = getDisponibiliteStatus(disponibilite.dateDebut, disponibilite.dateFin);

    const renderTooltip = (text) => (
        <Tooltip id="button-tooltip">
            {text}
        </Tooltip>
    );

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Link 
                                to="/disponibilites" 
                                className="btn btn-outline-secondary me-3 d-flex align-items-center"
                            >
                                <FaArrowLeft className="me-2" /> Retour
                            </Link>
                            <h2 className="mb-0">Détails de la disponibilité</h2>
                            <Badge 
                                bg={status.variant} 
                                className="ms-3 px-3 py-2 d-flex align-items-center" 
                                style={{ fontSize: '0.9rem' }}
                            >
                                {status.icon} {status.label}
                            </Badge>
                        </div>
                        <div className="d-flex gap-2">
                            <Link 
                                to={`/disponibilites/edit/${id}`} 
                                className="btn btn-primary d-flex align-items-center"
                            >
                                <FaPencilAlt className="me-2" /> Modifier
                            </Link>
                            <Button 
                                variant="danger" 
                                className="d-flex align-items-center"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <FaTrashAlt className="me-2" /> Supprimer
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0 d-flex align-items-center">
                                <FaCalendarAlt className="me-2" /> Informations de disponibilité
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                    <div className="d-flex align-items-center text-secondary">
                                        <FaCalendarAlt className="me-2" /> Début
                                    </div>
                                    <div className="fw-bold">
                                        {new Date(disponibilite.dateDebut).toLocaleDateString()} {new Date(disponibilite.dateDebut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                    <div className="d-flex align-items-center text-secondary">
                                        <FaCalendarAlt className="me-2" /> Fin
                                    </div>
                                    <div className="fw-bold">
                                        {new Date(disponibilite.dateFin).toLocaleDateString()} {new Date(disponibilite.dateFin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                    <div className="d-flex align-items-center text-secondary">
                                        <FaClock className="me-2" /> Durée
                                    </div>
                                    <Badge bg="light" text="dark" className="px-3 py-2">
                                        {calculateDuration(disponibilite.dateDebut, disponibilite.dateFin)}
                                    </Badge>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                    <div className="d-flex align-items-center text-secondary">
                                        <FaIdBadge className="me-2" /> Identifiant
                                    </div>
                                    <div>{disponibilite.id}</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                        <Card.Footer className="bg-light">
                            <div className="d-flex align-items-center">
                                <div 
                                    className={`rounded-circle p-2 bg-${status.variant} bg-opacity-10 me-2 d-flex align-items-center justify-content-center`} 
                                    style={{ width: '36px', height: '36px' }}
                                >
                                    {status.icon}
                                </div>
                                <div>
                                    <small className="text-muted">Statut actuel</small>
                                    <div className="fw-bold text-capitalize">{status.label}</div>
                                </div>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>

                {agent && (
                    <Col lg={8} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FaUser className="me-2" /> Informations sur l'agent
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={3} className="text-center mb-3 mb-md-0">
                                        <div 
                                            className="rounded-circle mx-auto d-flex align-items-center justify-content-center bg-primary text-white" 
                                            style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                                        >
                                            {agent.nom && agent.prenom ? `${agent.nom.charAt(0)}${agent.prenom.charAt(0)}` : "?"}
                                        </div>
                                    </Col>
                                    <Col md={9}>
                                        <h4>{agent.nom} {agent.prenom}</h4>
                                        <p className="text-muted mb-4">{agent.role?.replace('_', ' ')}</p>
                                        <Row className="mb-3">
                                            <Col sm={6}>
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="bg-light rounded-circle p-2 me-2">
                                                        <FaEnvelope className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="small text-muted">Email</div>
                                                        <div>{agent.email || "Non spécifié"}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="bg-light rounded-circle p-2 me-2">
                                                        <FaPhone className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="small text-muted">Téléphone</div>
                                                        <div>{agent.telephone || "Non spécifié"}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-circle p-2 me-2">
                                                        <FaBriefcase className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="small text-muted">Statut</div>
                                                        <Badge 
                                                            bg={agent.statut === "EN_SERVICE" ? "success" : 
                                                               agent.statut === "EN_CONGE" ? "info" : "warning"}
                                                        >
                                                            {agent.statut?.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Col>
                                            {agent.adresse && (
                                                <Col sm={6}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-light rounded-circle p-2 me-2">
                                                            <FaMapMarkerAlt className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="small text-muted">Adresse</div>
                                                            <div>{agent.adresse}</div>
                                                        </div>
                                                    </div>
                                                </Col>
                                            )}
                                        </Row>
                                    </Col>
                                </Row>
                            </Card.Body>
                            <Card.Footer className="bg-light text-center">
                                <Link 
                                    to={`/agents/${agent.id}`} 
                                    className="btn btn-outline-primary"
                                >
                                    <FaEye className="me-2" /> Voir le profil complet
                                </Link>
                            </Card.Footer>
                        </Card>
                    </Col>
                )}
            </Row>

            {overlaps.length > 0 && (
                <Row className="mb-4">
                    <Col>
                        <Card className="shadow-sm border-danger">
                            <Card.Header className="bg-danger text-white">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FaExclamationTriangle className="me-2" /> Conflits de disponibilité ({overlaps.length})
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Alert variant="danger" className="mb-3">
                                    <FaInfoCircle className="me-2" /> 
                                    Cette disponibilité est en conflit avec d'autres périodes déjà planifiées pour le même agent.
                                </Alert>
                                <Table responsive hover bordered className="border">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Période</th>
                                            <th>Durée</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overlaps.map((overlap, index) => (
                                            <tr key={overlap.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div>
                                                        <strong>Début:</strong> {new Date(overlap.dateDebut).toLocaleDateString()} {new Date(overlap.dateDebut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                    <div>
                                                        <strong>Fin:</strong> {new Date(overlap.dateFin).toLocaleDateString()} {new Date(overlap.dateFin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="light" text="dark">
                                                        {calculateDuration(overlap.dateDebut, overlap.dateFin)}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Link 
                                                        to={`/disponibilites/${overlap.id}`} 
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                    >
                                                        <FaEye className="me-1" /> Voir
                                                    </Link>
                                                    <Link 
                                                        to={`/disponibilites/edit/${overlap.id}`} 
                                                        className="btn btn-sm btn-outline-secondary"
                                                    >
                                                        <FaPencilAlt className="me-1" /> Modifier
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Modal de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title className="d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" />
                        Confirmation de suppression
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Êtes-vous sûr de vouloir supprimer cette disponibilité ?</p>
                    <p className="text-muted small">Cette action est irréversible et supprimera définitivement cette période de disponibilité.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        <FaTrashAlt className="me-2" /> Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DisponibiliteDetail;