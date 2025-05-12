// src/components/rapports/CreateRapport.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MissionService from "../../services/MissionService";
import AgentService from "../../services/AgentService";
import RapportService from "../../services/RapportService";
import { 
    Container, Row, Col, Form, Button, Card, 
    Alert, Spinner, InputGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, faArrowLeft, faCalendarAlt, faUser, 
    faFileAlt, faBuilding, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

export default function CreateRapport() {
    const navigate = useNavigate();
    const [missions, setMissions] = useState([]);
    const [availableAgents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [form, setForm] = useState({
        missionId: "",
        dateIntervention: "",
        description: "",
        contenu: "",
        agentId: "",
        agentNom: "",
        agentEmail: "",
        agentTelephone: "",
        status: "EN_COURS"
    });
    const [error, setError] = useState("");

    // 1) charger toutes les missions
    useEffect(() => {
        MissionService.getAllMissions()
            .then(res => {
                setMissions(res.data);
                setInitialLoading(false);
            })
            .catch(() => {
                setError("Impossible de charger les missions");
                setInitialLoading(false);
            });
    }, []);    // 2) dès qu'on choisit une mission, on va chercher ses agents
    useEffect(() => {
        const mid = form.missionId;
        if (!mid) {
            setAgents([]);
            return setForm(f => ({
                ...f,
                agentId: "",
                agentNom: "",
                agentEmail: "",
                agentTelephone: ""
            }));
        }

        setLoading(true);
        MissionService.getById(mid)
            .then(({ data: m }) => {
                const ids = Array.from(m.agentIds || []);
                return Promise.all(ids.map(id =>
                    AgentService.getAgentById(id).then(r => r.data)
                ));
            })
            .then(list => {
                setAgents(list);
                setLoading(false);
            })
            .catch(() => {
                console.error("Erreur chargement agents");
                setAgents([]);
                setLoading(false);
            });
    }, [form.missionId]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleAgentChange = e => {
        const id = parseInt(e.target.value, 10);
        const ag = availableAgents.find(a => a.id === id) || {};
        setForm(f => ({
            ...f,
            agentId: id,
            agentNom: ag.nom || "",
            agentEmail: ag.email || "",
            agentTelephone: ag.telephone || ""
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { data: created } = await RapportService.createRapport({
                dateIntervention: form.dateIntervention,
                description: form.description,
                contenu: form.contenu,
                agentNom: form.agentNom,
                agentEmail: form.agentEmail,
                agentTelephone: form.agentTelephone,
                status: form.status,
                missionId: parseInt(form.missionId, 10)
            });
            navigate(`/rapports/${created.id}`);
        } catch (err) {
            console.error("Erreur lors de la création:", err);
            setError("Erreur lors de la création du rapport");
            setLoading(false);
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'TERMINE': return 'success';
            case 'EN_COURS': return 'warning';
            case 'ANNULE': return 'danger';
            default: return 'secondary';
        }
    };

    if (initialLoading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des données...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0 fs-4">
                            <FontAwesomeIcon icon={faFileAlt} className="me-2 text-primary" />
                            Nouveau rapport d'intervention
                        </h2>
                        <Button 
                            as={Link} 
                            to="/rapports" 
                            variant="outline-secondary"
                            size="sm"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Retour
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {error && (
                        <Alert variant="danger" className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="missionId">
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faBuilding} className="me-1 text-primary" /> 
                                        Mission
                                    </Form.Label>
                                    <Form.Select
                                        name="missionId"
                                        value={form.missionId}
                                        onChange={handleChange}
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
                                        value={form.dateIntervention}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group controlId="agentId">
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faUser} className="me-1 text-primary" /> 
                                        Agent
                                    </Form.Label>
                                    {loading && form.missionId ? (
                                        <div className="d-flex align-items-center mb-2">
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            <span className="text-muted">Chargement des agents disponibles...</span>
                                        </div>
                                    ) : null}
                                    <Form.Select
                                        name="agentId"
                                        value={form.agentId}
                                        onChange={handleAgentChange}
                                        disabled={!availableAgents.length || loading}
                                        required
                                    >
                                        <option value="">— Sélectionner un agent —</option>
                                        {availableAgents.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.nom} ({a.email})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {form.agentId && (
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group controlId="agentNom">
                                        <Form.Label>Nom</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="agentNom"
                                            value={form.agentNom}
                                            onChange={handleChange}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="agentEmail">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="agentEmail"
                                            value={form.agentEmail}
                                            onChange={handleChange}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="agentTelephone">
                                        <Form.Label>Téléphone</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="agentTelephone"
                                            value={form.agentTelephone}
                                            onChange={handleChange}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group controlId="description">
                                    <Form.Label className="fw-bold">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Description brève de l'intervention..."
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
                                        value={form.contenu}
                                        onChange={handleChange}
                                        placeholder="Détails complets de l'intervention..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group controlId="status">
                                    <Form.Label className="fw-bold">Statut</Form.Label>
                                    <Form.Select 
                                        name="status" 
                                        value={form.status} 
                                        onChange={handleChange}
                                        className={`border-${getStatusBadgeVariant(form.status)}`}
                                    >
                                        <option value="EN_COURS">En cours</option>
                                        <option value="TERMINE">Terminé</option>
                                        <option value="ANNULE">Annulé</option>
                                    </Form.Select>
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
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" className="me-1" /> 
                                        Création en cours...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSave} className="me-1" /> 
                                        Créer le rapport
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
