// src/components/contrats/CreateContrat.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContratService from "../../services/ContratService";
import DevisService from "../../services/DevisService";
import MissionService from "../../services/MissionService";
import ArticleService from "../../services/ArticleService";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFileContract, faSave, faArrowLeft, faCalendarAlt, 
    faClipboardCheck, faFileInvoice, faTasks, 
    faClock, faCheck, faGavel
} from "@fortawesome/free-solid-svg-icons";

export default function CreateContrat() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        referenceContrat: "",
        dateSignature: "",
        dureeMois: "",
        taciteReconduction: false,
        preavisMois: "",
        devisId: "",
        missionIds: [],
        articleIds: []
    });
    const [devisList, setDevisList] = useState([]);
    const [missionsList, setMissionsList] = useState([]);
    const [articlesList, setArticlesList] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);    useEffect(() => {
        // Charger les données nécessaires avec gestion d'erreur
        const loadData = async () => {
            setLoading(true);
            try {
                const [devis, missions, articles] = await Promise.all([
                    // Utiliser la méthode getDisponibles pour ne récupérer que les devis sans contrat
                    DevisService.getDisponibles(),
                    MissionService.getAllMissions(),
                    ArticleService.getAll()
                ]);
                
                setDevisList(devis.data || []);
                setMissionsList(missions.data || []);
                setArticlesList(articles.data || []);
            } catch (err) {
                console.error("Erreur chargement des données:", err);
                setError("Impossible de charger les données. Veuillez rafraîchir la page.");
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    const handleChange = e => {
        const { name, type, checked, value } = e.target;

        if (type === "checkbox") {
            setForm(f => ({ ...f, [name]: checked }));
        } else if (name === "missionIds" || name === "articleIds") {
            // Pour les sélections multiples
            const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
            setForm(f => ({ ...f, [name]: selectedOptions }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {            // Créer l'objet JSON pour l'envoi
            const contratData = {
                referenceContrat: form.referenceContrat,
                dateSignature: form.dateSignature,
                dureeMois: form.dureeMois ? parseInt(form.dureeMois, 10) : null,
                taciteReconduction: form.taciteReconduction,
                preavisMois: form.preavisMois ? parseInt(form.preavisMois, 10) : null,
                devisId: form.devisId ? parseInt(form.devisId, 10) : null,
                missionIds: form.missionIds,
                articleIds: form.articleIds
            };            
            
            // Vérifions d'abord que le devis n'est pas déjà lié (double vérification)
            if (contratData.devisId !== null) {
                const devisCheck = await DevisService.getById(contratData.devisId);
                if (devisCheck.data && devisCheck.data.contratId) {
                    setError("Ce devis est déjà lié à un autre contrat. Veuillez en choisir un autre.");
                    setIsSubmitting(false);
                    return;
                }
            }
            
            // Envoi direct de l'objet
            await ContratService.create(contratData);
            navigate("/contrats");
        } catch (err) {
            console.error("Création contrat :", err.response || err);
            // Gestion plus détaillée des erreurs
            if (err.response) {
                const status = err.response.status;
                const errorMessage = err.response.data?.message || "";
                
                if (status === 500) {
                    if (errorMessage.includes("déjà lié") || errorMessage.includes("already linked")) {
                        setError("Ce devis est déjà lié à un autre contrat. Veuillez rafraîchir la page et choisir un autre devis.");
                        // Rechargeons les devis disponibles
                        try {
                            const response = await DevisService.getDisponibles();
                            setDevisList(response.data || []);
                            setForm(prev => ({ ...prev, devisId: "" })); // Reset le devis sélectionné
                        } catch (e) {
                            console.error("Erreur lors du rechargement des devis:", e);
                        }
                    } else {
                        setError("Erreur serveur lors de la création du contrat: " + errorMessage);
                    }
                } else if (status === 400) {
                    setError("Données invalides: " + errorMessage);
                } else {
                    setError("Erreur " + status + " lors de la création du contrat: " + errorMessage);
                }
            } else {
                setError("Impossible de contacter le serveur. Vérifiez votre connexion internet.");
            }
            setIsSubmitting(false);
        }
    };

    if (loading && !articlesList.length && !devisList.length) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement des données...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="h4 mb-0">
                            <FontAwesomeIcon icon={faFileContract} className="me-2" />
                            Créer un nouveau contrat
                        </h2>
                        <Button variant="light" onClick={() => navigate("/contrats")}>
                            <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                            Retour
                        </Button>
                    </div>
                </Card.Header>
                
                <Card.Body>
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group controlId="referenceContrat">
                                    <Form.Label>Référence du contrat<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="referenceContrat"
                                        value={form.referenceContrat}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: CONT-2025-001"
                                    />
                                </Form.Group>
                            </Col>
                            
                            <Col md={6} className="mb-3">
                                <Form.Group controlId="dateSignature">
                                    <Form.Label>
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                        Date de signature<span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dateSignature"
                                        value={form.dateSignature}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group controlId="dureeMois">
                                    <Form.Label>
                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                        Durée (mois)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="dureeMois"
                                        value={form.dureeMois}
                                        onChange={handleChange}
                                        placeholder="Ex: 12"
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            
                            <Col md={6} className="mb-3">                                <Form.Group controlId="devisId">
                                    <Form.Label>
                                        <FontAwesomeIcon icon={faFileInvoice} className="me-1" />
                                        Devis associé
                                    </Form.Label>                                    <Form.Select
                                        name="devisId"
                                        value={form.devisId}
                                        onChange={handleChange}
                                        disabled={devisList.length === 0}
                                    >
                                        <option value="">— Sélectionner un devis —</option>
                                        {devisList.length === 0 ? (
                                            <option value="" disabled>Aucun devis disponible</option>
                                        ) : (
                                            devisList
                                                .filter(d => d.contratId === null) // Double vérification
                                                .map(d => (
                                                <option key={d.id} value={d.id}>
                                                    {d.referenceDevis} ({new Date(d.dateValidite).toLocaleDateString()})
                                                </option>
                                            ))
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group controlId="preavisMois">
                                    <Form.Label>Préavis (mois)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="preavisMois"
                                        value={form.preavisMois}
                                        onChange={handleChange}
                                        placeholder="Ex: 3"
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            
                            <Col md={6} className="mb-3">
                                <Form.Group className="mt-4">
                                    <Form.Check
                                        type="switch"
                                        id="taciteReconduction"
                                        name="taciteReconduction"
                                        label={
                                            <span>
                                                <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                Tacite reconduction
                                            </span>
                                        }
                                        checked={form.taciteReconduction}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <h5 className="mb-3 mt-4">
                            <FontAwesomeIcon icon={faTasks} className="me-2" />
                            Missions liées au contrat
                        </h5>
                        <Row className="mb-4">
                            <Col>
                                <Form.Group controlId="missionIds">
                                    <Form.Select 
                                        multiple 
                                        name="missionIds" 
                                        value={form.missionIds.map(String)}
                                        onChange={handleChange}
                                        className="form-control form-control-sm"
                                        style={{ height: "120px" }}
                                    >
                                        {missionsList.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.titreMission || m.titre || m.libelle || `Mission #${m.id}`} — {m.dateDebutMission ? new Date(m.dateDebutMission).toLocaleDateString() : 'N/A'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs missions
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <h5 className="mb-3">
                            <FontAwesomeIcon icon={faGavel} className="me-2" />
                            Articles juridiques applicables
                        </h5>
                        <Row className="mb-4">
                            <Col>
                                <Form.Group controlId="articleIds">
                                    <Form.Select 
                                        multiple 
                                        name="articleIds" 
                                        value={form.articleIds.map(String)}
                                        onChange={handleChange}
                                        className="form-control form-control-sm"
                                        style={{ height: "120px" }}
                                    >
                                        {articlesList.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.titre || a.libelle || `Article #${a.id}`}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs articles
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                            <Button 
                                variant="secondary" 
                                className="me-2"
                                onClick={() => navigate("/contrats")}
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
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
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSave} className="me-2" />
                                        Enregistrer
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
