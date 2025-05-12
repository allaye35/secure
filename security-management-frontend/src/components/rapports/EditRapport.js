// src/components/rapports/EditRapport.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import RapportService from "../../services/RapportService";
import MissionService from "../../services/MissionService";
import { 
    Container, Row, Col, Form, Button, Card, 
    Alert, Spinner, Badge
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, faArrowLeft, faCalendarAlt, faUser, 
    faFileAlt, faBuilding, faExclamationTriangle,
    faEdit, faEye
} from '@fortawesome/free-solid-svg-icons';

export default function EditRapport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rapport, setRapport] = useState(null);
    const [missions, setMissions] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 1) charger le rapport
    useEffect(() => {
        setLoading(true);
        RapportService.getRapportById(id)
            .then(res => {
                setRapport(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement rapport:", err);
                setError("Impossible de charger le rapport.");
                setLoading(false);
            });
    }, [id]);

    // 2) charger la liste des missions
    useEffect(() => {
        MissionService.getAllMissions()
            .then(res => setMissions(res.data))
            .catch(err => {
                console.error("Impossible de charger les missions:", err);
                setError(prev => prev || "Impossible de charger les missions.");
            });
    }, []);

    const onChange = e => {
        const { name, value, type } = e.target;
        setRapport(prev => ({
            ...prev,
            [name]: type === "number" ? parseInt(value, 10) : value
        }));
    };

    const onSubmit = e => {
        e.preventDefault();
        setSaving(true);
        
        RapportService.updateRapport(id, rapport)
            .then(() => {
                navigate("/rapports");
            })
            .catch(err => {
                console.error("Erreur mise à jour:", err);
                setError("Échec de la mise à jour du rapport.");
                setSaving(false);
            });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'TERMINE': return 'success';
            case 'EN_COURS': return 'warning';
            case 'ANNULE': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusDisplayName = (status) => {
        switch (status) {
            case 'TERMINE': return 'Terminé';
            case 'EN_COURS': return 'En cours';
            case 'ANNULE': return 'Annulé';
            default: return status;
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement du rapport...</p>
            </Container>
        );
    }

    if (error && !rapport) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    {error}
                    <div className="mt-3">
                        <Button as={Link} to="/rapports" variant="outline-primary">
                            <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> 
                            Retour à la liste des rapports
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    if (!rapport) return null;

    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0 fs-4">
                            <FontAwesomeIcon icon={faEdit} className="me-2 text-primary" />
                            Modifier Rapport #{id}
                        </h2>
                        <div>
                            <Button 
                                as={Link} 
                                to={`/rapports/${id}`} 
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                            >
                                <FontAwesomeIcon icon={faEye} className="me-1" /> Voir
                            </Button>
                            <Button 
                                as={Link} 
                                to="/rapports" 
                                variant="outline-secondary"
                                size="sm"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Retour
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    {error && (
                        <Alert variant="danger" className="d-flex align-items-center mb-4">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={onSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="missionId">
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faBuilding} className="me-1 text-primary" /> 
                                        Mission
                                    </Form.Label>
                                    <Form.Select
                                        name="missionId"
                                        value={rapport.missionId || ""}
                                        onChange={onChange}
                                        required
                                    >
                                        <option value="">— Sélectionner une mission —</option>
                                        {missions.map(m => (
                                            <option key={m.id} value={m.id}>
                                                #{m.id} – {m.titre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="dateIntervention">
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-primary" /> 
                                        Date & heure
                                    </Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="dateIntervention"
                                        value={rapport.dateIntervention?.substring(0,16) || ""}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Card className="mb-4 border-light">
                            <Card.Header className="bg-light">
                                <FontAwesomeIcon icon={faUser} className="me-2 text-primary" /> 
                                Informations sur l'agent
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group controlId="agentNom" className="mb-3">
                                            <Form.Label>Nom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="agentNom"
                                                value={rapport.agentNom || ""}
                                                onChange={onChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="agentEmail" className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="agentEmail"
                                                value={rapport.agentEmail || ""}
                                                onChange={onChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="agentTelephone">
                                            <Form.Label>Téléphone</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="agentTelephone"
                                                value={rapport.agentTelephone || ""}
                                                onChange={onChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group controlId="description">
                                    <Form.Label className="fw-bold">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={rapport.description || ""}
                                        onChange={onChange}
                                        placeholder="Description brève de l'intervention..."
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group controlId="contenu">
                                    <Form.Label className="fw-bold">Contenu détaillé</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="contenu"
                                        value={rapport.contenu || ""}
                                        onChange={onChange}
                                        placeholder="Détails complets de l'intervention..."
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group controlId="status">
                                    <Form.Label className="fw-bold">Statut</Form.Label>
                                    <div className="d-flex align-items-center">
                                        <Form.Select 
                                            name="status" 
                                            value={rapport.status || "EN_COURS"} 
                                            onChange={onChange}
                                            className={`border-${getStatusBadgeVariant(rapport.status)} me-2`}
                                        >
                                            <option value="EN_COURS">En cours</option>
                                            <option value="TERMINE">Terminé</option>
                                            <option value="ANNULE">Annulé</option>
                                        </Form.Select>
                                        <Badge bg={getStatusBadgeVariant(rapport.status)}>
                                            {getStatusDisplayName(rapport.status)}
                                        </Badge>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Informations d'audit</Form.Label>
                                    <div className="border rounded p-2 bg-light">
                                        <small className="d-block">
                                            <strong>Créé le:</strong> {rapport.dateCreation ? new Date(rapport.dateCreation).toLocaleString() : 'N/A'}
                                        </small>
                                        <small className="d-block">
                                            <strong>Dernière modification:</strong> {rapport.dateModification ? new Date(rapport.dateModification).toLocaleString() : 'N/A'}
                                        </small>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end">
                            <Button 
                                variant="secondary" 
                                as={Link} 
                                to="/rapports"
                                className="me-2"
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" className="me-1" /> 
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSave} className="me-1" /> 
                                        Sauvegarder
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}
