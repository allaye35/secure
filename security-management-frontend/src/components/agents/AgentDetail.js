// src/components/agents/AgentDetail.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Badge, ListGroup, Button, Spinner, Tabs, Tab } from "react-bootstrap";
import { 
    BsPersonVcard, BsGeoAlt, BsListTask, BsCalendar3, BsFileEarmarkText,
    BsCreditCard2Front, BsAward, BsBell, BsArrowLeft, BsPerson,
    BsEnvelope, BsTelephone, BsHouseDoor, BsCalendarDate, BsShield
} from "react-icons/bs";
import AgentService from "../../services/AgentService";
import "../../styles/AgentDetail.css";

const AgentDetail = () => {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAgent = useCallback(() => {
        setLoading(true);
        AgentService.getAgentById(id)
            .then(({ data }) => {
                setAgent(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Impossible de charger l'agent.");
                setLoading(false);
            });
    }, [id]);

    useEffect(() => { fetchAgent(); }, [fetchAgent]);

    // Fonction pour retourner la bonne couleur de badge selon le statut
    const getStatusBadgeVariant = (status) => {
        switch(status?.toUpperCase()) {
            case "ACTIF": return "success";
            case "HORS_SERVICE": return "danger";
            case "EN_CONGE": return "warning";
            case "EN_FORMATION": return "info";
            default: return "secondary";
        }
    };

    if (error) return (
        <Container className="mt-4">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );
    
    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Chargement...</span>
            </Spinner>
        </Container>
    );

    return (
        <Container className="agent-detail py-4">
            <Card className="shadow-sm mb-4 border-0">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <BsPerson size={24} className="me-2" />
                        <h3 className="mb-0">Profil de {agent.prenom} {agent.nom}</h3>
                    </div>
                    <Badge bg={getStatusBadgeVariant(agent.statut)} pill className="px-3 py-2">
                        {agent.statut}
                    </Badge>
                </Card.Header>
                
                <Card.Body>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="border-0 h-100 info-card">
                                <Card.Body>
                                    <h4 className="text-primary mb-3">Informations Personnelles</h4>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="d-flex">
                                            <BsEnvelope className="me-2 text-secondary" size={18} />
                                            <div>
                                                <strong>Email:</strong>
                                                <div>{agent.email || "N/A"}</div>
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex">
                                            <BsTelephone className="me-2 text-secondary" size={18} />
                                            <div>
                                                <strong>Téléphone:</strong>
                                                <div>{agent.telephone || "N/A"}</div>
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex">
                                            <BsHouseDoor className="me-2 text-secondary" size={18} />
                                            <div>
                                                <strong>Adresse:</strong>
                                                <div>{agent.adresse || "N/A"}</div>
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex">
                                            <BsCalendarDate className="me-2 text-secondary" size={18} />
                                            <div>
                                                <strong>Date de naissance:</strong>
                                                <div>{agent.dateNaissance || "N/A"}</div>
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex">
                                            <BsShield className="me-2 text-secondary" size={18} />
                                            <div>
                                                <strong>Rôle:</strong>
                                                <div>{agent.role || "N/A"}</div>
                                            </div>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        <Col md={6}>
                            <Card className="border-0 h-100 info-card">
                                <Card.Body>
                                    <h4 className="text-primary mb-3">
                                        <BsGeoAlt className="me-2" />
                                        Zones de travail
                                    </h4>
                                    {agent.zonesDeTravailIds?.length > 0 ? (
                                        <ListGroup variant="flush">
                                            {agent.zonesDeTravailIds.map(zId => (
                                                <ListGroup.Item key={zId} className="d-flex justify-content-between align-items-center">
                                                    <div>Zone #{zId}</div>
                                                    <Link to={`/zones/${zId}`}>
                                                        <Button variant="outline-primary" size="sm">Détails</Button>
                                                    </Link>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <Alert variant="light" className="text-center">
                                            Aucune zone assignée
                                        </Alert>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Tabs defaultActiveKey="missions" id="agent-details-tabs" className="mb-3">
                        <Tab eventKey="missions" title={<span><BsListTask className="me-2" />Missions</span>}>
                            {agent.missionsIds?.length > 0 ? (
                                <ListGroup>
                                    {agent.missionsIds.map(mId => (
                                        <ListGroup.Item key={mId} className="d-flex justify-content-between align-items-center">
                                            <div>Mission #{mId}</div>
                                            <Link to={`/missions/${mId}`}>
                                                <Button variant="primary" size="sm">Détails</Button>
                                            </Link>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="light" className="text-center">
                                    Aucune mission assignée
                                </Alert>
                            )}
                        </Tab>
                        
                        <Tab eventKey="disponibilites" title={<span><BsCalendar3 className="me-2" />Disponibilités</span>}>
                            {agent.disponibilitesIds?.length > 0 ? (
                                <ListGroup>
                                    {agent.disponibilitesIds.map(dId => (
                                        <ListGroup.Item key={dId} className="d-flex justify-content-between align-items-center">
                                            <div>Disponibilité #{dId}</div>
                                            <Link to={`/disponibilites/${dId}`}>
                                                <Button variant="outline-primary" size="sm">Détails</Button>
                                            </Link>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="light" className="text-center">
                                    Aucune disponibilité enregistrée
                                </Alert>
                            )}
                        </Tab>
                        
                        <Tab eventKey="cartespro" title={<span><BsCreditCard2Front className="me-2" />Cartes Pro</span>}>
                            {agent.cartesProfessionnellesIds?.length > 0 ? (
                                <ListGroup>
                                    {agent.cartesProfessionnellesIds.map(cId => (
                                        <ListGroup.Item key={cId} className="d-flex justify-content-between align-items-center">
                                            <div>Carte #{cId}</div>
                                            <Link to={`/cartes-pro/${cId}`}>
                                                <Button variant="outline-primary" size="sm">Détails</Button>
                                            </Link>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="light" className="text-center">
                                    Aucune carte professionnelle
                                </Alert>
                            )}
                        </Tab>
                        
                        <Tab eventKey="diplomes" title={<span><BsAward className="me-2" />Diplômes</span>}>
                            {agent.diplomesSSIAPIds?.length > 0 ? (
                                <ListGroup>
                                    {agent.diplomesSSIAPIds.map(dId => (
                                        <ListGroup.Item key={dId} className="d-flex justify-content-between align-items-center">
                                            <div>Diplôme #{dId}</div>
                                            <Link to={`/diplomes/${dId}`}>
                                                <Button variant="outline-primary" size="sm">Détails</Button>
                                            </Link>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="light" className="text-center">
                                    Aucun diplôme SSIAP
                                </Alert>
                            )}
                        </Tab>
                        
                        <Tab eventKey="contrats" title={<span><BsFileEarmarkText className="me-2" />Contrats</span>}>
                            {agent.contratsDeTravailIds?.length > 0 ? (
                                <ListGroup>
                                    {agent.contratsDeTravailIds.map(ctId => (
                                        <ListGroup.Item key={ctId} className="d-flex justify-content-between align-items-center">
                                            <div>Contrat #{ctId}</div>
                                            <Link to={`/contrats-de-travail/${ctId}`}>
                                                <Button variant="outline-primary" size="sm">Détails</Button>
                                            </Link>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="light" className="text-center">
                                    Aucun contrat de travail
                                </Alert>
                            )}
                        </Tab>
                        
                        <Tab eventKey="notifications" title={<span><BsBell className="me-2" />Notifications</span>}>
                            {agent.notificationsIds?.length > 0 ? (
                                <ListGroup>
                                    {agent.notificationsIds.map(nId => (
                                        <ListGroup.Item key={nId} className="d-flex justify-content-between align-items-center">
                                            <div>Notification #{nId}</div>
                                            <Link to={`/notifications/${nId}`}>
                                                <Button variant="outline-primary" size="sm">Voir</Button>
                                            </Link>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="light" className="text-center">
                                    Aucune notification
                                </Alert>
                            )}
                        </Tab>
                    </Tabs>
                </Card.Body>
                
                <Card.Footer className="bg-white border-0">
                    <Link to="/agents">
                        <Button variant="secondary">
                            <BsArrowLeft className="me-2" />
                            Retour à la liste
                        </Button>
                    </Link>
                    <Link to={`/agents/edit/${id}`} className="ms-2">
                        <Button variant="primary">
                            Modifier
                        </Button>
                    </Link>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default AgentDetail;
