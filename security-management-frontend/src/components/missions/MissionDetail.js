// src/components/missions/MissionDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MissionService from "../../services/MissionService";
import { Card, Container, Row, Col, Badge, ListGroup, Button, Table } from 'react-bootstrap';

export default function MissionDetail() {
    const { id } = useParams();
    const [mission, setMission] = useState(null);
    const [error, setError] = useState("");
    
    useEffect(() => {
        MissionService.getMissionById(id)
            .then((data) => {
                console.log("Mission récupérée:", data);
                setMission(data);
            })
            .catch((err) => {
                console.error("Erreur lors du chargement de la mission:", err);
                setError("Impossible de charger la mission: " + (err.message || "Erreur serveur"));
            });
    }, [id]);
    
    const formatDate = d => d ? new Date(d).toLocaleDateString() : "-";
    const formatTime = t => {
        if (!t) return "-";
        // Si le format est déjà HH:MM, on le retourne tel quel
        if (typeof t === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(t)) {
            return t.substring(0, 5);
        }
        // Sinon, on essaie de le formater
        try {
            if (typeof t === 'string' && t.includes('T')) {
                // Format ISO
                const date = new Date(t);
                return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            }
            return t;
        } catch (e) {
            console.error("Erreur de formatage de l'heure:", e);
            return t || "-";
        }
    };
    
    const getStatusBadge = (status) => {
        if (!status) return <Badge bg="secondary">Non défini</Badge>;
        
        const statusLower = typeof status === 'string' ? status.toLowerCase() : '';
        switch (statusLower) {
            case 'en cours':
            case 'en_cours':
                return <Badge bg="primary">En cours</Badge>;
            case 'terminé':
            case 'termine':
            case 'terminée':
            case 'terminee':
                return <Badge bg="success">Terminé</Badge>;
            case 'planifié':
            case 'planifie':
            case 'planifiée':
            case 'planifiee':
            case 'planifiee':
            case 'planifiee':
                return <Badge bg="info">Planifié</Badge>;
            case 'annulé':
            case 'annule':
            case 'annulée':
            case 'annulee':
                return <Badge bg="danger">Annulé</Badge>;
            default:
                return <Badge bg="secondary">{status || 'Non défini'}</Badge>;
        }
    };

    // Fonction pour obtenir un badge du type de mission
    const getTypeBadge = (type) => {
        if (!type) return <Badge bg="secondary">Non défini</Badge>;
        
        const typeLower = typeof type === 'string' ? type.toLowerCase() : '';
        switch (typeLower) {
            case 'gardiennage':
                return <Badge bg="primary">Gardiennage</Badge>;
            case 'surveillance':
                return <Badge bg="info">Surveillance</Badge>;
            case 'rondes':
            case 'ronde':
                return <Badge bg="success">Rondes</Badge>;
            case 'escorte':
                return <Badge bg="warning">Escorte</Badge>;
            case 'evenementiel':
                return <Badge bg="danger">Événementiel</Badge>;
            case 'securite':
            case 'sécurité':
                return <Badge bg="dark">Sécurité</Badge>;
            default:
                return <Badge bg="primary">{type}</Badge>;
        }
    };

    if (error) return (
        <Container className="mt-4">
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        </Container>
    );
    
    if (!mission) return (
        <Container className="mt-4">
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        </Container>
    );
    
    return (
        <Container className="mt-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">
                    <i className="bi bi-file-text"></i> Détails de la Mission #{mission.id}
                </h2>
                <Link to="/missions" className="btn btn-outline-primary">
                    <i className="bi bi-arrow-left"></i> Retour
                </Link>
            </div>
            
            <Row>
                <Col lg={6}>
                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0"><i className="bi bi-info-circle me-2"></i>Informations générales</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-2">
                                <strong><i className="bi bi-tag me-2"></i>Titre : </strong> 
                                {mission.titre || "-"}
                            </div>
                            <div className="mb-2">
                                <strong><i className="bi bi-card-text me-2"></i>Description : </strong> 
                                {mission.description || "-"}
                            </div>
                            <div className="mb-2">
                                <strong><i className="bi bi-calendar-range me-2"></i>Période : </strong>
                                <div>
                                    <i className="bi bi-calendar-date me-1"></i> Du {formatDate(mission.dateDebut)} à {formatTime(mission.heureDebut)}
                                </div>
                                <div>
                                    <i className="bi bi-calendar-date me-1"></i> Au {formatDate(mission.dateFin)} à {formatTime(mission.heureFin)}
                                </div>
                            </div>
                            <div className="mb-2">
                                <strong><i className="bi bi-check-circle me-2"></i>Statut : </strong>
                                {getStatusBadge(mission.statutMission)}
                            </div>
                            <div className="mb-2">
                                <strong><i className="bi bi-shield me-2"></i>Type : </strong>
                                {getTypeBadge(mission.typeMission)}
                            </div>
                            <div className="mb-2">
                                <strong><i className="bi bi-people me-2"></i>Nombre d'agents prévus : </strong> 
                                <Badge bg="secondary">{mission.nombreAgents || "1"}</Badge>
                            </div>
                            <div className="mb-2">
                                <strong><i className="bi bi-123 me-2"></i>Quantité : </strong> 
                                <Badge bg="secondary">{mission.quantite || "1"}</Badge>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col lg={6}>
                    <div className="card mb-4">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0"><i className="bi bi-diagram-3 me-2"></i>Relations</h5>
                        </div>
                        <div className="card-body">
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold"><i className="bi bi-calendar-week me-2"></i>Planning</div>
                                        {mission.planning ? (
                                            <Link to={`/plannings/${mission.planning.id}`} className="text-decoration-none">
                                                {mission.planning.titre || `Planning #${mission.planning.id}`}
                                            </Link>
                                        ) : <span className="text-muted">Non assigné</span>}
                                    </div>
                                </ListGroup.Item>
                                
                                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold"><i className="bi bi-building me-2"></i>Site</div>
                                        {mission.site ? (
                                            <Link to={`/sites/${mission.site.id}`} className="text-decoration-none">
                                                {mission.site.nom || `Site #${mission.site.id}`}
                                            </Link>
                                        ) : <span className="text-muted">Non assigné</span>}
                                    </div>
                                </ListGroup.Item>
                                
                                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold"><i className="bi bi-geo-alt me-2"></i>Géolocalisation</div>
                                        {mission.geolocalisationGPS ? (
                                            <Link to={`/geolocalisations/${mission.geolocalisationGPS.id}`} className="text-decoration-none">
                                                {mission.geolocalisationGPS.adresse || `Coordonnées ${mission.geolocalisationGPS.latitude}, ${mission.geolocalisationGPS.longitude}` || `Géolocalisation #${mission.geolocalisationGPS.id}`}
                                            </Link>
                                        ) : <span className="text-muted">Non assignée</span>}
                                    </div>
                                </ListGroup.Item>
                                
                                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold"><i className="bi bi-file-earmark-text me-2"></i>Contrat</div>
                                        {mission.contrat ? (
                                            <Link to={`/contrats/${mission.contrat.id}`} className="text-decoration-none">
                                                {mission.contrat.referenceContrat || `Contrat #${mission.contrat.id}`}
                                            </Link>
                                        ) : <span className="text-muted">Non assigné</span>}
                                    </div>
                                </ListGroup.Item>
                                
                                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold"><i className="bi bi-receipt me-2"></i>Factures associées</div>
                                        {mission.factures && mission.factures.length > 0 ? (
                                            <ul className="list-unstyled mb-0">
                                                {mission.factures.map(facture => (
                                                    <li key={facture.id} className="mb-1">
                                                        <i className="bi bi-file-text text-primary me-1"></i>
                                                        <Link to={`/factures/${facture.id}`} className="text-decoration-none">
                                                            {facture.reference || `Facture #${facture.id}`}
                                                            {facture.montantTotal && ` (${facture.montantTotal.toFixed(2)} €)`}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <span className="text-muted">Aucune facture associée</span>}
                                    </div>
                                </ListGroup.Item>
                                
                                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold"><i className="bi bi-person-vcard me-2"></i>Client</div>
                                        {mission.client || (mission.contrat && mission.contrat.client) ? (
                                            <Link to={`/clients/${(mission.client?.id || mission.contrat?.client?.id)}`} className="text-decoration-none">
                                                {mission.client?.nom || mission.contrat?.client?.nom || `Client #${mission.client?.id || mission.contrat?.client?.id}`}
                                            </Link>
                                        ) : <span className="text-muted">Non assigné</span>}
                                    </div>
                                </ListGroup.Item>
                            </ListGroup>
                        </div>
                    </div>
                </Col>
            </Row>
            
            {/* Section pour les agents assignés */}
            {mission.agents && mission.agents.length > 0 && (
                <Row className="mt-3">
                    <Col>
                        <Card>
                            <Card.Header className="bg-success text-white">
                                <h5 className="mb-0"><i className="bi bi-people-fill me-2"></i>Agents assignés</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="table-responsive">
                                    <Table hover bordered>
                                        <thead className="table-light">
                                            <tr>
                                                <th><i className="bi bi-hash me-1"></i>ID</th>
                                                <th><i className="bi bi-person me-1"></i>Nom</th>
                                                <th><i className="bi bi-person me-1"></i>Prénom</th>
                                                <th><i className="bi bi-credit-card me-1"></i>N° Carte Pro</th>
                                                <th><i className="bi bi-gear me-1"></i>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mission.agents.map(agent => (
                                                <tr key={agent.id}>
                                                    <td>{agent.id}</td>
                                                    <td>{agent.nom}</td>
                                                    <td>{agent.prenom}</td>
                                                    <td>{agent.numCarteProf || "-"}</td>
                                                    <td>
                                                        <Link to={`/agents/${agent.id}`} className="btn btn-sm btn-outline-primary me-1">
                                                            <i className="bi bi-eye"></i> Détails
                                                        </Link>
                                                        <Button variant="outline-danger" size="sm">
                                                            <i className="bi bi-trash"></i> Retirer
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Section boutons d'actions */}
            <Row className="mt-4">
                <Col className="d-flex gap-2 justify-content-end">
                    <Link to={`/missions/${mission.id}/edit`} className="btn btn-warning">
                        <i className="bi bi-pencil"></i> Modifier
                    </Link>
                    <Button variant="success">
                        <i className="bi bi-person-plus"></i> Ajouter un agent
                    </Button>
                    <Button variant="outline-danger">
                        <i className="bi bi-trash"></i> Supprimer
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}
