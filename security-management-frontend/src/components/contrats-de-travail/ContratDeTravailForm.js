// src/components/contrats-de-travail/ContratDeTravailForm.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    Container, Row, Col, Card, Form, Button, Alert, 
    Spinner, Tab, Tabs, Badge, InputGroup, OverlayTrigger, Tooltip
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFileContract, faUserTie, faBuilding, faBriefcase, faSave, 
    faTimes, faCalendarAlt, faEuroSign, faClipboardList,
    faInfoCircle, faFileUpload, faQuestionCircle, faClock,
    faArrowRight, faArrowLeft, faCheck, faUsers, faClipboardCheck
} from "@fortawesome/free-solid-svg-icons";
import Select from 'react-select';
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import FicheDePaieService from "../../services/FicheDePaieService";
import "../../styles/ContratDeTravailForm.css";

export default function ContratDeTravailForm({
    title, data, setData, onSubmit, error, isLoading,
    missions, agents, entreprises, clauses
}) {
    const [dateError, setDateError] = useState("");
    const [articles, setArticles] = useState([]);
    const [fichesDePaie, setFichesDePaie] = useState([]);
    const [articlesLoading, setArticlesLoading] = useState(false);
    const [fichesLoading, setFichesLoading] = useState(false);
    const [activeStep, setActiveStep] = useState("informations");
    const [formValidated, setFormValidated] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    
    // Options pour les selects
    const [clausesOptions, setClausesOptions] = useState([]);
    const [articlesOptions, setArticlesOptions] = useState([]);
    const [fichesOptions, setFichesOptions] = useState([]);
    const [missionsOptions, setMissionsOptions] = useState([]);
    const [agentsOptions, setAgentsOptions] = useState([]);
    const [entreprisesOptions, setEntreprisesOptions] = useState([]);
    
    // Format date pour l'affichage
    const formatDate = (dateString) => {
        if (!dateString) return "";
        // Conversion explicite au format JJ/MM/AAAA
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    // Chargement des articles de contrat de travail
    useEffect(() => {
        setArticlesLoading(true);
        ArticleContratTravailService.getAll()
            .then(response => {
                setArticles(response.data);
                // Formatage pour React Select
                setArticlesOptions(response.data.map(article => ({
                    value: article.id,
                    label: article.libelle,
                    description: article.description
                })));
            })
            .catch(error => {
                console.error("Erreur lors du chargement des articles:", error);
            })
            .finally(() => {
                setArticlesLoading(false);
            });
    }, []);
    
    // Chargement des fiches de paie
    useEffect(() => {
        setFichesLoading(true);
        FicheDePaieService.getAll()
            .then(response => {
                setFichesDePaie(response.data);
                // Formatage pour React Select
                setFichesOptions(response.data.map(fiche => ({
                    value: fiche.id,
                    label: `${fiche.reference} (${formatDate(fiche.periodeDebut)} - ${formatDate(fiche.periodeFin)})`
                })));
            })
            .catch(error => {
                console.error("Erreur lors du chargement des fiches de paie:", error);
            })
            .finally(() => {
                setFichesLoading(false);
            });
    }, []);
    
    // Préparation des options pour les autres selects
    useEffect(() => {
        // Options pour les clauses
        if (clauses && clauses.length > 0) {
            setClausesOptions(clauses.map(clause => ({
                value: clause.id,
                label: clause.libelle,
                description: clause.contenu
            })));
        }
        
        // Options pour les missions
        if (missions && missions.length > 0) {
            setMissionsOptions(missions.map(mission => ({
                value: mission.id,
                label: `${mission.titreMission || "Sans titre"} (${formatDate(mission.dateDebutMission)} - ${formatDate(mission.dateFinMission)})`,
                dateDebut: mission.dateDebutMission,
                dateFin: mission.dateFinMission
            })));
        }
        
        // Options pour les agents
        if (agents && agents.length > 0) {
            setAgentsOptions(agents.map(agent => ({
                value: agent.id,
                label: `${agent.nom} ${agent.prenom}`,
                email: agent.email,
                telephone: agent.telephone
            })));
        }
        
        // Options pour les entreprises
        if (entreprises && entreprises.length > 0) {
            setEntreprisesOptions(entreprises.map(entreprise => ({
                value: entreprise.id,
                label: entreprise.nom,
                adresse: entreprise.adresse,
                telephone: entreprise.telephone
            })));
        }
    }, [clauses, missions, agents, entreprises]);
      // Dès que la mission change, on ajuste dates et horaires par défaut
    useEffect(() => {
        if (data.missionId && missions?.length) {
            const m = missions.find(x => x.id === Number(data.missionId));
            if (m) {
                console.log("Mission sélectionnée:", m);
                // Utiliser directement les dates de la mission pour le contrat
                setDateError("");
                setData(d => ({
                    ...d,
                    dateDebut: m.dateDebutMission,
                    dateFin: d.typeContrat === "CDI" ? null : m.dateFinMission,
                    heureDebut: m.heureDebutMission || "",
                    heureFin: m.heureFinMission || ""
                }));
            }
        }
    }, [data.missionId, missions, setData]);

    // Mise à jour de la date de fin lorsque le type de contrat change
    useEffect(() => {
        if (data.missionId && missions?.length && data.typeContrat) {
            const m = missions.find(x => x.id === Number(data.missionId));
            if (m) {
                setData(d => ({
                    ...d,
                    dateFin: d.typeContrat === "CDI" ? null : m.dateFinMission
                }));
            }
        }
    }, [data.typeContrat, data.missionId, missions, setData]);    // Gérer les changements dans les champs du formulaire
    const handleChange = e => {
        const { name, value, type, checked, files } = e.target;
        
        // Marquer le champ comme touché
        setTouchedFields({...touchedFields, [name]: true});
        
        if (type === "file") {
            setData(d => ({ ...d, documentPdf: files[0] }));
        } else if (type === "checkbox") {
            setData(d => ({ ...d, [name]: checked }));
        } else if (name === "missionId") {
            // Pour la mission, on met à jour directement et l'effect s'occupera des dates
            setData(d => ({ ...d, [name]: value }));
        } else if (name === "typeContrat") {
            // Pour le type de contrat, on met à jour et l'effect s'occupera de la date de fin
            setData(d => ({ ...d, [name]: value }));
        } else if (name === "referenceContrat") {
            // Pour la référence de contrat, on nettoie les espaces
            setData(d => ({ ...d, [name]: value.trim() }));
            // Réinitialiser l'erreur si elle concernait la référence du contrat
            if (dateError && dateError.includes("référence")) {
                setDateError("");
            }
        } else {
            setData(d => ({ ...d, [name]: value }));
        }
    };

    // Gérer les changements dans les sélecteurs React Select
    const handleSelectChange = (selectedOption, { name }) => {
        // Marquer le champ comme touché
        setTouchedFields({...touchedFields, [name]: true});
        
        // Pour les select simples
        if (!Array.isArray(selectedOption)) {
            setData(d => ({
                ...d,
                [name]: selectedOption ? selectedOption.value : ''
            }));
            return;
        }
        
        // Pour les select multiples
        const selectedValues = selectedOption.map(option => option.value);
        setData(d => ({
            ...d,
            [name]: selectedValues
        }));
    };

    // Styles pour les selects
    const customSelectStyles = {
        control: (styles) => ({
            ...styles,
            minHeight: '38px',
            borderRadius: '0.375rem',
            borderColor: '#ced4da',
            '&:hover': {
                borderColor: '#80bdff'
            }
        }),
        multiValue: (styles) => ({
            ...styles,
            backgroundColor: '#e9ecef'
        }),
        multiValueLabel: (styles) => ({
            ...styles,
            color: '#495057'
        }),
        multiValueRemove: (styles) => ({
            ...styles,
            color: '#495057',
            ':hover': {
                backgroundColor: '#dc3545',
                color: 'white',
            },
        }),
    };

    // Validation du formulaire avant soumission
    const validateForm = (e) => {
        const form = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();
        
        // Marquer tous les champs comme touchés
        const allFields = ["referenceContrat", "typeContrat", "dateDebut", "dateFin", "salaireDeBase", 
                          "periodiciteSalaire", "agentDeSecuriteId", "entrepriseId", "missionId"];
        const newTouchedFields = {};
        allFields.forEach(field => newTouchedFields[field] = true);
        setTouchedFields(newTouchedFields);
        
        if (form.checkValidity()) {
            onSubmit(e);
        }
        
        setFormValidated(true);
    };

    // Navigation entre les étapes
    const handleNext = () => {
        if (activeStep === "informations") setActiveStep("parties");
        else if (activeStep === "parties") setActiveStep("clauses");
        else if (activeStep === "clauses") setActiveStep("documents");
    };

    const handlePrevious = () => {
        if (activeStep === "documents") setActiveStep("clauses");
        else if (activeStep === "clauses") setActiveStep("parties");
        else if (activeStep === "parties") setActiveStep("informations");
    };    // Vérifie si les champs requis sont remplis pour l'étape actuelle
    const canProceed = () => {
        console.log("Vérification des champs requis:", {
            referenceContrat: data.referenceContrat,
            typeContrat: data.typeContrat,
            dateDebut: data.dateDebut,
            dateFin: data.dateFin,
            missionId: data.missionId,
            salaireDeBase: data.salaireDeBase
        });
        
        if (activeStep === "informations") {
            // Si une mission est sélectionnée, pas besoin de vérifier les dates
            if (data.missionId) {
                return !!data.referenceContrat && !!data.typeContrat && !!data.salaireDeBase;
            }
            
            // Sinon vérifier les dates manuellement saisies
            return !!data.referenceContrat && !!data.typeContrat && !!data.dateDebut && 
                  (data.typeContrat === "CDI" || !!data.dateFin) && !!data.salaireDeBase;
        }
        if (activeStep === "parties") {
            return !!data.agentDeSecuriteId && !!data.entrepriseId && !!data.missionId;
        }
        return true;
    };

    // Informations sur les entités liées
    const selectedAgent = agents?.find(a => a.id === Number(data.agentDeSecuriteId));
    const selectedEntreprise = entreprises?.find(e => e.id === Number(data.entrepriseId));
    const selectedMission = missions?.find(m => m.id === Number(data.missionId));
    
    return (
        <Container fluid className="contrat-form-container">
            <div className="form-header">
                <h3 className="form-title">
                    <FontAwesomeIcon icon={faFileContract} className="icon" />
                    {title} un contrat de travail
                </h3>
            </div>
            <Card className="form-body shadow-sm border-0">
                <Card.Body className="p-0">
                    {error && (
                        <Alert variant="danger" className="m-4">
                            <div className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faTimes} className="me-3 fa-lg text-danger" />
                                <div>
                                    <h5 className="mb-1">Une erreur est survenue</h5>
                                    <p className="mb-0">{error}</p>
                                </div>
                            </div>
                        </Alert>
                    )}
                    
                    {isLoading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" size="lg" />
                            <p className="mt-3 text-muted">Chargement des données en cours...</p>
                        </div>
                    )}
                    
                    {/* Étapes du formulaire */}
                    <Tabs
                        activeKey={activeStep}
                        onSelect={(k) => setActiveStep(k)}
                        id="contract-form-tabs"
                        className="mb-3 step-tabs"
                    >
                        <Tab eventKey="informations" title={
                            <span className="d-flex align-items-center">
                                <Badge bg={touchedFields.referenceContrat ? "primary" : "secondary"} className="step-badge">1</Badge>
                                <span>Informations générales</span>
                            </span>
                        }>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <Form noValidate validated={formValidated} onSubmit={validateForm}>
                                        <Row>
                                            <Col md={6}>                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                                        Référence du contrat*
                                                    </Form.Label>
                                                    <Form.Control
                                                        id="referenceContrat"
                                                        name="referenceContrat"
                                                        value={data.referenceContrat || ""}
                                                        onChange={handleChange}
                                                        required
                                                        isInvalid={touchedFields.referenceContrat && !data.referenceContrat}
                                                        placeholder="Ex: CONT-2025-001"
                                                        autoComplete="off"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        La référence du contrat est obligatoire
                                                    </Form.Control.Feedback>
                                                    <Form.Text className="text-muted">
                                                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                        La référence doit être unique. Exemple: CT-{new Date().getFullYear()}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                                                        Type de contrat*
                                                    </Form.Label>
                                                    <Form.Select
                                                        id="typeContrat"
                                                        name="typeContrat"
                                                        value={data.typeContrat || "CDD"}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="CDD">CDD - Contrat à Durée Déterminée</option>
                                                        <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
                                                        <option value="INTERIM">Intérim - Mission temporaire</option>
                                                        <option value="STAGE">Stage professionnel</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                                                Mission liée*
                                            </Form.Label>
                                            <Select
                                                id="missionId"
                                                name="missionId"
                                                options={missionsOptions}
                                                value={missionsOptions.find(option => option.value === Number(data.missionId))}
                                                onChange={(option) => handleSelectChange(option, { name: 'missionId' })}
                                                placeholder="Sélectionnez une mission..."
                                                noOptionsMessage={() => "Aucune mission disponible"}
                                                isLoading={!missions || missions.length === 0}
                                                styles={customSelectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                isClearable
                                                required
                                            />
                                            <Form.Text className="text-muted">
                                                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                Les dates du contrat seront automatiquement alignées avec la mission sélectionnée
                                            </Form.Text>
                                        </Form.Group>                                        <Row>
                                            <Col md={data.typeContrat === "CDI" ? 6 : 6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                                        Date de début*
                                                    </Form.Label>
                                                    <Form.Control
                                                        id="dateDebut"
                                                        name="dateDebut"
                                                        type="date"
                                                        value={data.dateDebut || ""}
                                                        onChange={handleChange}
                                                        readOnly={data.missionId ? true : false}
                                                        required={!data.missionId}
                                                        isInvalid={!data.missionId && touchedFields.dateDebut && !data.dateDebut}
                                                        disabled={data.missionId ? true : false}
                                                    />
                                                    {data.missionId && (
                                                        <Form.Text className="text-success">
                                                            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                            Automatiquement définie par la mission sélectionnée
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>
                                            </Col>

                                            {data.typeContrat !== "CDI" && (
                                                <Col md={6}>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label>
                                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                                            Date de fin*
                                                        </Form.Label>
                                                        <Form.Control
                                                            id="dateFin"
                                                            name="dateFin"
                                                            type="date"
                                                            value={data.dateFin || ""}
                                                            onChange={handleChange}
                                                            readOnly={data.missionId ? true : false}
                                                            required={data.typeContrat !== "CDI" && !data.missionId}
                                                            isInvalid={!data.missionId && data.typeContrat !== "CDI" && touchedFields.dateFin && !data.dateFin}
                                                            disabled={data.missionId ? true : false}
                                                        />
                                                        {data.missionId && (
                                                            <Form.Text className="text-success">
                                                                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                                Automatiquement définie par la mission sélectionnée
                                                            </Form.Text>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            )}
                                        </Row>

                                        {data.missionId && (
                                                <Row className="mt-3">
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>
                                                                <FontAwesomeIcon icon={faClock} className="me-2" />
                                                                Heure de début
                                                            </Form.Label>
                                                            <Form.Control
                                                                id="heureDebut"
                                                                name="heureDebut"
                                                                type="time"
                                                                value={data.heureDebut || ""}
                                                                onChange={handleChange}
                                                                readOnly={true}
                                                                disabled={true}
                                                            />
                                                            <Form.Text className="text-success">
                                                                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                                Automatiquement définie par la mission
                                                            </Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>
                                                                <FontAwesomeIcon icon={faClock} className="me-2" />
                                                                Heure de fin
                                                            </Form.Label>
                                                            <Form.Control
                                                                id="heureFin"
                                                                name="heureFin"
                                                                type="time"
                                                                value={data.heureFin || ""}
                                                                onChange={handleChange}
                                                                readOnly={true}
                                                                disabled={true}
                                                            />
                                                            <Form.Text className="text-success">
                                                                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                                Automatiquement définie par la mission
                                                            </Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}

                                        <Form.Group className="mb-4">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                id="description"
                                                name="description"
                                                rows="3"
                                                value={data.description || ""}
                                                onChange={handleChange}
                                                placeholder="Description des conditions particulières du contrat..."
                                            />
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        <FontAwesomeIcon icon={faEuroSign} className="me-2" />
                                                        Salaire de base*
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            id="salaireDeBase"
                                                            name="salaireDeBase"
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            value={data.salaireDeBase || ""}
                                                            onChange={handleChange}
                                                            required
                                                            isInvalid={touchedFields.salaireDeBase && !data.salaireDeBase}
                                                            placeholder="Montant"
                                                        />
                                                        <InputGroup.Text>€</InputGroup.Text>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>

                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>Périodicité*</Form.Label>
                                                    <Form.Select
                                                        id="periodiciteSalaire"
                                                        name="periodiciteSalaire"
                                                        value={data.periodiciteSalaire || "MENSUEL"}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="MENSUEL">Mensuelle</option>
                                                        <option value="HORAIRE">Horaire</option>
                                                        <option value="HEBDOMADAIRE">Hebdomadaire</option>
                                                        <option value="ANNUEL">Annuelle</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-end mt-3">
                                            <Button 
                                                variant="primary" 
                                                onClick={handleNext}
                                                disabled={!canProceed()}
                                                className="px-4 py-2"
                                            >
                                                Étape suivante: Parties signataires
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>
                        
                        <Tab eventKey="parties" title={
                            <span>
                                <Badge bg={touchedFields.agentDeSecuriteId ? "primary" : "secondary"} className="me-2">2</Badge>
                                Parties signataires
                            </span>
                        }>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <Form noValidate validated={formValidated}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        <FontAwesomeIcon icon={faUserTie} className="me-2" />
                                                        Agent de sécurité*
                                                    </Form.Label>
                                                    <Select
                                                        id="agentDeSecuriteId"
                                                        name="agentDeSecuriteId"
                                                        options={agentsOptions}
                                                        value={agentsOptions.find(option => option.value === Number(data.agentDeSecuriteId))}
                                                        onChange={(option) => handleSelectChange(option, { name: 'agentDeSecuriteId' })}
                                                        placeholder="Sélectionnez un agent..."
                                                        noOptionsMessage={() => "Aucun agent disponible"}
                                                        isLoading={!agents || agents.length === 0}
                                                        styles={customSelectStyles}
                                                        className="react-select-container"
                                                        classNamePrefix="react-select"
                                                        isClearable
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Veuillez sélectionner un agent
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                
                                                {selectedAgent && (
                                                    <Card className="bg-light border-0 mb-4">
                                                        <Card.Body>
                                                            <h6 className="mb-3">Informations de l'agent</h6>
                                                            <p className="mb-1">
                                                                <strong>Nom :</strong> {selectedAgent.nom} {selectedAgent.prenom}
                                                            </p>
                                                            {selectedAgent.email && (
                                                                <p className="mb-1">
                                                                    <strong>Email :</strong> {selectedAgent.email}
                                                                </p>
                                                            )}
                                                            {selectedAgent.telephone && (
                                                                <p className="mb-1">
                                                                    <strong>Téléphone :</strong> {selectedAgent.telephone}
                                                                </p>
                                                            )}
                                                            {selectedAgent.adresse && (
                                                                <p className="mb-0">
                                                                    <strong>Adresse :</strong> {selectedAgent.adresse}
                                                                </p>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                )}
                                            </Col>

                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                                        Entreprise*
                                                    </Form.Label>
                                                    <Select
                                                        id="entrepriseId"
                                                        name="entrepriseId"
                                                        options={entreprisesOptions}
                                                        value={entreprisesOptions.find(option => option.value === Number(data.entrepriseId))}
                                                        onChange={(option) => handleSelectChange(option, { name: 'entrepriseId' })}
                                                        placeholder="Sélectionnez une entreprise..."
                                                        noOptionsMessage={() => "Aucune entreprise disponible"}
                                                        isLoading={!entreprises || entreprises.length === 0}
                                                        styles={customSelectStyles}
                                                        className="react-select-container"
                                                        classNamePrefix="react-select"
                                                        isClearable
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Veuillez sélectionner une entreprise
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                
                                                {selectedEntreprise && (
                                                    <Card className="bg-light border-0 mb-4">
                                                        <Card.Body>
                                                            <h6 className="mb-3">Informations de l'entreprise</h6>
                                                            <p className="mb-1">
                                                                <strong>Nom :</strong> {selectedEntreprise.nom}
                                                            </p>
                                                            {selectedEntreprise.siren && (
                                                                <p className="mb-1">
                                                                    <strong>SIREN :</strong> {selectedEntreprise.siren}
                                                                </p>
                                                            )}
                                                            {selectedEntreprise.telephone && (
                                                                <p className="mb-1">
                                                                    <strong>Téléphone :</strong> {selectedEntreprise.telephone}
                                                                </p>
                                                            )}
                                                            {selectedEntreprise.adresse && (
                                                                <p className="mb-0">
                                                                    <strong>Adresse :</strong> {selectedEntreprise.adresse}
                                                                </p>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                )}
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-between mt-3">
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={handlePrevious}
                                                className="px-4 py-2"
                                            >
                                                Retour
                                            </Button>
                                            <Button 
                                                variant="primary" 
                                                onClick={handleNext}
                                                disabled={!canProceed()}
                                                className="px-4 py-2"
                                            >
                                                Étape suivante: Clauses et Articles
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>
                        
                        <Tab eventKey="clauses" title={
                            <span>
                                <Badge bg="primary" className="me-2">3</Badge>
                                Clauses et Articles
                            </span>
                        }>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <Form noValidate validated={formValidated}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                                                Clauses juridiques
                                            </Form.Label>
                                            <Select
                                                id="clauseIds"
                                                name="clauseIds"
                                                options={clausesOptions}
                                                value={clausesOptions.filter(option => 
                                                    data.clauseIds && data.clauseIds.includes(option.value)
                                                )}
                                                onChange={(options) => handleSelectChange(options, { name: 'clauseIds' })}
                                                placeholder="Sélectionnez des clauses..."
                                                noOptionsMessage={() => "Aucune clause disponible"}
                                                isMulti
                                                styles={customSelectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />
                                            <Form.Text className="text-muted">
                                                Sélectionnez les clauses juridiques à inclure dans le contrat
                                            </Form.Text>
                                        </Form.Group>
                                        
                                        {data.clauseIds && data.clauseIds.length > 0 && (
                                            <div className="mb-4">
                                                <h6 className="mb-3">Clauses sélectionnées:</h6>
                                                <div className="clauses-preview">
                                                    {data.clauseIds.map((clauseId) => {
                                                        const clause = clauses.find(c => c.id === clauseId);
                                                        if (!clause) return null;
                                                        
                                                        return (
                                                            <Card key={clauseId} className="mb-3 bg-light">
                                                                <Card.Header className="py-2 bg-secondary text-white">
                                                                    {clause.libelle}
                                                                </Card.Header>
                                                                <Card.Body className="py-2">
                                                                    <p className="mb-0 small">
                                                                        {clause.contenu || "Aucun contenu disponible"}
                                                                    </p>
                                                                </Card.Body>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                                                Articles de contrat de travail
                                            </Form.Label>
                                            <Select
                                                id="articleIds"
                                                name="articleIds"
                                                options={articlesOptions}
                                                value={articlesOptions.filter(option => 
                                                    data.articleIds && data.articleIds.includes(option.value)
                                                )}
                                                onChange={(options) => handleSelectChange(options, { name: 'articleIds' })}
                                                placeholder="Sélectionnez des articles..."
                                                noOptionsMessage={() => "Aucun article disponible"}
                                                isMulti
                                                isLoading={articlesLoading}
                                                styles={customSelectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />
                                            <Form.Text className="text-muted">
                                                Sélectionnez les articles spécifiques à inclure dans le contrat
                                            </Form.Text>
                                        </Form.Group>

                                        <div className="d-flex justify-content-between mt-3">
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={handlePrevious}
                                                className="px-4 py-2"
                                            >
                                                Retour
                                            </Button>
                                            <Button 
                                                variant="primary" 
                                                onClick={handleNext}
                                                className="px-4 py-2"
                                            >
                                                Étape suivante: Documents
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>
                        
                        <Tab eventKey="documents" title={
                            <span>
                                <Badge bg="primary" className="me-2">4</Badge>
                                Documents
                            </span>
                        }>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <Form noValidate validated={formValidated} onSubmit={validateForm}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                <FontAwesomeIcon icon={faFileUpload} className="me-2" />
                                                Fichier PDF du contrat signé (optionnel)
                                            </Form.Label>
                                            <Form.Control
                                                id="documentPdf"
                                                name="documentPdf"
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handleChange}
                                            />
                                            <Form.Text className="text-muted">
                                                Format accepté: PDF uniquement
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                                                Fiches de paie associées
                                            </Form.Label>
                                            <Select
                                                id="ficheDePaieIds"
                                                name="ficheDePaieIds"
                                                options={fichesOptions}
                                                value={fichesOptions.filter(option => 
                                                    data.ficheDePaieIds && data.ficheDePaieIds.includes(option.value)
                                                )}
                                                onChange={(options) => handleSelectChange(options, { name: 'ficheDePaieIds' })}
                                                placeholder="Sélectionnez des fiches de paie..."
                                                noOptionsMessage={() => "Aucune fiche de paie disponible"}
                                                isMulti
                                                isLoading={fichesLoading}
                                                styles={customSelectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />
                                        </Form.Group>

                                        <div className="mt-4 p-4 bg-light rounded border">
                                            <h5 className="mb-3">Résumé du contrat</h5>
                                            <Row>
                                                <Col md={6}>
                                                    <p><strong>Référence:</strong> {data.referenceContrat || "Non défini"}</p>
                                                    <p><strong>Type:</strong> {data.typeContrat || "Non défini"}</p>
                                                    <p><strong>Date de début:</strong> {formatDate(data.dateDebut) || "Non définie"}</p>
                                                    {data.typeContrat !== "CDI" && (
                                                        <p><strong>Date de fin:</strong> {formatDate(data.dateFin) || "Non définie"}</p>
                                                    )}
                                                    <p>
                                                        <strong>Salaire:</strong> {data.salaireDeBase || "0"} € 
                                                        ({data.periodiciteSalaire === "MENSUEL" ? "mensuel" : 
                                                          data.periodiciteSalaire === "HORAIRE" ? "horaire" : 
                                                          data.periodiciteSalaire === "HEBDOMADAIRE" ? "hebdomadaire" : "annuel"})
                                                    </p>
                                                </Col>
                                                <Col md={6}>
                                                    <p>
                                                        <strong>Agent:</strong> {selectedAgent ? 
                                                            `${selectedAgent.prenom} ${selectedAgent.nom}` : "Non sélectionné"}
                                                    </p>
                                                    <p>
                                                        <strong>Entreprise:</strong> {selectedEntreprise ? 
                                                            selectedEntreprise.nom : "Non sélectionnée"}
                                                    </p>
                                                    <p>
                                                        <strong>Mission:</strong> {selectedMission ? 
                                                            selectedMission.titreMission : "Non sélectionnée"}
                                                    </p>
                                                    <p>
                                                        <strong>Clauses:</strong> {data.clauseIds?.length || 0} sélectionnée(s)
                                                    </p>
                                                    <p>
                                                        <strong>Articles:</strong> {data.articleIds?.length || 0} sélectionné(s)
                                                    </p>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="d-flex justify-content-between mt-4">
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={handlePrevious}
                                                className="px-4 py-2"
                                            >
                                                Retour
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                variant="success" 
                                                className="px-4 py-2"
                                                disabled={!canProceed() || isLoading}
                                            >
                                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                                {isLoading ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" /> 
                                                        Enregistrement...
                                                    </>
                                                ) : "Enregistrer le contrat"}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
}
