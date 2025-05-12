// src/components/sites/CreateSite.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link }          from "react-router-dom";
import SiteService                    from "../../services/SiteService";
import MissionService                 from "../../services/MissionService";
import Select                         from "react-select";
import { Button, Card, Container, Form, Row, Col, Alert, Breadcrumb, Spinner, InputGroup, OverlayTrigger, Tooltip, FloatingLabel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faMapMarkerAlt, faInfoCircle, faExclamationTriangle, faSync, faMapPin, faCheck, faBuilding } from '@fortawesome/free-solid-svg-icons';
import '../../styles/SiteForms.css';

export default function CreateSite() {
    const nav = useNavigate();

    const [site, setSite] = useState({
        nom: "",
        numero: "",
        rue: "",
        codePostal: "",
        ville: "",
        departement: "",
        region: "",
        pays: "France",
        missionsIds: []
    });
    const [missionsOptions, setMissionsOptions] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMissions, setLoadingMissions] = useState(true);
    const [validated, setValidated] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Charger la liste des missions existantes
    useEffect(() => {
        setLoadingMissions(true);
        MissionService.getAllMissions()
            .then(res => {
                const opts = res.data.map(m => ({
                    value: m.id,
                    label: `#${m.id} – ${m.titre || "(sans titre)"}`
                }));
                setMissionsOptions(opts);
                setLoadingMissions(false);
            })
            .catch(() => {
                setError("Impossible de charger les missions");
                setLoadingMissions(false);
            });
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setSite(s => ({ ...s, [name]: value }));
        // Réinitialiser le message d'erreur lorsque l'utilisateur commence à modifier un champ
        if (error) setError("");
    };

    const handleMissionsChange = selected => {
        setSite(s => ({
            ...s,
            missionsIds: selected ? selected.map(opt => opt.value) : []
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const form = e.currentTarget;
        
        // Validation du formulaire
        setValidated(true);
        if (form.checkValidity() === false) {
            e.stopPropagation();
            return;
        }
        
        // Vérification minimale
        if (!site.nom.trim()) {
            setError("Le nom du site est obligatoire");
            return;
        }

        setLoading(true);
        try {
            await SiteService.createSite(site);
            // Afficher le message de succès brièvement avant la redirection
            setShowSuccess(true);
            setTimeout(() => {
                nav("/sites");
            }, 1200);
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la création du site. Veuillez réessayer.");
            setLoading(false);
        }
    };

    // Récupération automatique du code postal et ville via une API (simulé)
    const handlePostalCodeBlur = () => {
        if (site.codePostal && site.codePostal.length === 5 && !site.ville) {
            // Simule une recherche du nom de la ville basée sur le code postal
            // Dans un cas réel, vous pourriez utiliser une API comme api-adresse.data.gouv.fr
            setTimeout(() => {
                if (site.codePostal.startsWith('75')) {
                    setSite(s => ({...s, ville: 'Paris', departement: 'Paris', region: 'Île-de-France'}));
                } else if (site.codePostal.startsWith('69')) {
                    setSite(s => ({...s, ville: 'Lyon', departement: 'Rhône', region: 'Auvergne-Rhône-Alpes'}));
                } else if (site.codePostal.startsWith('13')) {
                    setSite(s => ({...s, ville: 'Marseille', departement: 'Bouches-du-Rhône', region: 'Provence-Alpes-Côte d\'Azur'}));
                }
            }, 300);
        }
    };

    const selectStyles = {
        control: (styles) => ({
            ...styles,
            borderColor: '#dee2e6',
            boxShadow: '0 0 0 0.1rem rgba(13,110,253,.15)',
            transition: 'border-color .15s ease-in-out, box-shadow .15s ease-in-out',
            '&:hover': {
                borderColor: '#86b7fe'
            }
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    return (
        <Container fluid className="py-4 animate__animated animate__fadeIn">
            <Breadcrumb className="mb-3">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/sites" }}>Sites</Breadcrumb.Item>
                <Breadcrumb.Item active>Nouveau site</Breadcrumb.Item>
            </Breadcrumb>

            <Card className="shadow border-0">
                <Card.Header className="bg-primary bg-gradient text-white position-relative">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    <span className="fw-bold fs-4">Créer un nouveau site</span>
                </Card.Header>
                
                <Card.Body className="px-4 py-4">
                    {error && 
                        <Alert variant="danger" className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 fs-4" />
                            <div>{error}</div>
                        </Alert>
                    }
                    
                    {showSuccess && 
                        <Alert variant="success" className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faCheck} className="me-2 fs-4" />
                            <div>Site créé avec succès! Redirection en cours...</div>
                        </Alert>
                    }

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group>
                                    <FloatingLabel controlId="nomSite" label="Nom du site *">
                                        <Form.Control
                                            name="nom"
                                            placeholder="Nom du site"
                                            required
                                            value={site.nom}
                                            onChange={handleChange}
                                            className="shadow-sm"
                                        />
                                    </FloatingLabel>
                                    <Form.Control.Feedback type="invalid">
                                        Le nom du site est obligatoire
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Card className="mb-4 border-light shadow-sm">
                            <Card.Header className="bg-light d-flex align-items-center">
                                <FontAwesomeIcon icon={faMapPin} className="me-2 text-primary" />
                                <span className="fw-bold">Adresse</span>
                            </Card.Header>
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col md={2}>
                                        <FloatingLabel controlId="numeroAdresse" label="Numéro">
                                            <Form.Control
                                                name="numero"
                                                placeholder="N°"
                                                value={site.numero}
                                                onChange={handleChange}
                                                className="shadow-sm"
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col md={10}>
                                        <FloatingLabel controlId="rueAdresse" label="Rue">
                                            <Form.Control
                                                name="rue"
                                                placeholder="Rue"
                                                value={site.rue}
                                                onChange={handleChange}
                                                className="shadow-sm"
                                            />
                                        </FloatingLabel>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <FloatingLabel controlId="codePostalAdresse" label="Code postal">
                                            <Form.Control
                                                name="codePostal"
                                                placeholder="Code postal"
                                                value={site.codePostal}
                                                onChange={handleChange}
                                                onBlur={handlePostalCodeBlur}
                                                className="shadow-sm"
                                                pattern="[0-9]{5}"
                                            />
                                        </FloatingLabel>
                                        <Form.Control.Feedback type="invalid">
                                            Le code postal doit contenir 5 chiffres
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={8}>
                                        <FloatingLabel controlId="villeAdresse" label="Ville">
                                            <Form.Control
                                                name="ville"
                                                placeholder="Ville"
                                                value={site.ville}
                                                onChange={handleChange}
                                                className="shadow-sm"
                                            />
                                        </FloatingLabel>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <FloatingLabel controlId="departementAdresse" label="Département">
                                            <Form.Control
                                                name="departement"
                                                placeholder="Département"
                                                value={site.departement}
                                                onChange={handleChange}
                                                className="shadow-sm"
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col md={4}>
                                        <FloatingLabel controlId="regionAdresse" label="Région">
                                            <Form.Control
                                                name="region"
                                                placeholder="Région"
                                                value={site.region}
                                                onChange={handleChange}
                                                className="shadow-sm"
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col md={4}>
                                        <FloatingLabel controlId="paysAdresse" label="Pays">
                                            <Form.Control
                                                name="pays"
                                                placeholder="Pays"
                                                value={site.pays}
                                                onChange={handleChange}
                                                defaultValue="France"
                                                className="shadow-sm"
                                            />
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 border-light shadow-sm">
                            <Card.Header className="bg-light d-flex align-items-center">
                                <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                                <span className="fw-bold">Missions associées</span>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Sélectionnez les missions à associer à ce site</Tooltip>}
                                >
                                    <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-muted" />
                                </OverlayTrigger>
                            </Card.Header>
                            <Card.Body>
                                {loadingMissions ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        <span>Chargement des missions...</span>
                                    </div>
                                ) : (
                                    <div className="select-container">
                                        <Select
                                            isMulti
                                            options={missionsOptions}
                                            placeholder="Sélectionnez une ou plusieurs missions..."
                                            onChange={handleMissionsChange}
                                            noOptionsMessage={() => "Aucune mission disponible"}
                                            styles={selectStyles}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            menuPortalTarget={document.body}
                                        />
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button 
                                variant="outline-secondary" 
                                as={Link} 
                                to="/sites"
                                className="px-4 py-2"
                                disabled={loading}
                            >
                                <FontAwesomeIcon icon={faTimes} className="me-2" /> Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={loading}
                                className="px-4 py-2"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-2" /> Création en cours...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSave} className="me-2" /> Enregistrer
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
