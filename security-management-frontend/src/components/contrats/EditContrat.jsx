// src/components/contrats/EditContrat.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ContratService from "../../services/ContratService";
import DevisService from "../../services/DevisService";
import MissionService from "../../services/MissionService";
import ArticleService from "../../services/ArticleService";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFileContract, faSave, faArrowLeft, faCalendarAlt, 
    faClipboardCheck, faFileInvoice, faTasks, faFilePdf, 
    faClock, faCheck, faGavel, faEdit
} from "@fortawesome/free-solid-svg-icons";

export default function EditContrat() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [devisList, setDevisList] = useState([]);
    const [missionsList, setMissionsList] = useState([]);
    const [articlesList, setArticlesList] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState({
        contrat: true,
        devis: true,
        missions: true, 
        articles: true
    });

    // charger le contrat existant + listes
    useEffect(() => {
        // Charger le contrat
        ContratService.getById(id)
            .then(r => {
                console.log("Contrat chargé:", r.data);
                const c = r.data;
                setData({
                    referenceContrat: c.referenceContrat,
                    dateSignature: c.dateSignature,
                    dureeMois: c.dureeMois ?? "",
                    taciteReconduction: c.taciteReconduction,
                    preavisMois: c.preavisMois ?? "",
                    devisId: c.devisId?.toString() || "",
                    missionIds: c.missionIds?.map(v => v.toString()) || [],
                    articleIds: c.articleIds?.map(v => v.toString()) || []
                });
                setLoading(prev => ({...prev, contrat: false}));
            })
            .catch(err => {
                console.error("Erreur lors du chargement du contrat:", err);
                setError("Erreur lors du chargement du contrat");
                setLoading(prev => ({...prev, contrat: false}));
            });

        // Charger les devis
        DevisService.getAll()
            .then(r => {
                console.log("Devis chargés:", r.data);
                setDevisList(r.data);
                setLoading(prev => ({...prev, devis: false}));
            })
            .catch(err => {
                console.error("Erreur lors du chargement des devis:", err);
                setLoading(prev => ({...prev, devis: false}));
            });

        // Charger les missions
        MissionService.getAllMissions()
            .then(r => {
                console.log("Missions chargées:", r.data);
                setMissionsList(r.data);
                setLoading(prev => ({...prev, missions: false}));
            })
            .catch(err => {
                console.error("Erreur lors du chargement des missions:", err);
                setLoading(prev => ({...prev, missions: false}));
            });

        // Charger les articles
        ArticleService.getAll()
            .then(r => {
                console.log("Articles chargés:", r.data);
                setArticlesList(r.data);
                setLoading(prev => ({...prev, articles: false}));
            })
            .catch(err => {
                console.error("Erreur lors du chargement des articles:", err);
                setLoading(prev => ({...prev, articles: false}));
            });
    }, [id, navigate]);

    const handleChange = e => {
        const { name, type, checked, value } = e.target;
        
        if (type === "checkbox") {
            setData(d => ({ ...d, [name]: checked }));
        } else if (name === "missionIds" || name === "articleIds") {
            // Pour les sélections multiples
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setData(d => ({ ...d, [name]: selectedOptions }));
        } else {
            setData(d => ({ ...d, [name]: value }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        
        try {
            const payload = {
                ...data,
                dureeMois: data.dureeMois ? Number(data.dureeMois) : null,
                preavisMois: data.preavisMois ? Number(data.preavisMois) : null,
                devisId: Number(data.devisId),
                missionIds: data.missionIds.map(v => Number(v)),
                articleIds: data.articleIds.map(v => Number(v))
            };
            await ContratService.update(id, payload);
            navigate("/contrats");
        } catch (err) {
            console.error("Erreur lors de la modification:", err);
            setError("Impossible de modifier le contrat. Veuillez vérifier les données et réessayer.");
            setIsSubmitting(false);
        }
    };

    if (loading.contrat) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement du contrat...</p>
                </div>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                    Le contrat demandé n'existe pas ou n'a pas pu être chargé.
                </Alert>
                <Button variant="secondary" onClick={() => navigate('/contrats')}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="h4 mb-0">
                            <FontAwesomeIcon icon={faEdit} className="me-2" />
                            Modifier le contrat #{id}
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
                                        value={data.referenceContrat}
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
                                        value={data.dateSignature}
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
                                        value={data.dureeMois}
                                        onChange={handleChange}
                                        placeholder="Ex: 12"
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            
                            <Col md={6} className="mb-3">
                                <Form.Group controlId="devisId">
                                    <Form.Label>
                                        <FontAwesomeIcon icon={faFileInvoice} className="me-1" />
                                        Devis associé<span className="text-danger">*</span>
                                    </Form.Label>
                                    <InputGroup>
                                        <Form.Select
                                            name="devisId"
                                            value={data.devisId}
                                            onChange={handleChange}
                                            required
                                            disabled={loading.devis}
                                        >
                                            <option value="">— Sélectionner un devis —</option>
                                            {devisList.map(d => (
                                                <option key={d.id} value={d.id}>
                                                    {d.referenceDevis} ({new Date(d.dateDevis || d.dateCreation).toLocaleDateString()})
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {loading.devis && (
                                            <Button variant="outline-secondary" disabled>
                                                <Spinner 
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                        )}
                                    </InputGroup>
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
                                        value={data.preavisMois}
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
                                        checked={data.taciteReconduction}
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
                                        value={data.missionIds}
                                        onChange={handleChange}
                                        className="form-control form-control-sm"
                                        style={{ height: "120px" }}
                                        disabled={loading.missions}
                                    >
                                        {loading.missions ? (
                                            <option>Chargement des missions...</option>
                                        ) : missionsList.length > 0 ? (
                                            missionsList.map(m => (
                                                <option key={m.id} value={m.id.toString()}>
                                                    {m.titreMission || m.titre || m.libelle || `Mission #${m.id}`} — {m.dateDebutMission ? new Date(m.dateDebutMission).toLocaleDateString() : 'N/A'}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>Aucune mission disponible</option>
                                        )}
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
                                        value={data.articleIds}
                                        onChange={handleChange}
                                        className="form-control form-control-sm"
                                        style={{ height: "120px" }}
                                        disabled={loading.articles}
                                    >
                                        {loading.articles ? (
                                            <option>Chargement des articles...</option>
                                        ) : articlesList.length > 0 ? (
                                            articlesList.map(a => (
                                                <option key={a.id} value={a.id.toString()}>
                                                    {a.titreArticle || a.titre || (a.numero && `Article ${a.numero}`) || `Article #${a.id}`}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>Aucun article disponible</option>
                                        )}
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
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
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
                                        Enregistrer les modifications
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
