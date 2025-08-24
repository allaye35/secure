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
            .then(({ data }) => setMission(data))
            .catch(() => setError("Impossible de charger la mission."));
    }, [id]);

    const formatDate = d => d ? new Date(d).toLocaleDateString() : "-";
    const formatTime = t => t ? t.slice(0, 5) : "-";

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'en cours':
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
            <Card>
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">
                        <i className="bi bi-file-text"></i> Détails de la Mission #{mission.id}
                    </h2>
                    <Button variant="light" as={Link} to="/missions">
                        <i className="bi bi-arrow-left"></i> Retour
                    </Button>
                </Card.Header>
                
                <Card.Body>
                    <Row>
                        <Col lg={6}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Informations générales</h4>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>Titre :</strong> {mission.titre}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Description :</strong> {mission.description}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Période :</strong>
                                            <div>
                                                Du {formatDate(mission.dateDebut)} à {formatTime(mission.heureDebut)}
                                            </div>
                                            <div>
                                                Au {formatDate(mission.dateFin)} à {formatTime(mission.heureFin)}
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Statut :</strong> {getStatusBadge(mission.statutMission)}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Type :</strong> <Badge bg="info">{mission.typeMission}</Badge>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Nombre d'agents prévus :</strong> {mission.nombreAgents}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Quantité :</strong> {mission.quantite}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Tarification</h4>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>Tarif unitaire (HT) :</strong> {mission.tarif?.prixUnitaireHT ?? "-"} €
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Montant HT :</strong> {mission.montantHT ?? "-"} €
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Montant TVA :</strong> {mission.montantTVA ?? "-"} €
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Montant TTC :</strong> {mission.montantTTC ?? "-"} €
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Devis associé :</strong>{" "}
                                            {mission.devis ? 
                                                <Link to={`/devis/${mission.devis.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="bi bi-file-earmark-text"></i> Devis #{mission.devis.id}
                                                </Link> : "-"}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Relations</h4>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>Planning :</strong>{" "}
                                            {mission.planning ? 
                                                <Link to={`/plannings/${mission.planning.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="bi bi-calendar"></i> Planning #{mission.planning.id}
                                                </Link> : "-"}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Site :</strong>{" "}
                                            {mission.site ? 
                                                <Link to={`/sites/${mission.site.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="bi bi-geo"></i> #{mission.site.id} – {mission.site.nom}
                                                </Link> : "-"}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Géolocalisation :</strong>{" "}
                                            {mission.geolocalisationGPS ? 
                                                <span>
                                                    <i className="bi bi-geo-alt"></i> Lat {mission.geolocalisationGPS.position?.lat}, 
                                                    Lng {mission.geolocalisationGPS.position?.lng}
                                                </span> : "-"}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Contrat :</strong>{" "}
                                            {mission.contrat ? 
                                                <Link to={`/contrats/${mission.contrat.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="bi bi-file-earmark"></i> Contrat #{mission.contrat.id}
                                                </Link> : "-"}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Factures associées :</strong>{" "}
                                            {mission.factures?.length > 0 ? 
                                                mission.factures.map(f => 
                                                    <Link key={f.id} to={`/factures/${f.id}`} className="btn btn-sm btn-outline-primary me-2 mb-1">
                                                        <i className="bi bi-receipt"></i> #{f.id}
                                                    </Link>
                                                ) : "-"}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Agents assignés</h4>
                                </Card.Header>
                                <Card.Body>
                                    {mission.agents?.length > 0 ? (
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>Nom</th>
                                                    <th>Email</th>
                                                    <th>Téléphone</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mission.agents.map(a => (
                                                    <tr key={a.id}>
                                                        <td>{a.nom} {a.prenom}</td>
                                                        <td>{a.email}</td>
                                                        <td>{a.telephone}</td>
                                                        <td>
                                                            <Link to={`/agents/${a.id}`} className="btn btn-sm btn-outline-primary">
                                                                <i className="bi bi-eye"></i>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="bi bi-exclamation-triangle"></i> Aucun agent affecté
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Rapports d'intervention</h4>
                                </Card.Header>
                                <Card.Body>
                                    {mission.rapports?.length > 0 ? (
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mission.rapports.map(r => (
                                                    <tr key={r.id}>
                                                        <td>{r.id}</td>
                                                        <td>{formatDate(r.dateIntervention)}</td>
                                                        <td>
                                                            <Link to={`/rapports/${r.id}`} className="btn btn-sm btn-outline-primary">
                                                                <i className="bi bi-eye"></i>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="bi bi-exclamation-triangle"></i> Aucun rapport
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Pointages</h4>
                                </Card.Header>
                                <Card.Body>
                                    {mission.pointages?.length > 0 ? (
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Date</th>
                                                    <th>Horaire</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mission.pointages.map(p => (
                                                    <tr key={p.id}>
                                                        <td>{p.id}</td>
                                                        <td>{formatDate(p.date)}</td>
                                                        <td>{formatTime(p.heureDebut)} → {formatTime(p.heureFin)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="bi bi-exclamation-triangle"></i> Aucun pointage
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-3">
                        <Button variant="primary" as={Link} to={`/missions/edit/${mission.id}`}>
                            <i className="bi bi-pencil"></i> Modifier
                        </Button>
                        <Button variant="secondary" as={Link} to="/missions">
                            <i className="bi bi-arrow-left"></i> Retour à la liste
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
