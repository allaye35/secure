import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Container, Row, Col, Card, Form, Button, 
  InputGroup, Alert, ProgressBar, Spinner, Badge
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserTie, faBuilding, faUser, faEnvelope, faPhone, 
  faLocationDot, faSave, faTimes, faIdCard, faKey, faInfoCircle,
  faShieldAlt, faUserShield
} from "@fortawesome/free-solid-svg-icons";
import ClientService from "../../services/ClientService";

export default function CreateClient() {
    // États pour le formulaire
    const [client, setClient] = useState({
        username: "",
        password: "",
        confirmPassword: "", // Ajout de la confirmation de mot de passe
        typeClient: "PARTICULIER",
        nom: "",
        prenom: "",
        siege: "",
        representant: "",
        numeroSiret: "",
        email: "",
        telephone: "",
        adresse: "",
        codePostal: "",
        ville: "",
        pays: "France", // Valeur par défaut
        numeroRue: "",
        modeContactPrefere: "EMAIL",
        // role reste default CLIENT
    });

    // États pour la validation et le feedback
    const [validated, setValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [formCompletionPercent, setFormCompletionPercent] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    
    const navigate = useNavigate();

    // Mise à jour du pourcentage de complétion du formulaire
    useEffect(() => {
        const requiredFields = ['username', 'password', 'email'];
        const totalFields = Object.keys(client).length;
        const filledFields = Object.keys(client)
            .filter(key => client[key] !== "" && client[key] !== null)
            .length;
            
        const completionPercentage = Math.round((filledFields / totalFields) * 100);
        setFormCompletionPercent(completionPercentage);
    }, [client]);

    // Gestion des changements de champs
    const handleChange = e => {
        const { name, value } = e.target;
        setClient(prevClient => ({ ...prevClient, [name]: value }));
        
        // Validation en temps réel pour certains champs
        if (name === "password" || name === "confirmPassword") {
            validatePasswordMatch();
        }
        
        if (name === "email") {
            validateEmail(value);
        }

        if (name === "typeClient") {
            // Reset des champs spécifiques aux entreprises si on change pour un particulier
            if (value === "PARTICULIER") {
                setClient(prev => ({
                    ...prev,
                    [name]: value,
                    siege: "",
                    representant: "",
                    numeroSiret: ""
                }));
            } else {
                setClient(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        }
    };    // Validation du formulaire
    const validateForm = () => {
        const newErrors = {};
        
        // Validation du nom d'utilisateur
        if (!client.username || client.username.length < 3) {
            newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
        }
        
        // Validation du mot de passe
        if (!client.password || client.password.length < 6) {
            newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
        }
        
        // Validation du mot de passe fort
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (client.password && !strongPasswordRegex.test(client.password)) {
            newErrors.password = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre";
        }
        
        // Validation de la confirmation du mot de passe
        if (client.password !== client.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        }
        
        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!client.email || !emailRegex.test(client.email)) {
            newErrors.email = "Veuillez saisir une adresse email valide";
        }
        
        // Validations spécifiques aux entreprises
        if (client.typeClient === "ENTREPRISE") {
            if (!client.nom) {
                newErrors.nom = "Le nom de l'entreprise est requis";
            }
            
            if (!client.numeroSiret) {
                newErrors.numeroSiret = "Le numéro SIRET est requis pour une entreprise";
            } else if (!/^\d{14}$/.test(client.numeroSiret)) {
                newErrors.numeroSiret = "Le numéro SIRET doit contenir 14 chiffres";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validation du mot de passe en temps réel
    const validatePasswordMatch = () => {
        if (client.password && client.confirmPassword && client.password !== client.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: "Les mots de passe ne correspondent pas" }));
            return false;
        } else if (client.password && client.confirmPassword) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.confirmPassword;
                return newErrors;
            });
            return true;
        }
        return true;
    };

    // Validation de l'email en temps réel
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setErrors(prev => ({ ...prev, email: "Format d'email invalide" }));
            return false;
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.email;
                return newErrors;
            });
            return true;
        }
    };

    // Soumission du formulaire
    const handleSubmit = e => {
        e.preventDefault();
        setValidated(true);
        
        if (!validateForm()) {
            setFeedback({
                type: "danger",
                message: "Veuillez corriger les erreurs dans le formulaire."
            });
            return;
        }
        
        setIsSubmitting(true);
        setFeedback({ type: "", message: "" });
        
        // Suppression des champs inutiles avant l'envoi
        const { confirmPassword, ...clientToSubmit } = client;

        ClientService.create(clientToSubmit)
            .then(() => {
                setFeedback({
                    type: "success",
                    message: "Client créé avec succès! Redirection en cours..."
                });
                setTimeout(() => navigate("/clients"), 1500);
            })
            .catch(err => {
                console.error("Erreur lors de la création du client:", err);
                setFeedback({
                    type: "danger",
                    message: "Erreur lors de la création du client. Veuillez réessayer."
                });
                setIsSubmitting(false);
            });
    };    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-primary text-white py-3">
                            <div className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faUserTie} className="me-2 fa-lg" />
                                <h3 className="mb-0">Création d'un nouveau client</h3>
                            </div>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            {/* Feedback messages */}
                            {feedback.message && (
                                <Alert variant={feedback.type} dismissible onClose={() => setFeedback({ type: "", message: "" })}>
                                    {feedback.message}
                                </Alert>
                            )}
                            
                            {/* Progress bar */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span>Progression du formulaire</span>
                                    <span>{formCompletionPercent}%</span>
                                </div>
                                <ProgressBar 
                                    now={formCompletionPercent} 
                                    variant={formCompletionPercent < 50 ? "danger" : formCompletionPercent < 80 ? "warning" : "success"} 
                                />
                                {formCompletionPercent < 100 && (
                                    <small className="text-muted mt-1 d-block">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                        Remplissez tous les champs pour compléter le formulaire
                                    </small>
                                )}
                            </div>
                            
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                {/* Type de client */}
                                <Card className="mb-4 border-light shadow-sm">
                                    <Card.Header className="bg-light">
                                        <h5 className="mb-0">Type de client</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Type de client</Form.Label>
                                                    <div className="d-flex gap-4">
                                                        <Form.Check
                                                            type="radio"
                                                            id="particulier"
                                                            label={
                                                                <div className="d-flex align-items-center">
                                                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                                                    Particulier
                                                                </div>
                                                            }
                                                            name="typeClient"
                                                            value="PARTICULIER"
                                                            checked={client.typeClient === "PARTICULIER"}
                                                            onChange={handleChange}
                                                            className="fs-5"
                                                        />
                                                        <Form.Check
                                                            type="radio"
                                                            id="entreprise"
                                                            label={
                                                                <div className="d-flex align-items-center">
                                                                    <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                                                    Entreprise
                                                                </div>
                                                            }
                                                            name="typeClient"
                                                            value="ENTREPRISE"
                                                            checked={client.typeClient === "ENTREPRISE"}
                                                            onChange={handleChange}
                                                            className="fs-5"
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                
                                {/* Informations d'identification */}                                <Card className="mb-4 border-light shadow-sm">
                                    <Card.Header className="bg-light">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">Informations d'identification</h5>
                                            <Badge bg="info" className="px-3 py-2" title="Rôle attribué automatiquement">
                                                Rôle: CLIENT
                                            </Badge>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nom d'utilisateur</Form.Label>
                                                    <InputGroup hasValidation>
                                                        <InputGroup.Text>
                                                            <FontAwesomeIcon icon={faIdCard} />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            name="username"
                                                            value={client.username}
                                                            onChange={handleChange}
                                                            placeholder="Nom d'utilisateur"
                                                            isInvalid={!!errors.username}
                                                            required
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.username}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                    <Form.Text className="text-muted">
                                                        Le nom d'utilisateur doit contenir au moins 3 caractères.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email</Form.Label>
                                                    <InputGroup hasValidation>
                                                        <InputGroup.Text>
                                                            <FontAwesomeIcon icon={faEnvelope} />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            name="email"
                                                            type="email"
                                                            value={client.email}
                                                            onChange={handleChange}
                                                            placeholder="Email"
                                                            isInvalid={!!errors.email}
                                                            required
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.email}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Mot de passe</Form.Label>
                                                    <InputGroup hasValidation>
                                                        <InputGroup.Text>
                                                            <FontAwesomeIcon icon={faKey} />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            name="password"
                                                            type="password"
                                                            value={client.password}
                                                            onChange={handleChange}
                                                            placeholder="Mot de passe"
                                                            isInvalid={!!errors.password}
                                                            required
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.password}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                    <Form.Text className="text-muted">
                                                        Le mot de passe doit contenir au moins 6 caractères.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Confirmer le mot de passe</Form.Label>
                                                    <Form.Control
                                                        name="confirmPassword"
                                                        type="password"
                                                        value={client.confirmPassword}
                                                        onChange={handleChange}
                                                        placeholder="Confirmer le mot de passe"
                                                        isInvalid={!!errors.confirmPassword}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.confirmPassword}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                
                                {/* Informations personnelles */}
                                <Card className="mb-4 border-light shadow-sm">
                                    <Card.Header className="bg-light">
                                        <h5 className="mb-0">
                                            {client.typeClient === "PARTICULIER" ? "Informations personnelles" : "Informations de l'entreprise"}
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={client.typeClient === "PARTICULIER" ? 6 : 12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        {client.typeClient === "PARTICULIER" ? "Nom" : "Nom de l'entreprise"}
                                                    </Form.Label>
                                                    <Form.Control
                                                        name="nom"
                                                        value={client.nom}
                                                        onChange={handleChange}
                                                        placeholder={client.typeClient === "PARTICULIER" ? "Nom" : "Nom de l'entreprise"}
                                                        isInvalid={!!errors.nom}
                                                        required={client.typeClient === "ENTREPRISE"}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.nom}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            {client.typeClient === "PARTICULIER" && (
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Prénom</Form.Label>
                                                        <Form.Control
                                                            name="prenom"
                                                            value={client.prenom}
                                                            onChange={handleChange}
                                                            placeholder="Prénom"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            )}
                                        </Row>
                                        
                                        {client.typeClient === "ENTREPRISE" && (
                                            <>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Siège social</Form.Label>
                                                            <Form.Control
                                                                name="siege"
                                                                value={client.siege}
                                                                onChange={handleChange}
                                                                placeholder="Siège social"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Représentant légal</Form.Label>
                                                            <Form.Control
                                                                name="representant"
                                                                value={client.representant}
                                                                onChange={handleChange}
                                                                placeholder="Représentant légal"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Numéro SIRET</Form.Label>
                                                            <Form.Control
                                                                name="numeroSiret"
                                                                value={client.numeroSiret}
                                                                onChange={handleChange}
                                                                placeholder="14 chiffres"
                                                                isInvalid={!!errors.numeroSiret}
                                                                required
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors.numeroSiret}
                                                            </Form.Control.Feedback>
                                                            <Form.Text className="text-muted">
                                                                Le numéro SIRET doit contenir 14 chiffres.
                                                            </Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </>
                                        )}
                                        
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Téléphone</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>
                                                            <FontAwesomeIcon icon={faPhone} />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            name="telephone"
                                                            value={client.telephone}
                                                            onChange={handleChange}
                                                            placeholder="Téléphone"
                                                        />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Mode de contact préféré</Form.Label>
                                                    <Form.Select
                                                        name="modeContactPrefere"
                                                        value={client.modeContactPrefere}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="EMAIL">Email</option>
                                                        <option value="TELEPHONE">Téléphone</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                
                                {/* Adresse */}
                                <Card className="mb-4 border-light shadow-sm">
                                    <Card.Header className="bg-light">
                                        <h5 className="mb-0">
                                            <FontAwesomeIcon icon={faLocationDot} className="me-2" />
                                            Adresse
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={3}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>N° de rue</Form.Label>
                                                    <Form.Control
                                                        name="numeroRue"
                                                        value={client.numeroRue}
                                                        onChange={handleChange}
                                                        placeholder="N°"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={9}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Adresse</Form.Label>
                                                    <Form.Control
                                                        name="adresse"
                                                        value={client.adresse}
                                                        onChange={handleChange}
                                                        placeholder="Rue, Avenue, Boulevard, etc."
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Code Postal</Form.Label>
                                                    <Form.Control
                                                        name="codePostal"
                                                        value={client.codePostal}
                                                        onChange={handleChange}
                                                        placeholder="Code postal"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Ville</Form.Label>
                                                    <Form.Control
                                                        name="ville"
                                                        value={client.ville}
                                                        onChange={handleChange}
                                                        placeholder="Ville"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Pays</Form.Label>
                                                    <Form.Control
                                                        name="pays"
                                                        value={client.pays}
                                                        onChange={handleChange}
                                                        placeholder="Pays"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                
                                {/* Boutons d'action */}
                                <div className="d-flex justify-content-end gap-3 mt-4">
                                    <Button 
                                        as={Link}
                                        to="/clients"
                                        variant="outline-secondary"
                                        className="d-flex align-items-center"
                                        disabled={isSubmitting}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                                        Annuler
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        variant="primary"
                                        className="d-flex align-items-center"
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
                                                Création en cours...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                                Créer le client
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
