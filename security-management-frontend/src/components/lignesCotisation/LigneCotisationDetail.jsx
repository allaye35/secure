import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import LigneCotisationService from "../../services/LigneCotisationService";
import { Card, Button, Row, Col, Alert, Spinner, Badge, ListGroup } from 'react-bootstrap';
import { FaEdit, FaArrowLeft, FaFileInvoice, FaEuroSign, FaPercentage } from 'react-icons/fa';
import "../../styles/LigneCotisationForm.css";

export default function LigneCotisationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        LigneCotisationService.getById(id)
            .then(({ data }) => setItem(data))
            .catch(() => setError("Impossible de charger la ligne de cotisation"))
            .finally(() => setLoading(false));
    }, [id]);

    if (error) return <Alert variant="danger">{error}</Alert>;
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Chargement...</span>
            </Spinner>
        </div>
    );

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Détail ligne de cotisation #{item.id}</h3>
                <Badge bg="light" text="dark">ID: {item.id}</Badge>
            </Card.Header>
            
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <ListGroup variant="flush" className="mb-3">
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Libellé</span>
                                <span>{item.libelle}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Fiche de paie ID</span>
                                <Badge bg="info">
                                    <FaFileInvoice className="me-1" /> #{item.ficheDePaieId}
                                </Badge>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                </Row>
                
                <Row>
                    <Col md={6} className="mb-3">
                        <Card className="h-100">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Cotisation salarié</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Taux</span>
                                    <span className="fw-bold">
                                        <FaPercentage className="me-1" />
                                        {item.tauxSalarial}%
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Montant</span>
                                    <span className="fw-bold">
                                        <FaEuroSign className="me-1" />
                                        {item.montantSalarial.toFixed(2)}
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={6} className="mb-3">
                        <Card className="h-100">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Cotisation employeur</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Taux</span>
                                    <span className="fw-bold">
                                        <FaPercentage className="me-1" />
                                        {item.tauxEmployeur}%
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Montant</span>
                                    <span className="fw-bold">
                                        <FaEuroSign className="me-1" />
                                        {item.montantEmployeur.toFixed(2)}
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                
                <div className="d-flex mt-3 gap-2">
                    <Button 
                        variant="secondary" 
                        className="d-flex align-items-center" 
                        onClick={() => navigate("/lignes-cotisation")}
                    >
                        <FaArrowLeft className="me-2" /> Retour à la liste
                    </Button>
                    <Button 
                        variant="primary" 
                        className="d-flex align-items-center" 
                        as={Link} 
                        to={`/lignes-cotisation/edit/${id}`}
                    >
                        <FaEdit className="me-2" /> Modifier
                    </Button>
                </div>
            </Card.Body>
            
            <Card.Footer className="text-muted">
                Total cotisation: {(parseFloat(item.montantSalarial) + parseFloat(item.montantEmployeur)).toFixed(2)} €
            </Card.Footer>
        </Card>
    );
}
