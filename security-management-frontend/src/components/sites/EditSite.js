// src/components/sites/EditSite.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import SiteService from "../../services/SiteService";
import MissionService from "../../services/MissionService";
import Select from "react-select";
import { Button, Card, Container, Form, Row, Col, Alert, Breadcrumb, Spinner, InputGroup, OverlayTrigger, Tooltip, FloatingLabel, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faMapMarkerAlt, faEdit, faInfoCircle, faExclamationTriangle, faCheck, faMapPin, faBuilding, faHistory } from '@fortawesome/free-solid-svg-icons';
import '../../styles/SiteForms.css';

export default function EditSite() {
    const { id } = useParams();
    const navigate = useNavigate();

    // 1) État local pour le site (avec missionsIds, même nom que dans SiteCreateDto)
    const [site, setSite] = useState({
        nom: "",
        numero: "",
        rue: "",
        codePostal: "",
        ville: "",
        departement: "",
        region: "",
        pays: "",
        missionsIds: []
    });

    // 2) Les options pour React‑Select
    const [missionsOptions, setMissionsOptions] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [validated, setValidated] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [siteOriginal, setSiteOriginal] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setInitialLoading(true);
            try {
                // a) Charger le site existant
                const siteResponse = await SiteService.getSiteById(id);
                const dto = siteResponse.data;
                const siteData = {
                    nom: dto.nom,
                    numero: dto.numero,
                    rue: dto.rue,
                    codePostal: dto.codePostal,
                    ville: dto.ville,
                    departement: dto.departement,
                    region: dto.region,
                    pays: dto.pays,
                    missionsIds: dto.missionsIds || [] // <-- impératif : missionsIds
                };
                
                setSite(siteData);
                setSiteOriginal(JSON.stringify(siteData)); // Garder une copie de l'original pour détecter les changements

                // b) Charger toutes les missions pour peupler le select
                const missionsResponse = await MissionService.getAllMissions();
                const opts = missionsResponse.data.map(m => ({
                    value: m.id,
                    label: m.intitule || m.titre || `Mission #${m.id}`
                }));
                setMissionsOptions(opts);
            } catch (err) {
                console.error(err);
                setError("Impossible de charger les données du site.");
                setTimeout(() => navigate("/sites"), 3000);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    // Vérifier si le formulaire a changé par rapport à l'original
    useEffect(() => {
        if (siteOriginal) {
            const currentSite = JSON.stringify(site);
            setHasChanges(currentSite !== siteOriginal);
        }
    }, [site, siteOriginal]);

    // Handler pour les champs texte
    const handleChange = e => {
        const { name, value } = e.target;
        setSite(s => ({ ...s, [name]: value }));
        // Réinitialiser le message d'erreur lorsque l'utilisateur commence à modifier un champ
        if (error) setError("");
    };

    // Handler pour React‑Select (multi)
    const handleMissionsChange = selectedOptions => {
        setSite(s => ({
            ...s,
            missionsIds: selectedOptions
                ? selectedOptions.map(opt => opt.value)
                : []
        }));
    };

    // Récupération automatique du code postal et ville via une API (simulé)
    const handlePostalCodeBlur = () => {
        if (site.codePostal && site.codePostal.length === 5 && !site.ville) {
            // Simule une recherche du nom de la ville basée sur le code postal
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

    // Soumission du formulaire
    const handleSubmit = e => {
        e.preventDefault();
        const form = e.currentTarget;
        
        // Validation du formulaire
        setValidated(true);
        if (form.checkValidity() === false) {
            e.stopPropagation();
            return;
        }

        if (!site.nom.trim()) {
            setError("Le nom du site est obligatoire");
            return;
        }

        if (!hasChanges) {
            // Si aucun changement, rediriger sans appel API
            navigate(`/sites/${id}`);
            return;
        }

        setLoading(true);
        SiteService.updateSite(id, site)
            .then(() => {
                setShowSuccess(true);
                setTimeout(() => navigate(`/sites/${id}`), 1200);
            })
            .catch(err => {
                console.error(err);
                setError("Erreur lors de la mise à jour du site");
                setLoading(false);
            });
    };

    // Réinitialiser les modifications
    const handleReset = () => {
        if (siteOriginal) {
            setSite(JSON.parse(siteOriginal));
            setValidated(false);
            setError("");
        }
    };

    // Valeurs par défaut pour React‑Select
    const defaultMissionValues = missionsOptions.filter(opt =>
        site.missionsIds.includes(opt.value)
    );

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

    if (initialLoading) {
        return (
            <Container className="d-flex justify-content-center py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" className="mb-3" size="lg" />
                    <p className="mb-0 mt-2 text-muted">Chargement des données du site...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 animate__animated animate__fadeIn">
            <Breadcrumb className="mb-3">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/sites" }}>Sites</Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/sites/${id}` }}>Site #{id}</Breadcrumb.Item>
                <Breadcrumb.Item active>Modifier</Breadcrumb.Item>
            </Breadcrumb>

            <Card className="shadow border-0">
                <Card.Header className="bg-primary bg-gradient text-white d-flex justify-content-between align-items-center">
                    <div>
                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                        <span className="fw-bold fs-4">Modification du site #{id}</span>
                    </div>
                    {hasChanges && (
                        <Badge bg="warning" className="px-3 py-2">
                            <FontAwesomeIcon icon={faHistory} className="me-1" /> Modifications non enregistrées
                        </Badge>
                    )}
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
                            <div>Site modifié avec succès! Redirection en cours...</div>
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
                                <div className="select-container">
                                    <Select
                                        isMulti
                                        options={missionsOptions}
                                        value={defaultMissionValues}
                                        onChange={handleMissionsChange}
                                        placeholder="Sélectionnez une ou plusieurs missions..."
                                        noOptionsMessage={() => "Aucune mission disponible"}
                                        styles={selectStyles}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        menuPortalTarget={document.body}
                                    />
                                </div>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-between mt-4">
                            <Button 
                                variant="outline-secondary" 
                                onClick={handleReset} 
                                disabled={!hasChanges || loading}
                                className="px-3"
                            >
                                <FontAwesomeIcon icon={faHistory} className="me-2" /> Réinitialiser
                            </Button>
                            
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="outline-secondary" 
                                    as={Link} 
                                    to={`/sites/${id}`}
                                    className="px-4 py-2"
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={faTimes} className="me-2" /> Annuler
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant={hasChanges ? "primary" : "outline-primary"}
                                    disabled={loading || !hasChanges}
                                    className="px-4 py-2"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" animation="border" className="me-2" /> Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faSave} className="me-2" /> Enregistrer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}
