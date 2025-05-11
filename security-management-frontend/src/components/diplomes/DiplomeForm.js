import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    Container, Row, Col, Card, Form, Button, 
    InputGroup, Spinner, Alert
} from "react-bootstrap";
import {
    FaGraduationCap, FaUser, FaCalendarAlt, FaSave,
    FaArrowLeft, FaExclamationTriangle, FaInfo,
    FaShieldAlt
} from "react-icons/fa";
import Select from "react-select";

const DiplomeForm = ({ title, data, setData, onSubmit, error, agents = [], isSubmitting = false }) => {
    const [validation, setValidation] = useState({
        agentId: true,
        niveau: true,
        dateObtention: true,
        dateExpiration: true
    });

    // Options pour le niveau SSIAP
    const niveauOptions = [
        { value: "SSIAP_1", label: "SSIAP 1", description: "Agent de sécurité incendie" },
        { value: "SSIAP_2", label: "SSIAP 2", description: "Chef d'équipe de sécurité incendie" },
        { value: "SSIAP_3", label: "SSIAP 3", description: "Chef de service de sécurité incendie" }
    ];

    // Transformer la liste des agents en options pour le select
    const agentOptions = agents.map(agent => ({
        value: agent.id,
        label: `${agent.nom || ""} ${agent.prenom || ""}`,
        email: agent.email || "Sans email",
        telephone: agent.telephone
    }));

    // Trouver l'option sélectionnée pour l'agent
    const selectedAgent = agentOptions.find(option => option.value === parseInt(data.agentId));

    // Fonction pour valider le formulaire
    const validateForm = () => {
        const newValidation = {
            agentId: Boolean(data.agentId),
            niveau: Boolean(data.niveau),
            dateObtention: true, // Optionnel
            dateExpiration: !data.dateExpiration || !data.dateObtention || new Date(data.dateExpiration) >= new Date(data.dateObtention)
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

    // Format de la sélection personnalisé
    const formatOptionLabel = ({ label, email, telephone }) => (
        <div className="d-flex flex-column">
            <div className="fw-bold">{label}</div>
            <div className="small text-muted d-flex flex-wrap">
                <span>{email}</span>
                {telephone && <span className="ms-2">• Tél: {telephone}</span>}
            </div>
        </div>
    );

    return (
        <Container fluid className="py-4">
            <Card className="shadow border-0 rounded-lg overflow-hidden">
                <Card.Header className="bg-gradient bg-primary text-white py-3">
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="mb-0 fw-bold">
                                <FaGraduationCap className="me-2" /> {title} un diplôme SSIAP
                            </h4>
                            <p className="text-white-50 mb-0 mt-1 small">
                                {title === "Créer" ? 
                                    "Enregistrer un nouveau diplôme SSIAP pour un agent" : 
                                    "Modifier les informations du diplôme SSIAP"
                                }
                            </p>
                        </Col>
                        <Col xs="auto">
                            <Link 
                                to="/diplomes-ssiap" 
                                className="btn btn-light d-flex align-items-center fw-semibold shadow-sm"
                            >
                                <FaArrowLeft className="me-2" /> Retour à la liste
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body className="p-4">
                    {error && (
                        <Alert variant="danger" className="mb-4 d-flex align-items-center shadow-sm">
                            <FaExclamationTriangle size={18} className="me-2" />
                            {error}
                        </Alert>
                    )}
                    
                    <div className="mb-4 py-2 px-3 bg-light border-start border-primary border-4 rounded">
                        <p className="mb-0 text-secondary">
                            <FaInfo className="me-2 text-primary" /> 
                            Les diplômes SSIAP (Service de Sécurité Incendie et d'Assistance à Personnes) sont obligatoires pour exercer 
                            des missions de sécurité incendie. Assurez-vous de renseigner les dates d'obtention et d'expiration correctes.
                        </p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-4">
                            <Form.Group as={Col} md={6}>
                                <Form.Label className="fw-bold text-secondary mb-2">
                                    <FaUser className="me-2" />Agent concerné
                                </Form.Label>
                                <InputGroup hasValidation className="shadow-sm mb-2">
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <FaUser className="text-primary" />
                                    </InputGroup.Text>
                                    <div className="form-control p-0 border-start-0">
                                        <Select
                                            options={agentOptions}
                                            value={selectedAgent}
                                            onChange={(selected) => {
                                                setData({ ...data, agentId: selected ? selected.value : "" });
                                                setValidation({...validation, agentId: Boolean(selected)});
                                            }}
                                            placeholder="Sélectionner un agent"
                                            formatOptionLabel={formatOptionLabel}
                                            isSearchable
                                            noOptionsMessage={() => "Aucun agent disponible"}
                                            className="select-without-border"
                                            classNamePrefix="react-select"
                                            styles={{
                                                control: (baseStyles) => ({
                                                    ...baseStyles,
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                })
                                            }}
                                        />
                                    </div>
                                </InputGroup>
                                {!validation.agentId && (
                                    <Form.Text className="text-danger">
                                        Veuillez sélectionner un agent
                                    </Form.Text>
                                )}
                                <Form.Text className="text-muted">
                                    L'agent qui sera titulaire de ce diplôme SSIAP
                                </Form.Text>
                            </Form.Group>

                            <Form.Group as={Col} md={6}>
                                <Form.Label className="fw-bold text-secondary mb-2">
                                    <FaShieldAlt className="me-2" />Niveau SSIAP
                                </Form.Label>
                                <InputGroup className="shadow-sm mb-2">
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <FaShieldAlt className="text-primary" />
                                    </InputGroup.Text>
                                    <Form.Select
                                        name="niveau"
                                        value={data.niveau}
                                        onChange={e => setData({ ...data, niveau: e.target.value })}
                                        required
                                        className="border-start-0"
                                    >
                                        {niveauOptions.map(option => (
                                            <option key={option.value} value={option.value} title={option.description}>
                                                {option.label} - {option.description}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Le niveau de qualification SSIAP obtenu
                                </Form.Text>
                            </Form.Group>
                        </Row>

                        <Row className="mb-4">
                            <Form.Group as={Col} md={6}>
                                <Form.Label className="fw-bold text-secondary mb-2">
                                    <FaCalendarAlt className="me-2" />Date d'obtention
                                </Form.Label>
                                <InputGroup className="shadow-sm mb-2">
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <FaCalendarAlt className="text-success" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        name="dateObtention"
                                        value={data.dateObtention}
                                        onChange={e => setData({ ...data, dateObtention: e.target.value })}
                                        className="border-start-0"
                                    />
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Date à laquelle le diplôme a été obtenu
                                </Form.Text>
                            </Form.Group>

                            <Form.Group as={Col} md={6}>
                                <Form.Label className="fw-bold text-secondary mb-2">
                                    <FaCalendarAlt className="me-2" />Date d'expiration
                                </Form.Label>
                                <InputGroup hasValidation className="shadow-sm mb-2">
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <FaCalendarAlt className="text-danger" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        name="dateExpiration"
                                        value={data.dateExpiration}
                                        onChange={e => setData({ ...data, dateExpiration: e.target.value })}
                                        isInvalid={!validation.dateExpiration}
                                        className="border-start-0"
                                        min={data.dateObtention}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        La date d'expiration doit être ultérieure à la date d'obtention
                                    </Form.Control.Feedback>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Date à laquelle le diplôme expire (recyclage nécessaire)
                                </Form.Text>
                            </Form.Group>
                        </Row>

                        <hr className="my-4" />
                        
                        <div className="bg-light p-3 rounded-3 mb-4">
                            <p className="mb-0 text-secondary small">
                                <strong>Note:</strong> Les diplômes SSIAP doivent être recyclés tous les 3 ans. 
                                Assurez-vous que les dates saisies correspondent bien aux informations 
                                figurant sur l'attestation officielle.
                            </p>
                        </div>
                        
                        <div className="d-flex justify-content-between">
                            <Link 
                                to="/diplomes-ssiap" 
                                className="btn btn-outline-secondary d-flex align-items-center"
                            >
                                <FaArrowLeft className="me-2" /> Annuler
                            </Link>
                            
                            <Button 
                                type="submit" 
                                variant="primary" 
                                size="lg"
                                disabled={isSubmitting}
                                className="px-4 shadow d-flex align-items-center"
                                style={{
                                    transition: "all 0.3s ease",
                                    background: "linear-gradient(to right, #007bff, #0056b3)",
                                    border: "none"
                                }}
                            >
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
                                ) : (
                                    <>
                                        <FaSave className="me-2" /> {title} le diplôme
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <style>{`
                .select-without-border .react-select__control {
                    border: none !important;
                    box-shadow: none !important;
                }
            `}</style>
        </Container>
    );
};

export default DiplomeForm;
