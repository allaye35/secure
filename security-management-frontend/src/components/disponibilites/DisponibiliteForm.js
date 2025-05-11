import React, { useState } from "react";
import Select from "react-select";
import { Card, Form, Button, Container, Row, Col, Alert, InputGroup, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { 
    FaCalendarAlt, FaCalendarCheck, FaCalendarTimes, FaUser, 
    FaClock, FaExclamationTriangle, FaInfoCircle, FaCheckCircle,
    FaArrowLeft, FaSave, FaRegCalendarAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import "../../styles/DisponibiliteForm.css";
import "../../styles/DisponibiliteFormModern.css";

const DisponibiliteForm = ({ title, data, setData, onSubmit, error, agents = [] }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formValidated, setFormValidated] = useState(false);
    const [localErrors, setLocalErrors] = useState({
        agent: false,
        dateDebut: false,
        dateFin: false,
        dateRange: false
    });
    const [showPreview, setShowPreview] = useState(false);

    // Transformer la liste des agents en options pour le select avec informations pertinentes
    const agentOptions = agents.map(agent => ({
        value: agent.id,
        label: `${agent.nom || ""} ${agent.prenom || ""} ${agent.email ? `- ${agent.email}` : ""}${agent.telephone ? ` - Tél: ${agent.telephone}` : ""}`,
        nom: agent.nom || "",
        prenom: agent.prenom || "",
        email: agent.email || "",
        telephone: agent.telephone || "",
        statut: agent.statut || "",
        role: agent.role || "",
        avatar: agent.photo // Si disponible
    }));

    // Trouver l'option sélectionnée pour l'agent
    const selectedAgent = agentOptions.find(option => option.value === parseInt(data.agentId));
    
    // Fonction de validation du formulaire
    const validateForm = () => {
        const errors = {
            agent: !data.agentId,
            dateDebut: !data.dateDebut,
            dateFin: !data.dateFin,
            dateRange: data.dateDebut && data.dateFin && new Date(data.dateDebut) >= new Date(data.dateFin)
        };
        setLocalErrors(errors);
        return !Object.values(errors).some(error => error);
    };

    // Gérer la soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormValidated(true);
        
        if (validateForm()) {
            setIsSubmitting(true);
            onSubmit(e).finally(() => setIsSubmitting(false));
        }
    };

    // Formatage personnalisé pour le select d'agent
    const formatOptionLabel = ({ label, nom, prenom, email, statut }) => (
        <div className="agent-option">
            <div className="agent-initials">
                {nom && prenom ? `${nom.charAt(0)}${prenom.charAt(0)}` : "?"}
            </div>
            <div className="d-flex flex-column">
                <span className="fw-bold">{nom} {prenom}</span>
                {email && <span className="text-muted small">{email}</span>}
                {statut && (
                    <Badge 
                        bg={statut === "EN_SERVICE" ? "success" : 
                           statut === "EN_CONGE" ? "info" : "warning"}
                        className="mt-1"
                        style={{ width: 'fit-content' }}
                    >
                        {statut.replace('_', ' ')}
                    </Badge>
                )}
            </div>
        </div>
    );

    // Conversion de l'intervalle de dates en texte lisible
    const getDateRangeText = () => {
        if (!data.dateDebut || !data.dateFin) return '';
        
        try {
            const debut = new Date(data.dateDebut);
            const fin = new Date(data.dateFin);
            
            // Calculer la durée
            const diffHours = differenceInHours(fin, debut);
            const diffMinutes = differenceInMinutes(fin, debut) % 60;
            const days = Math.floor(diffHours / 24);
            const hours = diffHours % 24;
            
            let durationText = '';
            if (days > 0) {
                durationText += `${days} jour${days > 1 ? 's' : ''} `;
            }
            if (hours > 0 || days === 0) {
                durationText += `${hours} heure${hours > 1 ? 's' : ''} `;
            }
            if (diffMinutes > 0) {
                durationText += `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
            }
            
            return durationText;
        } catch (error) {
            return '';
        }
    };

    // Vérifier si les dates sont valides et si le formulaire est prêt
    const isFormReady = data.agentId && data.dateDebut && data.dateFin && new Date(data.dateDebut) < new Date(data.dateFin);

    // Format de date pour l'affichage
    const formatDate = (dateStr) => {
        try {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return format(date, 'PPPP à HH:mm', { locale: fr });
        } catch {
            return dateStr;
        }
    };

    // Obtenir le statut de la disponibilité
    const getDisponibiliteStatus = () => {
        if (!data.dateDebut || !data.dateFin) return {};
        
        const now = new Date();
        const start = new Date(data.dateDebut);
        const end = new Date(data.dateFin);
        
        if (now < start) {
            return { 
                status: "future", 
                label: "À venir", 
                variant: "primary",
                icon: <FaCalendarAlt className="me-2" />
            };
        } else if (now > end) {
            return { 
                status: "past", 
                label: "Terminée", 
                variant: "secondary",
                icon: <FaCalendarTimes className="me-2" />
            };
        } else {
            return { 
                status: "current", 
                label: "En cours", 
                variant: "success",
                icon: <FaCheckCircle className="me-2" />
            };
        }
    };

    // Status actuel
    const status = getDisponibiliteStatus();

    return (
        <Container fluid className="py-4 px-md-4">
            <Row className="justify-content-center">
                <Col lg={10} xl={9}>
                    <Card className="disponibilite-form-card shadow border-0">
                        <Card.Header className="bg-primary text-white py-3">
                            <div className="d-flex align-items-center">
                                <FaRegCalendarAlt className="me-2 fs-4" />
                                <h4 className="mb-0">{title} une disponibilité</h4>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && (
                                <Alert variant="danger" className="d-flex align-items-center mb-4">
                                    <FaExclamationTriangle className="me-2 flex-shrink-0" />
                                    <div>{error}</div>
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="form-label-lg fw-bold d-flex align-items-center">
                                        <FaUser className="me-2 text-primary" /> Agent <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Select
                                        options={agentOptions}
                                        value={selectedAgent}
                                        onChange={selected => {
                                            setData({ ...data, agentId: selected ? selected.value : "" });
                                            setLocalErrors({...localErrors, agent: !selected});
                                        }}
                                        placeholder="Sélectionner un agent"
                                        formatOptionLabel={formatOptionLabel}
                                        isSearchable
                                        noOptionsMessage={() => "Aucun agent disponible"}
                                        className={`react-select-container large-select ${localErrors.agent && formValidated ? 'is-invalid' : ''}`}
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                minHeight: '50px',
                                                fontSize: '1.1rem'
                                            })
                                        }}
                                    />
                                    {localErrors.agent && formValidated && (
                                        <Form.Control.Feedback type="invalid" className="d-block">
                                            Veuillez sélectionner un agent
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>

                                <Row className="date-section mb-4">
                                    <Col lg={6} className="mb-3 mb-lg-0">
                                        <Card className="date-card h-100">
                                            <Card.Body className="p-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold fs-5 d-flex align-items-center mb-3">
                                                        <FaCalendarAlt className="me-2 text-primary" /> Date de début <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <InputGroup hasValidation size="lg">
                                                        <InputGroup.Text className="bg-light">
                                                            <FaCalendarAlt />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type="datetime-local"
                                                            name="dateDebut"
                                                            value={data.dateDebut}
                                                            onChange={e => {
                                                                setData({ ...data, dateDebut: e.target.value });
                                                                setLocalErrors({...localErrors, dateDebut: !e.target.value});
                                                            }}
                                                            isInvalid={localErrors.dateDebut && formValidated}
                                                            required
                                                            className="form-control-lg py-2"
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            La date de début est requise
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    <Col lg={6}>
                                        <Card className="date-card h-100">
                                            <Card.Body className="p-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold fs-5 d-flex align-items-center mb-3">
                                                        <FaCalendarCheck className="me-2 text-primary" /> Date de fin <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <InputGroup hasValidation size="lg">
                                                        <InputGroup.Text className="bg-light">
                                                            <FaCalendarCheck />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            type="datetime-local"
                                                            name="dateFin"
                                                            value={data.dateFin}
                                                            onChange={e => {
                                                                setData({ ...data, dateFin: e.target.value });
                                                                setLocalErrors({...localErrors, dateFin: !e.target.value});
                                                            }}
                                                            isInvalid={(localErrors.dateFin || localErrors.dateRange) && formValidated}
                                                            required
                                                            className="form-control-lg py-2"
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {localErrors.dateRange ? 'La date de fin doit être après la date de début' : 'La date de fin est requise'}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {isFormReady && (
                                    <div className="mt-3 mb-4">
                                        <Card className="border-primary border-start border-4">
                                            <Card.Body className="py-3 px-4">
                                                <h5 className="d-flex align-items-center mb-2">
                                                    <FaClock className="me-2 text-primary" /> Récapitulatif
                                                </h5>
                                                <div className="duration-badge-lg bg-light p-3 rounded">
                                                    <div className="row align-items-center">
                                                        <div className="col-md-4">
                                                            <div className="mb-2 mb-md-0">
                                                                <span className="text-muted">Durée totale:</span>
                                                                <h5 className="my-1">{getDateRangeText()}</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="mb-2 mb-md-0">
                                                                <span className="text-muted">Du:</span>
                                                                <h6 className="my-1">{formatDate(data.dateDebut).split(' à ')[0]}</h6>
                                                                <span className="badge bg-light text-dark">{formatDate(data.dateDebut).split(' à ')[1]}</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div>
                                                                <span className="text-muted">Au:</span>
                                                                <h6 className="my-1">{formatDate(data.dateFin).split(' à ')[0]}</h6>
                                                                <span className="badge bg-light text-dark">{formatDate(data.dateFin).split(' à ')[1]}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                )}

                                {isFormReady && showPreview && (
                                    <div className="preview-section my-4 fade-in">
                                        <Card className="preview-card border-0 shadow-sm">
                                            <Card.Header className="bg-light">
                                                <h5 className="mb-0 d-flex align-items-center">
                                                    <FaInfoCircle className="me-2 text-info" /> Aperçu de la disponibilité
                                                </h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row className="g-4">
                                                    <Col md={5}>
                                                        <Card className="h-100 agent-preview-card border-0 shadow-sm">
                                                            <Card.Body className="p-4">
                                                                <h6 className="card-subtitle mb-3 text-muted d-flex align-items-center">
                                                                    <FaUser className="me-2" /> Agent
                                                                </h6>
                                                                
                                                                <div className="agent-preview-content">
                                                                    <div className="agent-avatar mb-3">
                                                                        <div className="agent-initials-large">
                                                                            {selectedAgent?.nom && selectedAgent?.prenom ? 
                                                                                `${selectedAgent.nom.charAt(0)}${selectedAgent.prenom.charAt(0)}` : "??"}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <h5 className="mb-2 fw-bold">
                                                                        {selectedAgent?.nom} {selectedAgent?.prenom}
                                                                    </h5>
                                                                    
                                                                    {selectedAgent?.email && (
                                                                        <p className="mb-2 text-muted">
                                                                            {selectedAgent.email}
                                                                        </p>
                                                                    )}
                                                                    
                                                                    {selectedAgent?.telephone && (
                                                                        <p className="mb-3 text-muted">
                                                                            {selectedAgent.telephone}
                                                                        </p>
                                                                    )}
                                                                    
                                                                    {selectedAgent?.statut && (
                                                                        <Badge 
                                                                            bg={selectedAgent.statut === "EN_SERVICE" ? "success" : 
                                                                               selectedAgent.statut === "EN_CONGE" ? "info" : "warning"}
                                                                            className="fs-6 py-2 px-3"
                                                                        >
                                                                            {selectedAgent.statut.replace('_', ' ')}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col md={7}>
                                                        <Card className="h-100 period-preview-card border-0 shadow-sm">
                                                            <Card.Body className="p-4">
                                                                <h6 className="card-subtitle mb-3 text-muted d-flex align-items-center">
                                                                    <FaCalendarAlt className="me-2" /> Période
                                                                </h6>
                                                                
                                                                <div className="d-flex flex-column h-100">
                                                                    <div className="period-details">
                                                                        <div className="date-entry mb-3 d-flex">
                                                                            <div className="date-icon me-3">
                                                                                <span className="circle-icon start">
                                                                                    <FaCalendarAlt />
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="mb-1">Date de début</h6>
                                                                                <p className="mb-0 fs-5">{formatDate(data.dateDebut)}</p>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="date-connector"></div>
                                                                        
                                                                        <div className="date-entry mb-3 d-flex">
                                                                            <div className="date-icon me-3">
                                                                                <span className="circle-icon end">
                                                                                    <FaCalendarCheck />
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="mb-1">Date de fin</h6>
                                                                                <p className="mb-0 fs-5">{formatDate(data.dateFin)}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="mt-auto">
                                                                        <div className="d-flex align-items-center">
                                                                            <Badge bg={status.variant} className="status-badge d-flex align-items-center py-2 px-3 fs-6">
                                                                                {status.icon} {status.label}
                                                                            </Badge>
                                                                            <span className="ms-3 text-muted">
                                                                                Durée: <strong>{getDateRangeText()}</strong>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                )}

                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-5 gap-3">
                                    <div>
                                        {isFormReady && (
                                            <Button 
                                                variant={showPreview ? "outline-secondary" : "outline-info"} 
                                                type="button" 
                                                onClick={() => setShowPreview(!showPreview)}
                                                className="d-flex align-items-center btn-lg"
                                                size="lg"
                                            >
                                                {showPreview ? (
                                                    <>
                                                        <FaInfoCircle className="me-2" /> Masquer l'aperçu
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaInfoCircle className="me-2" /> Voir l'aperçu
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="d-flex gap-3">
                                        <Link 
                                            to="/disponibilites" 
                                            className="btn btn-outline-secondary d-flex align-items-center btn-lg"
                                            size="lg"
                                        >
                                            <FaArrowLeft className="me-2" /> Annuler
                                        </Link>
                                        <Button 
                                            variant="primary" 
                                            type="submit" 
                                            className="submit-btn d-flex align-items-center btn-lg"
                                            size="lg" 
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Spinner 
                                                        as="span" 
                                                        animation="border" 
                                                        size="sm" 
                                                        role="status" 
                                                        aria-hidden="true" 
                                                        className="me-2"
                                                    />
                                                    Traitement...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className="me-2" /> 
                                                    {title}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DisponibiliteForm;
