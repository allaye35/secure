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
    faClipboardCheck, faFileInvoice, faTasks, faFilePdf, 
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
        documentPdf: null,
        devisId: "",
        missionIds: [],
        articleIds: []
    });
    const [devisList, setDevisList] = useState([]);
    const [missionsList, setMissionsList] = useState([]);
    const [articlesList, setArticlesList] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);    useEffect(() => {
        // Charger les données nécessaires avec gestion d'erreur
        const loadData = async () => {
            setLoading(true);
            setError("");
            
            // Définir un timeout pour les requêtes
            const timeoutDuration = 10000; // 10 secondes
            const controller = new AbortController();
            const { signal } = controller;
            setTimeout(() => controller.abort(), timeoutDuration);
            
            // Essayer de charger les données même en cas d'erreur pour avoir au moins certaines données
            let devisLoaded = false, missionsLoaded = false, articlesLoaded = false;
            
            // 1. Charger les devis
            try {
                console.log("▶️ Chargement des devis...");
                const devisResponse = await DevisService.getAll();
                setDevisList(Array.isArray(devisResponse?.data) ? devisResponse.data : []);
                console.log("✅ Devis chargés:", devisResponse?.data?.length || 0, "éléments");
                devisLoaded = true;
            } catch (devisErr) {
                console.error("❌ Erreur chargement des devis:", devisErr);
                // Vérifier si le backend est accessible
                if (devisErr?.code === "ERR_NETWORK") {
                    setError(prev => prev + "Le serveur n'est pas accessible. ");
                } else {
                    setError(prev => prev + "Erreur lors du chargement des devis. ");
                }
            }
            
            // 2. Charger les missions
            try {
                console.log("▶️ Chargement des missions...");
                const missionsResponse = await MissionService.getAllMissions();
                setMissionsList(Array.isArray(missionsResponse?.data) ? missionsResponse.data : []);
                console.log("✅ Missions chargées:", missionsResponse?.data?.length || 0, "éléments");
                missionsLoaded = true;
            } catch (missionsErr) {
                console.error("❌ Erreur chargement des missions:", missionsErr);
                if (!devisLoaded && missionsErr?.code === "ERR_NETWORK") {
                    // Ne pas dupliquer le message d'erreur réseau
                } else {
                    setError(prev => prev + "Erreur lors du chargement des missions. ");
                }
            }
            
            // 3. Charger les articles
            try {
                console.log("▶️ Chargement des articles juridiques...");
                const articlesResponse = await ArticleService.getAll();
                setArticlesList(Array.isArray(articlesResponse?.data) ? articlesResponse.data : []);
                console.log("✅ Articles juridiques chargés:", articlesResponse?.data?.length || 0, "éléments");
                articlesLoaded = true;
            } catch (articlesErr) {
                console.error("❌ Erreur chargement des articles:", articlesErr);
                if ((!devisLoaded && !missionsLoaded) && articlesErr?.code === "ERR_NETWORK") {
                    // Ne pas dupliquer le message d'erreur réseau
                } else {
                    setError(prev => prev + "Erreur lors du chargement des articles juridiques. ");
                }
            }
            
            setLoading(false);
            
            // Vérifier si toutes les données sont chargées
            if (!devisLoaded && !missionsLoaded && !articlesLoaded) {
                console.error("❌❌❌ Aucune donnée n'a pu être chargée!");
                setError("Impossible de charger les données. Vérifiez que le serveur est accessible.");
            }
        };
        
        loadData();
    }, []);

    const handleChange = e => {
        const { name, type, checked, files, value } = e.target;

        if (type === "file") {
            const file = files[0];
            setForm(f => ({ ...f, documentPdf: file }));
            setSelectedFile(file ? file.name : null);
        } else if (type === "checkbox") {
            setForm(f => ({ ...f, [name]: checked }));
        } else if (name === "missionIds" || name === "articleIds") {
            // Pour les sélections multiples
            const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
            setForm(f => ({ ...f, [name]: selectedOptions }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        
    // Vérifier uniquement la présence de la référence du contrat (seul champ obligatoire)
        if (!form.referenceContrat) {
            setError("Veuillez saisir une référence pour le contrat");
            setIsSubmitting(false);
            return;
        }
                
        try {            // Créer l'objet pour l'envoi - uniquement les données JSON sans le fichier
            const contratData = {
                referenceContrat: form.referenceContrat,
                dateSignature: form.dateSignature || null,
                dureeMois: form.dureeMois ? parseInt(form.dureeMois, 10) : null,
                taciteReconduction: form.taciteReconduction || false,
                preavisMois: form.preavisMois ? parseInt(form.preavisMois, 10) : null,
                // Rendre devisId optionnel
                devisId: form.devisId ? parseInt(form.devisId, 10) : null
            };
            
            // Ajouter les missions et articles de manière appropriée
            if (form.missionIds && form.missionIds.length > 0) {
                contratData.missionIds = form.missionIds;
            }
            
            if (form.articleIds && form.articleIds.length > 0) {
                contratData.articleIds = form.articleIds;
            }
            
            // Le fichier PDF sera ajouté séparément dans le FormData par le service
            // NE PAS ajouter le fichier directement à l'objet contratData
            
            console.log("📤 Envoi du contrat:", form.referenceContrat, "avec fichier:", !!form.documentPdf, "données:", contratData);
            
            // Envoi des données avec le service approprié et gestion du timeout
            const timeoutDuration = 15000; // 15 secondes
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
              try {
                // Passer le contratData et le fichier PDF séparément au service
                await ContratService.create(contratData, form.documentPdf);
                clearTimeout(timeoutId);
                console.log("✅ Contrat créé avec succès!");
                navigate("/contrats");
            } catch (apiError) {
                clearTimeout(timeoutId);
                if (apiError.name === "AbortError") {
                    throw new Error("La requête a pris trop de temps. Vérifiez votre connexion et réessayez.");
                }
                throw apiError;
            }
        } catch (err) {
            console.error("❌ Échec de création du contrat:", err);
            let errorMessage = "Impossible de créer le contrat.";
            
            if (err.response) {
                // Erreur de serveur avec message
                errorMessage += ` Erreur ${err.response.status}: ${err.response.data?.message || "Vérifiez les données et réessayez."}`;
            } else if (err.code === "ERR_NETWORK") {
                errorMessage += " Le serveur n'est pas accessible. Vérifiez votre connexion.";
            } else {
                errorMessage += " " + (err.message || "Vérifiez les données et réessayez.");
            }
            
            setError(errorMessage);
            setIsSubmitting(false);
        }
    };    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement des données...</p>
                </div>
            </Container>
        );
    }
    
    // Vérification des données requises
    const missingData = [];
    if (!devisList.length) missingData.push("devis");
    if (!missionsList.length) missingData.push("missions");
    if (!articlesList.length) missingData.push("articles juridiques");
    
    if (missingData.length > 0) {
        console.warn("Données manquantes:", missingData);
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
                    
                    {missingData.length > 0 && (
                        <Alert variant="warning" className="mb-4">
                            <strong>Attention:</strong> Certaines données requises n'ont pas pu être chargées ({missingData.join(", ")}). 
                            <Button variant="link" className="p-0 mx-2" onClick={() => window.location.reload()}>
                                Rafraîchir la page
                            </Button>
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
                            
                            <Col md={6} className="mb-3">                                <Form.Group controlId="dateSignature">
                                    <Form.Label>
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                        Date de signature (optionnelle)
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dateSignature"
                                        value={form.dateSignature}
                                        onChange={handleChange}
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
                                        Devis associé (optionnel)
                                    </Form.Label>
                                    <Form.Select
                                        name="devisId"
                                        value={form.devisId}
                                        onChange={handleChange}
                                    >
                                        <option value="">— Sélectionner un devis —</option>
                                        {devisList.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.referenceDevis} ({new Date(d.dateDevis).toLocaleDateString()})
                                            </option>
                                        ))}
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
                        
                        <Row className="mb-4">
                            <Col md={12}>
                                <Form.Group controlId="documentPdf">
                                    <Form.Label>
                                        <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                                        Document PDF signé
                                    </Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="file"
                                            name="documentPdf"
                                            accept="application/pdf"
                                            onChange={handleChange}
                                            className="form-control-file"
                                        />
                                    </InputGroup>
                                    {selectedFile && (
                                        <small className="text-muted d-block mt-1">
                                            Fichier sélectionné: {selectedFile}
                                        </small>
                                    )}
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
