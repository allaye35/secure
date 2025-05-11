// src/components/articleContratTravails/ArticleContratTravailForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { FaSave, FaTimes, FaArrowLeft, FaFileContract, FaPaperPlane, FaSpinner, FaCheckCircle } from "react-icons/fa";
import "../../styles/ArticleContratTravailForm.css";

export default function ArticleContratTravailForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);    const [form, setForm] = useState({ libelle: "", contenu: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            ArticleContratTravailService.getById(id)
                .then(res => {
                    console.log("Article récupéré:", res.data);
                    setForm({
                        libelle: res.data.libelle,
                        contenu: res.data.contenu,
                        contratDeTravailId: res.data.contratDeTravailId
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
            
            if (isEdit) {
                // Force la recréation de l'objet pour s'assurer que toutes les propriétés sont envoyées
                const updateData = {
                    libelle: articleData.libelle,
                    contenu: articleData.contenu,
                    contratDeTravailId: articleData.contratDeTravailId
                };
                
                const response = await ArticleContratTravailService.update(id, updateData);
                setSuccess(true);
                
                // Redirection après un court délai pour montrer le message de succès
                setTimeout(() => {
                    navigate("/article-contrat-travail", { 
                        state: { message: "Article modifié avec succès!" }
                    });
                }, 1500);
            } else {
                await ArticleContratTravailService.create(articleData);
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
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row>
                                <Col xs={12}>
                                    <Form.Group className="mb-4" controlId="formLibelle">
                                        <Form.Label className="fw-bold">Libellé <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="libelle"
                                            value={form.libelle}
                                            onChange={handleChange}
                                            placeholder="Entrez le libellé de l'article"
                                            required
                                            className="form-control-lg"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Un libellé est requis.
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Le libellé sera affiché comme titre de l'article dans le contrat.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                
                                <Col xs={12}>
                                    <Form.Group className="mb-4" controlId="formContenu">
                                        <Form.Label className="fw-bold">Contenu</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="contenu"
                                            value={form.contenu}
                                            onChange={handleChange}
                                            placeholder="Entrez le contenu détaillé de l'article"
                                            rows={10}
                                            className="form-control-lg content-editor"
                                        />
                                        <Form.Text className="text-muted">
                                            Le contenu détaillé de l'article qui apparaîtra dans le contrat de travail.
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
