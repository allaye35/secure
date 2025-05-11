import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    Container, Row, Col, Card, Form, Button, 
    InputGroup, Spinner, Alert, OverlayTrigger, 
    Tooltip
} from "react-bootstrap";
import {
    FaIdCard, FaUser, FaCalendarAlt, FaSave,
    FaArrowLeft, FaExclamationTriangle, FaHashtag,
    FaShieldAlt
} from "react-icons/fa";
import AgentService from "../../services/AgentService";

const CarteProForm = ({ title, data, setData, onSubmit, error, isSubmitting }) => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [validation, setValidation] = useState({
        agentId: true,
        numeroCarte: true,
        dateDebut: true,
        dateFin: true
    });

    // Chargement de la liste des agents au montage du composant
    useEffect(() => {
        setLoading(true);
        AgentService.getAllAgents()
            .then(res => {
                setAgents(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents:", err);
                setLoading(false);
            });
    }, []);

    // Fonction pour valider le formulaire avant soumission
    const validateForm = () => {
        const newValidation = {
            agentId: Boolean(data.agentId),
            numeroCarte: Boolean(data.numeroCarte && data.numeroCarte.trim()),
            dateDebut: Boolean(data.dateDebut),
            dateFin: Boolean(data.dateFin && new Date(data.dateFin) >= new Date(data.dateDebut))
        };
        
        setValidation(newValidation);
        return Object.values(newValidation).every(v => v === true);
    };

    // Gestion de la soumission avec validation
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(e);
        }
    };

    // Création d'une option de tooltip
    const renderTooltip = (text) => (
        <Tooltip id="button-tooltip">
            {text}
        </Tooltip>
    );    // Les options pour le type de carte
    const typeCarteOptions = [
        { value: "CQP_APS", label: "CQP APS", description: "Agent de prévention et de sécurité" },
        { value: "GARDE_DU_CORPS", label: "Garde du corps", description: "Protection rapprochée de personnes" },
        { value: "SECURITE_EVENEMENTIELLE", label: "Sécurité événementielle", description: "Service d'ordre et sécurité lors d'événements" },
        { value: "SURVEILLANCE_TECHNIQUE", label: "Surveillance technique", description: "Surveillance par moyen technique" },
        { value: "RONDIER", label: "Rondier", description: "Agent effectuant des rondes de surveillance" },
        { value: "CONTROLEUR_ACCES", label: "Contrôleur d'accès", description: "Filtrage et contrôle d'entrée" },
        { value: "AGENT_SURVEILLANCE_VIDEO", label: "Agent surveillance vidéo", description: "Opérateur de vidéosurveillance" }
    ];

    return (
        <Container fluid className="py-4">            <Card className="shadow border-0 rounded-lg">
                <Card.Header className="bg-gradient bg-primary text-white py-3">
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="mb-0 fw-bold">
                                <FaIdCard className="me-2" /> {title} une carte professionnelle
                            </h4>
                            <p className="text-white-50 mb-0 mt-1 small">
                                Remplissez les informations ci-dessous pour {title.toLowerCase()} une nouvelle carte professionnelle
                            </p>
                        </Col>
                        <Col xs="auto">
                            <Link 
                                to="/cartes-professionnelles" 
                                className="btn btn-light fw-semibold shadow-sm"
                                style={{ transition: "all 0.3s ease" }}
                            >
                                <FaArrowLeft className="me-2" /> Retour à la liste
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>                <Card.Body className="p-4">
                    {error && (
                        <Alert variant="danger" className="mb-4 d-flex align-items-center shadow-sm">
                            <FaExclamationTriangle size={18} className="me-2" />
                            {error}
                        </Alert>
                    )}
                    
                    <div className="mb-4 py-2 px-3 bg-light border-start border-primary border-4 rounded">
                        <p className="mb-0 text-secondary">
                            <FaIdCard className="me-2 text-primary" /> 
                            Les cartes professionnelles sont obligatoires pour exercer des activités de sécurité privée.
                            Assurez-vous que les informations saisies sont correctes et correspondent aux documents officiels.
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{width: "3rem", height: "3rem"}} />
                            <p className="mt-3 text-muted">Chargement des données...</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-4">                                <Form.Group as={Col} md={6}>
                                    <Form.Label className="fw-bold text-secondary mb-2">
                                        <FaUser className="me-2" />Agent concerné
                                    </Form.Label>
                                    <InputGroup hasValidation className="shadow-sm">
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <FaUser className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Select
                                            name="agentId"
                                            value={data.agentId}
                                            onChange={e => setData({ ...data, agentId: e.target.value })}
                                            isInvalid={!validation.agentId}
                                            required
                                            className="border-start-0"
                                            style={{cursor: 'pointer'}}
                                        >
                                            <option value="">Sélectionnez un agent</option>
                                            {agents.length > 0 ? (
                                                agents
                                                    .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom))
                                                    .map(agent => (
                                                        <option key={agent.id} value={agent.id}>
                                                            {agent.nom.toUpperCase()} {agent.prenom} {agent.email ? `(${agent.email})` : ''}
                                                        </option>
                                                    ))
                                            ) : (
                                                <option disabled>Aucun agent disponible</option>
                                            )}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            Veuillez sélectionner un agent
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        L'agent qui sera titulaire de cette carte professionnelle
                                    </Form.Text>
                                </Form.Group>                                <Form.Group as={Col} md={6}>
                                    <Form.Label className="fw-bold text-secondary mb-2">
                                        <FaShieldAlt className="me-2" />Type de carte
                                    </Form.Label>
                                    <InputGroup className="shadow-sm">
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <FaShieldAlt className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Select
                                            name="typeCarte"
                                            value={data.typeCarte}
                                            onChange={e => setData({ ...data, typeCarte: e.target.value })}
                                            required
                                            className="border-start-0"
                                            style={{cursor: 'pointer'}}
                                        >                                            {typeCarteOptions.map(option => (
                                                <option key={option.value} value={option.value} title={option.description}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Activité de sécurité privée autorisée par cette carte
                                    </Form.Text>
                                </Form.Group>
                            </Row>

                            <Row className="mb-4">                                <Form.Group as={Col}>
                                    <Form.Label className="fw-bold text-secondary mb-2">
                                        <FaHashtag className="me-2" />Numéro de carte
                                    </Form.Label>
                                    <InputGroup hasValidation className="shadow-sm">
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <FaHashtag className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="numeroCarte"
                                            placeholder="Ex: APS-12345-XYZ"
                                            value={data.numeroCarte}
                                            onChange={e => setData({ ...data, numeroCarte: e.target.value.toUpperCase() })}
                                            isInvalid={!validation.numeroCarte}
                                            required
                                            className="border-start-0"
                                            autoComplete="off"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Le numéro de carte est requis
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Numéro unique figurant sur la carte professionnelle délivrée par le CNAPS
                                    </Form.Text>
                                </Form.Group>
                            </Row>                            <Row className="mb-4">
                                <Form.Group as={Col} md={6}>
                                    <Form.Label className="fw-bold text-secondary mb-2">
                                        <FaCalendarAlt className="me-2" />Date de début
                                    </Form.Label>
                                    <InputGroup hasValidation className="shadow-sm">
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <FaCalendarAlt className="text-success" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="dateDebut"
                                            value={data.dateDebut}
                                            onChange={e => {
                                                const newStartDate = e.target.value;
                                                setData({ ...data, dateDebut: newStartDate });
                                                
                                                // Si la date de fin existe et est avant la nouvelle date de début
                                                if (data.dateFin && new Date(data.dateFin) < new Date(newStartDate)) {
                                                    // Ajouter 5 ans à la date de début comme suggestion
                                                    const suggestedEndDate = new Date(newStartDate);
                                                    suggestedEndDate.setFullYear(suggestedEndDate.getFullYear() + 5);
                                                    const formattedEndDate = suggestedEndDate.toISOString().substring(0, 10);
                                                    setData(prevData => ({ ...prevData, dateFin: formattedEndDate }));
                                                }
                                            }}
                                            isInvalid={!validation.dateDebut}
                                            required
                                            className="border-start-0"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            La date de début est requise
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Date à partir de laquelle la carte est valide
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group as={Col} md={6}>
                                    <Form.Label className="fw-bold text-secondary mb-2">
                                        <FaCalendarAlt className="me-2" />Date de fin
                                    </Form.Label>
                                    <InputGroup hasValidation className="shadow-sm">
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <FaCalendarAlt className="text-danger" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="dateFin"
                                            min={data.dateDebut}
                                            value={data.dateFin}
                                            onChange={e => setData({ ...data, dateFin: e.target.value })}
                                            isInvalid={!validation.dateFin}
                                            required
                                            className="border-start-0"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            La date de fin est requise et doit être ultérieure à la date de début
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Date d'expiration de la carte professionnelle (généralement 5 ans après la date de début)
                                    </Form.Text>
                                </Form.Group>
                            </Row>                            <hr className="my-4" />
                            
                            <div className="bg-light p-3 rounded-3 mb-4">
                                <p className="mb-0 text-secondary small">
                                    <strong>Note:</strong> En sauvegardant cette carte professionnelle, vous garantissez que les informations 
                                    saisies sont conformes aux documents officiels délivrés par le CNAPS. 
                                    La responsabilité de l'entreprise peut être engagée en cas d'informations erronées.
                                </p>
                            </div>
                            
                            <div className="d-flex justify-content-between mt-4">
                                <Link 
                                    to="/cartes-professionnelles" 
                                    className="btn btn-outline-secondary d-flex align-items-center"
                                >
                                    <FaArrowLeft className="me-2" /> Annuler
                                </Link>
                                
                                <OverlayTrigger
                                    placement="top"
                                    overlay={renderTooltip(`${title} la carte professionnelle`)}
                                >
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        size="lg"
                                        disabled={loading || isSubmitting}
                                        className="px-4 shadow d-flex align-items-center"
                                        style={{
                                            transition: "all 0.3s ease",
                                            background: "linear-gradient(to right, #007bff, #0056b3)",
                                            border: "none"
                                        }}
                                    >
                                        <FaSave className="me-2" /> 
                                        {isSubmitting ? (
                                            <>
                                                <Spinner 
                                                    as="span" 
                                                    animation="border" 
                                                    size="sm" 
                                                    className="me-2"
                                                />
                                                Traitement en cours...
                                            </>
                                        ) : loading ? (
                                            <>
                                                <Spinner 
                                                    as="span" 
                                                    animation="border" 
                                                    size="sm" 
                                                    className="me-2"
                                                />
                                                Chargement...
                                            </>
                                        ) : (
                                            `${title} la carte`
                                        )}
                                    </Button>
                                </OverlayTrigger>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>            <style>{`
                .form-control:focus, .form-select:focus {
                    border-color: #80bdff;
                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                }
                
                .btn-primary {
                    background-color: #007bff;
                    border-color: #007bff;
                }
                
                .btn-primary:hover {
                    background-color: #0069d9;
                    border-color: #0062cc;
                }
                
                .card {
                    transition: all 0.3s ease;
                }
                
                .btn {
                    transition: all 0.3s;
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .btn:active {
                    transform: translateY(0);
                }
                
                .form-label {
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }
                
                .form-text {
                    font-size: 0.8rem;
                    margin-top: 0.25rem;
                }
                
                .form-control, .form-select {
                    padding: 0.6rem 0.75rem;
                }
                
                .form-control::placeholder {
                    font-style: italic;
                    color: #adb5bd;
                }
                
                .input-group-text {
                    padding: 0.6rem 0.75rem;
                }
                
                .card-header {
                    background-image: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .alert {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </Container>
    );
};

export default CarteProForm;
