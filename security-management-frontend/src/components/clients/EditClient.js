// src/components/clients/EditClient.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

// on définit nos valeurs par défaut
const defaultClient = {
    username: "",
    password: "",
    role: "CLIENT",
    typeClient: "PARTICULIER",
    nom: "",
    prenom: "",
    siege: "",
    representant: "",
    numeroSiret: "",
    email: "",
    telephone: "",
    adresse: "",
    numeroRue: "",
    codePostal: "",
    ville: "",
    pays: "France",
    modeContactPrefere: "EMAIL",
    devisIds: [],
    notificationIds: []
};

export default function EditClient() {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [errors, setErrors] = useState({});
    const [validated, setValidated] = useState(false);
    const [formCompletionPercent, setFormCompletionPercent] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const navigate = useNavigate();

    // Chargement des données du client
    useEffect(() => {
        setIsSubmitting(true);
        ClientService.getById(id)
            .then(apiClient => {
                const clientData = {
                    ...defaultClient,
                    ...apiClient,
                    // forcer un tableau même si null
                    devisIds: apiClient.devisIds || [],
                    notificationIds: apiClient.notificationIds || [],
                    // Mettre le mot de passe à vide pour ne pas l'afficher dans le formulaire
                    password: ""
                };
                setClient(clientData);
                setIsSubmitting(false);
                
                // Calculer le pourcentage de complétion initial
                calculateFormCompletion(clientData);
            })
            .catch(err => {
                console.error("Erreur lors du chargement du client:", err);
                setFeedback({
                    type: "danger",
                    message: "Erreur lors du chargement du client. Veuillez réessayer."
                });
                setIsSubmitting(false);
            });
    }, [id]);

    // Mise à jour du pourcentage de complétion du formulaire
    const calculateFormCompletion = (clientData) => {
        if (!clientData) return;
        
        const requiredFields = ['username', 'email'];
        const totalFields = Object.keys(clientData).length - 2; // Exclure password et confirmPassword du calcul
        const filledFields = Object.keys(clientData)
            .filter(key => key !== 'password' && key !== 'confirmPassword')
            .filter(key => clientData[key] !== "" && clientData[key] !== null)
            .length;
            
        const completionPercentage = Math.round((filledFields / totalFields) * 100);
        setFormCompletionPercent(completionPercentage);
    };

    // Mise à jour du pourcentage à chaque changement
    useEffect(() => {
        if (client) {
            calculateFormCompletion(client);
        }
    }, [client]);

    if (!client) return (
        <Container className="my-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Chargement des données du client...</p>
        </Container>
    );

    // Gestion des changements de champs
    const handleChange = e => {
        const { name, value } = e.target;
        
        if (name === "password" && value !== "") {
            setPasswordChanged(true);
        } else if (name === "password" && value === "") {
            setPasswordChanged(false);
        }
        
        // Validation en temps réel pour certains champs
        if (name === "password" || name === "confirmPassword") {
            validatePasswordMatch(name === "password" ? value : client.password, 
                              name === "confirmPassword" ? value : confirmPassword);
        }
        
        if (name === "email") {
            validateEmail(value);
        }
        
        if (name === "confirmPassword") {
            setConfirmPassword(value);
            return;
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
        } else {
            setClient(prev => ({ ...prev, [name]: value }));
        }
    };

    // Validation du formulaire
    const validateForm = () => {
        const newErrors = {};
        
        // Validation du nom d'utilisateur
        if (!client.username || client.username.length < 3) {
            newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
        }
        
        // Validation du mot de passe si modifié
        if (passwordChanged) {
            if (!client.password || client.password.length < 6) {
                newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
            }
            
            // Validation du mot de passe fort
            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
            if (client.password && !strongPasswordRegex.test(client.password)) {
                newErrors.password = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre";
            }
            
            // Validation de la confirmation du mot de passe
            if (client.password !== confirmPassword) {
                newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
            }
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
            
            if (client.numeroSiret && !/^\d{14}$/.test(client.numeroSiret)) {
                newErrors.numeroSiret = "Le numéro SIRET doit contenir 14 chiffres";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validation du mot de passe en temps réel
    const validatePasswordMatch = (password, confirmPwd) => {
        if (password && confirmPwd && password !== confirmPwd) {
            setErrors(prev => ({ ...prev, confirmPassword: "Les mots de passe ne correspondent pas" }));
            return false;
        } else if (password && confirmPwd) {
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
        
        // Création d'une copie du client pour l'envoi
        const payload = { ...client };
        
        // Suppression du mot de passe s'il n'a pas été modifié
        if (payload.password === "") {
            delete payload.password;
        }
        
        ClientService.update(id, payload)
            .then(() => {
                setFeedback({
                    type: "success",
                    message: "Client modifié avec succès! Redirection en cours..."
                });
                setTimeout(() => navigate("/clients"), 1500);
            })
            .catch(err => {
                console.error("Erreur lors de la modification du client:", err);
                setFeedback({
                    type: "danger",
                    message: "Erreur lors de la modification du client. Veuillez réessayer."
                });
                setIsSubmitting(false);
            });
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-primary text-white py-3">
                            <div className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faUserTie} className="me-2 fa-lg" />
                                <h3 className="mb-0">Modification du client #{id}</h3>
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
                                        
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Rôle</Form.Label>
                                                    <Form.Select
                                                        name="role"
                                                        value={client.role}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="CLIENT">CLIENT</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                
                                {/* Informations d'identification */}
                                <Card className="mb-4 border-light shadow-sm">
                                    <Card.Header className="bg-light">
                                        <h5 className="mb-0">Informations d'identification</h5>
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
                                                    <Form.Label>Nouveau mot de passe (laisser vide pour ne pas modifier)</Form.Label>
                                                    <InputGroup hasValidation>
                                                        <InputGroup.Text>
                                                            <FontAwesomeIcon icon={faKey} />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            name="password"
                                                            type="password"
                                                            value={client.password}
                                                            onChange={handleChange}
                                                            placeholder="Laisser vide pour ne pas modifier"
                                                            isInvalid={!!errors.password}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.password}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                    {passwordChanged && (
                                                        <Form.Text className="text-muted">
                                                            Le mot de passe doit contenir au moins 8 caractères, une majuscule, 
                                                            une minuscule et un chiffre.
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            {passwordChanged && (
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Confirmer le mot de passe</Form.Label>
                                                        <Form.Control
                                                            name="confirmPassword"
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={handleChange}
                                                            placeholder="Confirmer le mot de passe"
                                                            isInvalid={!!errors.confirmPassword}
                                                            required={passwordChanged}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.confirmPassword}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                        </Row>
                                    </Card.Body>
                                </Card>
                                
                                {/* Informations personnelles/entreprise */}
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
                                                        value={client.pays || "France"}
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
                                                Mise à jour en cours...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                                Mettre à jour
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
