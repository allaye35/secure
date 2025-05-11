import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import "../../styles/ZoneDetail.css";
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, ListGroup, Modal } from "react-bootstrap";
import { 
    FaMapMarkedAlt, FaCity, FaGlobe, FaMapPin, FaUsers, 
    FaEdit, FaTrashAlt, FaArrowLeft, FaUserShield 
} from "react-icons/fa";

const ZoneDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [zone, setZone] = useState(null);
    const [error, setError] = useState(null);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agentLoading, setAgentLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchZone = useCallback(() => {
        setLoading(true);
        ZoneService.getById(id)
            .then(res => {
                setZone(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement de la zone:", err);
                setError("Impossible de charger la zone.");
                setLoading(false);
            });
    }, [id]);

    const fetchAgents = useCallback(() => {
        if (zone) {
            setAgentLoading(true);
            ZoneService.getAgentsForZone(id)
                .then(res => {
                    setAgents(res.data);
                    setAgentLoading(false);
                })
                .catch(err => {
                    console.error("Erreur lors du chargement des agents:", err);
                    setAgentLoading(false);
                });
        }
    }, [id, zone]);

    useEffect(() => { 
        fetchZone(); 
    }, [fetchZone]);

    useEffect(() => {
        if (zone) {
            fetchAgents();
        }
    }, [zone, fetchAgents]);

    // Gestionnaire pour afficher la modal de confirmation de suppression
    const handleShowDeleteModal = () => {
        setShowDeleteModal(true);
    };

    // Gestionnaire pour supprimer la zone et rediriger vers la liste
    const handleDeleteZone = () => {
        ZoneService.remove(id)
            .then(() => {
                navigate('/zones', { state: { message: `La zone ${zone.nom} a été supprimée avec succès.` } });
            })
            .catch(err => {
                console.error("Erreur lors de la suppression:", err);
                setError("Une erreur est survenue lors de la suppression de la zone.");
                setShowDeleteModal(false);
            });
    };

    // Fonction pour obtenir la couleur du badge selon le type de zone
    const getZoneTypeBadge = (type) => {
        switch(type) {
            case "VILLE": return "success";
            case "DEPARTEMENT": return "primary";
            case "REGION": return "warning";
            case "CODE_POSTAL": return "info";
            default: return "secondary";
        }
    };

    // Affichage du chargement
    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des détails de la zone...</p>
            </Container>
        );
    }

    // Affichage de l'erreur
    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    <Alert.Heading>Erreur</Alert.Heading>
                    <p>{error}</p>
                    <div className="d-flex justify-content-end">
                        <Button variant="outline-danger" onClick={() => navigate('/zones')}>
                            Retour à la liste
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="zone-detail-container py-4">
            <Row>
                <Col md={8} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h2 className="mb-0 d-flex align-items-center">
                                <FaMapMarkedAlt className="text-primary me-2" />
                                {zone.nom}
                                <Badge 
                                    bg={getZoneTypeBadge(zone.typeZone)} 
                                    pill 
                                    className="ms-2"
                                >
                                    {zone.typeZone}
                                </Badge>
                            </h2>
                            <div>
                                <Button 
                                    as={Link}
                                    to={`/zones/edit/${id}`} 
                                    variant="outline-warning"
                                    className="me-2"
                                    title="Modifier cette zone"
                                >
                                    <FaEdit />
                                </Button>
                                <Button 
                                    variant="outline-danger" 
                                    onClick={handleShowDeleteModal}
                                    title="Supprimer cette zone"
                                >
                                    <FaTrashAlt />
                                </Button>
                            </div>
                        </Card.Header>
                        
                        <Card.Body>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <Card className="border-0 bg-light mb-3">
                                        <Card.Body>
                                            <h5 className="card-title d-flex align-items-center mb-3">
                                                <FaCity className="text-primary me-2" /> 
                                                Localisation
                                            </h5>
                                            <ListGroup variant="flush" className="transparent-list">
                                                <ListGroup.Item className="d-flex justify-content-between align-items-start px-0">
                                                    <div className="ms-2 me-auto">
                                                        <div className="fw-bold">Ville</div>
                                                    </div>
                                                    <span>{zone.ville || '—'}</span>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="d-flex justify-content-between align-items-start px-0">
                                                    <div className="ms-2 me-auto">
                                                        <div className="fw-bold">Code postal</div>
                                                    </div>
                                                    <span>{zone.codePostal || '—'}</span>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="d-flex justify-content-between align-items-start px-0">
                                                    <div className="ms-2 me-auto">
                                                        <div className="fw-bold">Département</div>
                                                    </div>
                                                    <span>{zone.departement || '—'}</span>
                                                </ListGroup.Item>
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="border-0 bg-light">
                                        <Card.Body>
                                            <h5 className="card-title d-flex align-items-center mb-3">
                                                <FaGlobe className="text-primary me-2" /> 
                                                Région et pays
                                            </h5>
                                            <ListGroup variant="flush" className="transparent-list">
                                                <ListGroup.Item className="d-flex justify-content-between align-items-start px-0">
                                                    <div className="ms-2 me-auto">
                                                        <div className="fw-bold">Région</div>
                                                    </div>
                                                    <span>{zone.region || '—'}</span>
                                                </ListGroup.Item>
                                                <ListGroup.Item className="d-flex justify-content-between align-items-start px-0">
                                                    <div className="ms-2 me-auto">
                                                        <div className="fw-bold">Pays</div>
                                                    </div>
                                                    <span>{zone.pays || '—'}</span>
                                                </ListGroup.Item>
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <div className="text-center mt-4">
                                {zone.codePostal && zone.ville && (
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${zone.ville},${zone.codePostal}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-primary"
                                    >
                                        <FaMapPin className="me-2" />
                                        Voir sur Google Maps
                                    </a>
                                )}
                            </div>
                        </Card.Body>
                        
                        <Card.Footer className="bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    ID: {zone.id}
                                </small>
                                <Button 
                                    as={Link} 
                                    to="/zones" 
                                    variant="outline-secondary"
                                    size="sm"
                                >
                                    <FaArrowLeft className="me-1" /> Retour à la liste
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
                
                <Col md={4}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white">
                            <h4 className="mb-0 d-flex align-items-center">
                                <FaUsers className="text-primary me-2" />
                                Agents assignés
                            </h4>
                        </Card.Header>
                        
                        <Card.Body>
                            {agentLoading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" size="sm" />
                                    <p className="mt-2">Chargement des agents...</p>
                                </div>
                            ) : agents && agents.length > 0 ? (
                                <ListGroup variant="flush">
                                    {agents.map(agent => (
                                        <ListGroup.Item 
                                            key={agent.id} 
                                            className="d-flex align-items-center agent-item"
                                            as={Link} 
                                            to={`/agents/${agent.id}`}
                                        >
                                            <div className="agent-avatar me-3 d-flex align-items-center justify-content-center">
                                                <FaUserShield className="text-secondary" />
                                            </div>
                                            <div>
                                                <strong>{agent.nom} {agent.prenom}</strong>
                                                {agent.email && (
                                                    <div className="small text-muted">{agent.email}</div>
                                                )}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="mb-3">
                                        <FaUsers size={40} className="text-muted" />
                                    </div>
                                    <p>Aucun agent assigné à cette zone</p>
                                    <Button 
                                        as={Link}
                                        to={`/zones/edit/${id}`} 
                                        variant="outline-primary"
                                        size="sm"
                                    >
                                        <FaEdit className="me-1" /> 
                                        Assigner des agents
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                        
                        {agents && agents.length > 0 && (
                            <Card.Footer className="bg-white">
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        Total: {agents.length} {agents.length > 1 ? 'agents' : 'agent'}
                                    </small>
                                    <Button 
                                        as={Link}
                                        to={`/zones/edit/${id}`} 
                                        variant="outline-primary"
                                        size="sm"
                                    >
                                        Gérer les agents
                                    </Button>
                                </div>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Modal de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmation de suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Êtes-vous sûr de vouloir supprimer la zone <strong>{zone.nom}</strong> ?
                        <br />
                        <span className="text-danger">Cette action est irréversible.</span>
                    </p>
                    {agents && agents.length > 0 && (
                        <Alert variant="warning">
                            <Alert.Heading>Attention!</Alert.Heading>
                            <p>
                                Cette zone est actuellement assignée à {agents.length} {agents.length > 1 ? 'agents' : 'agent'}.
                                La suppression désassociera ces agents de la zone.
                            </p>
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDeleteZone}>
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ZoneDetail;