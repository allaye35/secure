// src/components/articleContratTravails/ArticleContratTravailForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { 
    FaSave, 
    FaTimes, 
    FaArrowLeft, 
    FaFileContract, 
    FaPaperPlane, 
    FaSpinner, 
    FaCheckCircle, 
    FaExclamationTriangle,
    FaFileAlt,
    FaRegLightbulb,
    FaLink,
    FaPlus
} from "react-icons/fa";
import "../../styles/ArticleContratTravailForm.css";

export default function ArticleContratTravailForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    
    const [form, setForm] = useState({ 
        libelle: "", 
        contenu: "",
        contratDeTravailId: "" 
    });
    const [contrats, setContrats] = useState([]);
    const [contratsLoading, setContratsLoading] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [validated, setValidated] = useState(false);    // Chargement des contrats de travail disponibles
    useEffect(() => {
        setContratsLoading(true);
        ContratDeTravailService.getAll()
            .then(response => {
                console.log("Contrats récupérés:", response.data);
                setContrats(response.data);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des contrats:", err);
                // On ne bloque pas le formulaire pour autant
            })
            .finally(() => setContratsLoading(false));
    }, []);

    // Chargement des données de l'article si en mode édition
    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            ArticleContratTravailService.getById(id)
                .then(res => {
                    console.log("Article récupéré:", res.data);
                    setForm({
                        libelle: res.data.libelle,
                        contenu: res.data.contenu,
                        contratDeTravailId: res.data.contratDeTravailId || ""
                    });
                })
                .catch(err => {
                    console.error("Erreur lors de la récupération:", err);
                    setError("Impossible de charger l'article");
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };    const handleSubmit = async e => {
        const form = e.currentTarget;
        e.preventDefault();
        
        // Validation du formulaire
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        
        setValidated(true);
        setLoading(true);
        setError("");
        
        try {
            // Création d'une copie du formulaire pour éviter des modifications indésirables
            const articleData = { ...form };
            
            // Convertir l'ID du contrat en nombre si présent
            if (articleData.contratDeTravailId) {
                articleData.contratDeTravailId = Number(articleData.contratDeTravailId);
            }
            
            if (isEdit) {
                // Force la recréation de l'objet pour s'assurer que toutes les propriétés sont envoyées
                const updateData = {
                    libelle: articleData.libelle,
                    contenu: articleData.contenu,
                    contratDeTravailId: articleData.contratDeTravailId
                };
                
                console.log("Mise à jour avec les données:", updateData);
                const response = await ArticleContratTravailService.update(id, updateData);
                console.log("Réponse après mise à jour:", response);
                setSuccess(true);
                
                // Redirection après un court délai pour montrer le message de succès
                setTimeout(() => {
                    navigate("/article-contrat-travail", { 
                        state: { message: "Article modifié avec succès!" }
                    });
                }, 1500);
            } else {
                // Vérifier que contratDeTravailId est bien présent
                if (!articleData.contratDeTravailId) {
                    setError("Veuillez sélectionner un contrat de travail");
                    setLoading(false);
                    window.scrollTo(0, 0);
                    return;
                }
                
                console.log("Création avec les données:", articleData);
                const response = await ArticleContratTravailService.create(articleData);
                console.log("Réponse après création:", response);
                setSuccess(true);
                
                // Redirection après un court délai pour montrer le message de succès
                setTimeout(() => {
                    navigate("/article-contrat-travail", { 
                        state: { message: "Article créé avec succès!" }
                    });
                }, 1500);
            }
        } catch (err) {
            console.error("Erreur lors de l'enregistrement:", err);
            setError("Erreur lors de l'enregistrement de l'article. Veuillez vérifier vos informations et réessayer.");
            window.scrollTo(0, 0); // Scroll vers le message d'erreur
        } finally {
            setLoading(false);
        }
    };    return (
        <Container className="article-form-container py-4">
            <Card className="shadow-sm">                <Card.Header className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0 d-flex align-items-center">
                            <FaFileContract className="me-2 text-primary" />
                            {isEdit ? "Modifier" : "Créer"} un article de contrat de travail
                        </h2>
                        <Button 
                            variant="outline-secondary" 
                            as={Link} 
                            to="/article-contrat-travail"
                            className="btn-circle"
                            title="Retour à la liste"
                        >
                            <FaArrowLeft />
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body className="px-4 py-4">
                    {/* Message d'erreur */}
                    {error && (
                        <Alert variant="danger" className="mb-4 d-flex align-items-start">
                            <div className="me-3 mt-1">
                                <FaTimes size={20} />
                            </div>
                            <div>
                                <strong>Erreur</strong>
                                <p className="mb-0">{error}</p>
                            </div>
                        </Alert>
                    )}
                    
                    {/* Message de succès */}
                    {success && (
                        <Alert variant="success" className="mb-4 d-flex align-items-start">
                            <div className="me-3 mt-1">
                                <FaCheckCircle size={20} />
                            </div>
                            <div>
                                <strong>{isEdit ? "Article modifié avec succès!" : "Article créé avec succès!"}</strong>
                                <div className="mt-2 d-flex align-items-center">
                                    <Spinner animation="border" size="sm" className="me-2" /> 
                                    <span>Redirection en cours...</span>
                                </div>
                            </div>
                        </Alert>
                    )}
                    
                    {/* Bannière d'information */}
                    <div className="form-title-banner mb-4">
                        <h3>{isEdit ? "Modification d'un article" : "Création d'un nouvel article"}</h3>
                        <p>Les articles de contrat de travail définissent les termes et conditions qui s'appliqueront à vos employés.</p>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Chargement en cours...</p>
                        </div>
                    ) : (
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>                            <div className="info-bg mb-4">
                                <p><FaRegLightbulb className="me-2" /> {isEdit ? "Modifiez les informations ci-dessous pour mettre à jour cet article de contrat." : "Remplissez le formulaire ci-dessous pour créer un nouvel article de contrat de travail. N'oubliez pas de sélectionner un contrat de travail existant."}</p>
                            </div>
                            
                            {!isEdit && (
                                <Alert variant="info" className="mb-4">
                                    <div className="d-flex">
                                        <div className="me-3">
                                            <FaFileContract size={24} />
                                        </div>
                                        <div>
                                            <h5>Contrat de travail</h5>
                                            <p className="mb-0">Vous devez sélectionner un contrat de travail existant pour pouvoir y associer cet article. Si aucun contrat n'est disponible, veuillez d'abord <Link to="/contrats-de-travail/create">créer un contrat de travail</Link>.</p>
                                        </div>
                                    </div>
                                </Alert>
                            )}
                            
                            <Row>
                                <Col xs={12}>
                                    <Form.Group className="mb-4" controlId="formLibelle">
                                        <Form.Label className="fw-bold d-flex align-items-center">
                                            <Badge bg="primary" className="me-2" pill>1</Badge>
                                            Libellé <span className="text-danger ms-1">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="libelle"
                                            value={form.libelle}
                                            onChange={handleChange}
                                            placeholder="Entrez le libellé de l'article"
                                            required
                                            className="form-control-lg shadow-sm"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            <FaExclamationTriangle className="me-1" /> Un libellé est requis.
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted mt-2">
                                            <FaFileAlt className="me-2" /> Le libellé sera affiché comme titre de l'article dans le contrat.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                  <Col xs={12}>
                                    <Form.Group className="mb-4" controlId="formContratTravail">
                                        <Form.Label className="fw-bold d-flex align-items-center">
                                            <Badge bg="primary" className="me-2" pill>2</Badge>
                                            Contrat de travail <span className="text-danger ms-1">*</span>
                                        </Form.Label>                                        <div className="position-relative">
                                            {contratsLoading ? (
                                                <div className="p-2">
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Chargement des contrats...
                                                </div>
                                            ) : contrats.length === 0 ? (
                                                <div className="border rounded p-3 bg-light">
                                                    <p className="mb-2 text-danger">Aucun contrat de travail disponible</p>
                                                    <Button 
                                                        as={Link} 
                                                        to="/contrats-de-travail/create" 
                                                        variant="outline-primary"
                                                        size="sm"
                                                    >
                                                        <FaPlus className="me-2" />Créer un contrat de travail
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Form.Select
                                                    name="contratDeTravailId"
                                                    value={form.contratDeTravailId}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={isEdit}
                                                    className="form-control-lg shadow-sm"
                                                >
                                                    <option value="">Sélectionnez un contrat de travail</option>
                                                    {contrats.map(contrat => (
                                                        <option key={contrat.id} value={contrat.id}>
                                                            {contrat.referenceContrat} - {contrat.typeContrat} 
                                                            {contrat.dateDebut ? ` (début: ${contrat.dateDebut.slice(0, 10)})` : ''}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            )}
                                        </div>
                                        <Form.Control.Feedback type="invalid">
                                            <FaExclamationTriangle className="me-1" /> Veuillez sélectionner un contrat de travail.
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted mt-2">
                                            <FaLink className="me-2" /> L'article sera associé à ce contrat de travail.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                
                                <Col xs={12}>
                                    <Form.Group className="mb-4" controlId="formContenu">
                                        <Form.Label className="fw-bold d-flex align-items-center">
                                            <Badge bg="primary" className="me-2" pill>3</Badge>
                                            Contenu
                                        </Form.Label>
                                        <div className="content-editor-wrapper position-relative">
                                            <Form.Control
                                                as="textarea"
                                                name="contenu"
                                                value={form.contenu}
                                                onChange={handleChange}
                                                placeholder="Entrez le contenu détaillé de l'article"
                                                rows={10}
                                                className="form-control-lg content-editor"
                                            />
                                        </div>
                                        <Form.Text className="text-muted mt-2">
                                            <FaFileContract className="me-2" /> Le contenu détaillé de l'article qui apparaîtra dans le contrat de travail.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            <div className="d-flex justify-content-between mt-4">
                                <Button 
                                    variant="outline-secondary" 
                                    as={Link} 
                                    to="/article-contrat-travail"
                                    className="btn-lg"
                                >
                                    <FaTimes className="me-2" /> Annuler
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    className="btn-lg px-5"
                                    disabled={loading || success}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="me-2 fa-spin" /> Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="me-2" /> {isEdit ? "Enregistrer" : "Créer"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}
