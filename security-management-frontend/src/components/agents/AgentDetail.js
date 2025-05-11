// src/components/agents/AgentDetail.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Badge, ListGroup, Button, Spinner, Nav } from "react-bootstrap";
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
    const [activeTab, setActiveTab] = useState("contrats"); // Valeur initiale basée sur la capture d'écran

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
        <Container fluid className="agent-detail py-4">
            <div className="profile-header mb-4">
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-primary text-white py-3">
                        <div className="d-flex align-items-center">
                            <BsPerson size={24} className="me-2" />
                            <h3 className="mb-0">Profil de {agent.prenom} {agent.nom}</h3>
                        </div>
                        <Badge 
                            bg="danger" 
                            className="ms-auto status-badge"
                        >
                            {agent.statut || "HORS_SERVICE"}
                        </Badge>
                    </Card.Header>
                </Card>
            </div>
            
            <Row className="profile-content">
                <Col lg={6} xl={5} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h4 className="section-title mb-4">
                                Informations Personnelles
                            </h4>
                            <div className="personal-info">
                                <div className="info-item">
                                    <div className="info-label">
                                        <BsEnvelope className="icon" />
                                        Email:
                                    </div>
                                    <div className="info-value">{agent.email || "N/A"}</div>
                                </div>
                                
                                <div className="info-item">
                                    <div className="info-label">
                                        <BsTelephone className="icon" />
                                        Téléphone:
                                    </div>
                                    <div className="info-value">{agent.telephone || "N/A"}</div>
                                </div>
                                
                                <div className="info-item">
                                    <div className="info-label">
                                        <BsHouseDoor className="icon" />
                                        Adresse:
                                    </div>
                                    <div className="info-value address-value">
                                        {agent.adresse ? (
                                            <>
                                                {agent.adresse}
                                                <br />
                                                {agent.codePostal} {agent.ville}
                                            </>
                                        ) : "N/A"}
                                    </div>
                                </div>
                                
                                <div className="info-item">
                                    <div className="info-label">
                                        <BsCalendarDate className="icon" />
                                        Date de naissance:
                                    </div>
                                    <div className="info-value">{agent.dateNaissance || "N/A"}</div>
                                </div>
                                
                                <div className="info-item">
                                    <div className="info-label">
                                        <BsShield className="icon" />
                                        Rôle:
                                    </div>
                                    <div className="info-value">{agent.role || "N/A"}</div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col lg={6} xl={7} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h4 className="section-title mb-3 d-flex align-items-center">
                                <BsGeoAlt className="me-2" />
                                Zones de travail
                            </h4>
                            {agent.zonesDeTravailIds?.length > 0 ? (
                                <div className="zones-list">
                                    {agent.zonesDeTravailIds.map(zId => (
                                        <div key={zId} className="zone-item">
                                            <div className="zone-name">Zone #{zId}</div>
                                            <Link to={`/zones/${zId}`}>
                                                <Button variant="outline-primary" size="sm" className="details-btn">Détails</Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="light" className="text-center">
                                    Aucune zone assignée
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <div className="tabs-section mb-4">
                <Nav variant="tabs" className="nav-pills-custom" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <Nav.Item>
                        <Nav.Link eventKey="missions" className="d-flex align-items-center">
                            <BsListTask className="me-2" />
                            <span>Missions</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="disponibilites" className="d-flex align-items-center">
                            <BsCalendar3 className="me-2" />
                            <span>Disponibilités</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="cartespro" className="d-flex align-items-center">
                            <BsCreditCard2Front className="me-2" />
                            <span>Cartes Pro</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="diplomes" className="d-flex align-items-center">
                            <BsAward className="me-2" />
                            <span>Diplômes</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="contrats" className="d-flex align-items-center">
                            <BsFileEarmarkText className="me-2" />
                            <span>Contrats</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="notifications" className="d-flex align-items-center">
                            <BsBell className="me-2" />
                            <span>Notifications</span>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                
                <Card className="border-0 shadow-sm tab-content-card">
                    <Card.Body>
                        {activeTab === "missions" && (
                            <div className="tab-pane">
                                {agent.missionsIds?.length > 0 ? (
                                    <div className="list-items">
                                        {agent.missionsIds.map(mId => (
                                            <div key={mId} className="list-item">
                                                <div className="item-name">Mission #{mId}</div>
                                                <Link to={`/missions/${mId}`}>
                                                    <Button variant="primary" size="sm">Détails</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert variant="light" className="text-center">
                                        Aucune mission assignée
                                    </Alert>
                                )}
                            </div>
                        )}
                        
                        {activeTab === "disponibilites" && (
                            <div className="tab-pane">
                                {agent.disponibilitesIds?.length > 0 ? (
                                    <div className="list-items">
                                        {agent.disponibilitesIds.map(dId => (
                                            <div key={dId} className="list-item">
                                                <div className="item-name">Disponibilité #{dId}</div>
                                                <Link to={`/disponibilites/${dId}`}>
                                                    <Button variant="outline-primary" size="sm">Détails</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert variant="light" className="text-center">
                                        Aucune disponibilité enregistrée
                                    </Alert>
                                )}
                            </div>
                        )}
                        
                        {activeTab === "cartespro" && (
                            <div className="tab-pane">
                                {agent.cartesProfessionnellesIds?.length > 0 ? (
                                    <div className="list-items">
                                        {agent.cartesProfessionnellesIds.map(cId => (
                                            <div key={cId} className="list-item">
                                                <div className="item-name">Carte #{cId}</div>
                                                <Link to={`/cartes-pro/${cId}`}>
                                                    <Button variant="outline-primary" size="sm">Détails</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert variant="light" className="text-center">
                                        Aucune carte professionnelle
                                    </Alert>
                                )}
                            </div>
                        )}
                        
                        {activeTab === "diplomes" && (
                            <div className="tab-pane">
                                {agent.diplomesSSIAPIds?.length > 0 ? (
                                    <div className="list-items">
                                        {agent.diplomesSSIAPIds.map(dId => (
                                            <div key={dId} className="list-item">
                                                <div className="item-name">Diplôme #{dId}</div>
                                                <Link to={`/diplomes/${dId}`}>
                                                    <Button variant="outline-primary" size="sm">Détails</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert variant="light" className="text-center">
                                        Aucun diplôme SSIAP
                                    </Alert>
                                )}
                            </div>
                        )}
                        
                        {activeTab === "contrats" && (
                            <div className="tab-pane">
                                {agent.contratsDeTravailIds?.length > 0 ? (
                                    <div className="list-items">
                                        {agent.contratsDeTravailIds.map(ctId => (
                                            <div key={ctId} className="list-item">
                                                <div className="item-name">Contrat #{ctId}</div>
                                                <Link to={`/contrats-de-travail/${ctId}`}>
                                                    <Button variant="outline-primary" size="sm">Détails</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert variant="light" className="text-center">
                                        Aucun contrat de travail
                                    </Alert>
                                )}
                            </div>
                        )}
                        
                        {activeTab === "notifications" && (
                            <div className="tab-pane">
                                {agent.notificationsIds?.length > 0 ? (
                                    <div className="list-items">
                                        {agent.notificationsIds.map(nId => (
                                            <div key={nId} className="list-item">
                                                <div className="item-name">Notification #{nId}</div>
                                                <Link to={`/notifications/${nId}`}>
                                                    <Button variant="outline-primary" size="sm">Voir</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert variant="light" className="text-center">
                                        Aucune notification
                                    </Alert>
                                )}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
            
            <div className="actions-section">
                <Link to="/agents">
                    <Button variant="secondary" className="me-2">
                        <BsArrowLeft className="me-2" />
                        Retour à la liste
                    </Button>
                </Link>
                <Link to={`/agents/edit/${id}`}>
                    <Button variant="primary">
                        Modifier
                    </Button>
                </Link>
            </div>
        </Container>
    );
};

export default AgentDetail;
