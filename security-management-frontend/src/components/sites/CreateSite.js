// src/components/sites/CreateSite.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link }          from "react-router-dom";
import SiteService                    from "../../services/SiteService";
import MissionService                 from "../../services/MissionService";
import Select                         from "react-select";
import { Button, Card, Container, Form, Row, Col, Alert, Breadcrumb, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

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
        pays: "",
        missionsIds: []
    });
    const [missionsOptions, setMissionsOptions] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMissions, setLoadingMissions] = useState(true);

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
        // Vérification minimale
        if (!site.nom.trim()) {
            setError("Le nom du site est obligatoire");
            return;
        }

        setLoading(true);
        try {
            await SiteService.createSite(site);
            nav("/sites");
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la création du site. Veuillez réessayer.");
            setLoading(false);
        }
    };

    const selectStyles = {
        control: (styles) => ({
            ...styles,
            borderColor: '#dee2e6',
            '&:hover': {
                borderColor: '#ced4da'
            }
        })
    };

    return (
        <Container fluid className="py-4">
            <Breadcrumb className="mb-3">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/sites" }}>Sites</Breadcrumb.Item>
                <Breadcrumb.Item active>Nouveau site</Breadcrumb.Item>
            </Breadcrumb>

            <Card className="shadow-sm">
                <Card.Header className="bg-primary bg-gradient text-white">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    <span className="fw-bold fs-4">Créer un nouveau site</span>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md>
                                <Form.Group>
                                    <Form.Label>Nom du site <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        name="nom"
                                        placeholder="Nom du site"
                                        required
                                        value={site.nom}
                                        onChange={handleChange}
                                    />
                                    <Form.Text muted>Le nom est obligatoire</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Card className="mb-4">
                            <Card.Header className="bg-light">Adresse</Card.Header>
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Numéro</Form.Label>
                                            <Form.Control
                                                name="numero"
                                                placeholder="N°"
                                                value={site.numero}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={10}>
                                        <Form.Group>
                                            <Form.Label>Rue</Form.Label>
                                            <Form.Control
                                                name="rue"
                                                placeholder="Rue"
                                                value={site.rue}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Code postal</Form.Label>
                                            <Form.Control
                                                name="codePostal"
                                                placeholder="Code postal"
                                                value={site.codePostal}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={8}>
                                        <Form.Group>
                                            <Form.Label>Ville</Form.Label>
                                            <Form.Control
                                                name="ville"
                                                placeholder="Ville"
                                                value={site.ville}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Département</Form.Label>
                                            <Form.Control
                                                name="departement"
                                                placeholder="Département"
                                                value={site.departement}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Région</Form.Label>
                                            <Form.Control
                                                name="region"
                                                placeholder="Région"
                                                value={site.region}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Pays</Form.Label>
                                            <Form.Control
                                                name="pays"
                                                placeholder="Pays"
                                                value={site.pays}
                                                onChange={handleChange}
                                                defaultValue="France"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Form.Group className="mb-4">
                            <Form.Label>Missions associées</Form.Label>
                            {loadingMissions ? (
                                <div className="text-center py-2">
                                    <Spinner animation="border" size="sm" /> Chargement des missions...
                                </div>
                            ) : (
                                <Select
                                    isMulti
                                    options={missionsOptions}
                                    placeholder="Sélectionnez une ou plusieurs missions..."
                                    onChange={handleMissionsChange}
                                    noOptionsMessage={() => "Aucune mission disponible"}
                                    styles={selectStyles}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                />
                            )}
                            <Form.Text muted>Sélectionnez les missions à associer à ce site</Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                as={Link} 
                                to="/sites"
                            >
                                <FontAwesomeIcon icon={faTimes} className="me-1" /> Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-1" /> Création en cours...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSave} className="me-1" /> Enregistrer
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
