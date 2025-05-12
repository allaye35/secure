import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEuroSign, faEdit, faArrowLeft, faMoon, faCalendarWeek, faCalendarDay, faCalendarCheck, faPercent, faInfoCircle, faTag } from "@fortawesome/free-solid-svg-icons";

export default function TarifMissionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tarif, setTarif] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);    useEffect(() => {
        setLoading(true);
        TarifMissionService.getById(id)
            .then(({ data }) => {
                setTarif(data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Impossible de charger les détails du tarif: " + (err.response?.data?.message || err.message));
                setLoading(false);
            });
    }, [id]);    // Formatage des valeurs
    const formatPrix = (prix) => {
        if (!prix && prix !== 0) return "-";
        return Number(prix).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    };
    
    const formatPourcentage = (pourcentage) => {
        if (!pourcentage && pourcentage !== 0) return "-";
        return `${pourcentage}%`;
    };
    
    // Calcul du prix TTC
    const calculerPrixTTC = (prixHT, tauxTVA) => {
        if (!prixHT || !tauxTVA) return "-";
        const prixTTC = prixHT * (1 + tauxTVA / 100);
        return formatPrix(prixTTC);
    };
      if (loading) {
        return (
            <Container fluid className="py-4">
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement des détails du tarif...</p>
                </div>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container fluid className="py-4">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    {error}
                </Alert>
                <div className="text-center mt-3">
                    <Button variant="primary" onClick={() => navigate("/tarifs")}>
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour à la liste des tarifs
                    </Button>
                </div>
            </Container>
        );
    }
    
    if (!tarif) return null; // Éviter les erreurs si tarif est null après chargement
    
    return (
        <Container fluid className="py-4">
            <Card className="shadow border-0">
                <Card.Header className="bg-primary bg-gradient text-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="m-0 fw-bold">
                            <FontAwesomeIcon icon={faTag} className="me-2" />
                            Détail du tarif mission
                        </h4>
                        <Badge bg="light" text="dark" pill className="px-3 py-2 fs-6">
                            ID: {tarif.id}
                        </Badge>
                    </div>
                </Card.Header>
                
                <Card.Body className="p-4">
                    <Row>
                        <Col lg={6} className="mb-4">
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Header className="bg-light border-bottom border-primary border-opacity-25">
                                    <h5 className="mb-0 text-primary">Informations générales</h5>
                                </Card.Header>
                                
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <FontAwesomeIcon icon={faTag} className="me-2 text-primary" />
                                                <span className="fw-bold">Type de mission</span>
                                            </div>
                                            <Badge 
                                                bg="light" 
                                                text="dark" 
                                                className="border border-1 px-3 py-2 fs-6"
                                            >
                                                {tarif.typeMission || "Non défini"}
                                            </Badge>
                                        </ListGroup.Item>
                                        
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <FontAwesomeIcon icon={faEuroSign} className="me-2 text-primary" />
                                                <span className="fw-bold">Prix unitaire HT</span>
                                            </div>
                                            <span className="fs-5 fw-bold">{formatPrix(tarif.prixUnitaireHT)}</span>
                                        </ListGroup.Item>
                                        
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <FontAwesomeIcon icon={faPercent} className="me-2 text-primary" />
                                                <span className="fw-bold">Taux de TVA</span>
                                            </div>
                                            <span>{formatPourcentage(tarif.tauxTVA)}</span>
                                        </ListGroup.Item>
                                        
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 bg-light">
                                            <div>
                                                <FontAwesomeIcon icon={faEuroSign} className="me-2 text-success" />
                                                <span className="fw-bold">Prix unitaire TTC</span>
                                            </div>
                                            <span className="fs-5 fw-bold text-success">
                                                {calculerPrixTTC(tarif.prixUnitaireHT, tarif.tauxTVA)}
                                            </span>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        <Col lg={6} className="mb-4">
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Header className="bg-light border-bottom border-primary border-opacity-25">
                                    <h5 className="mb-0 text-primary">Majorations applicables</h5>
                                </Card.Header>
                                
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <FontAwesomeIcon icon={faMoon} className="me-2 text-primary" />
                                                <span className="fw-bold">Majoration nuit</span>
                                            </div>
                                            <Badge bg="secondary" className="px-3 py-2">
                                                {formatPourcentage(tarif.majorationNuit)}
                                            </Badge>
                                        </ListGroup.Item>
                                        
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <FontAwesomeIcon icon={faCalendarWeek} className="me-2 text-primary" />
                                                <span className="fw-bold">Majoration weekend</span>
                                            </div>
                                            <Badge bg="secondary" className="px-3 py-2">
                                                {formatPourcentage(tarif.majorationWeekend)}
                                            </Badge>
                                        </ListGroup.Item>
                                        
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <FontAwesomeIcon icon={faCalendarDay} className="me-2 text-primary" />
                                                <span className="fw-bold">Majoration dimanche</span>
                                            </div>
                                            <Badge bg="secondary" className="px-3 py-2">
                                                {formatPourcentage(tarif.majorationDimanche)}
                                            </Badge>
                                        </ListGroup.Item>
                                        
                                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <FontAwesomeIcon icon={faCalendarCheck} className="me-2 text-primary" />
                                                <span className="fw-bold">Majoration jours fériés</span>
                                            </div>
                                            <Badge bg="secondary" className="px-3 py-2">
                                                {formatPourcentage(tarif.majorationFerie)}
                                            </Badge>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
                
                <Card.Footer className="bg-light py-3 d-flex justify-content-between">
                    <Button 
                        variant="outline-primary" 
                        className="d-flex align-items-center px-4 py-2 rounded-pill"
                        onClick={() => navigate("/tarifs")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour à la liste
                    </Button>
                    
                    <Link to={`/tarifs/edit/${id}`}>
                        <Button 
                            variant="primary" 
                            className="d-flex align-items-center px-4 py-2 rounded-pill"
                        >
                            <FontAwesomeIcon icon={faEdit} className="me-2" />
                            Modifier ce tarif
                        </Button>
                    </Link>
                </Card.Footer>
            </Card>
        </Container>
    );
}
