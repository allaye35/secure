// src/components/articles/ArticleForm.js
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, faTimes, faFileContract, faSearch, 
    faListUl, faFileAlt, faLink, faExclamationCircle 
} from '@fortawesome/free-solid-svg-icons';
import ContratService from "../../services/ContratService";
import "../../styles/ArticleDetail.css";
import "../../styles/ArticleForm.css";

export default function ArticleForm({ onSubmit, initialData = {}, loading = false }) {
    // État du formulaire
    const [formData, setFormData] = useState({
        numero: '',
        titre: '',
        contenu: '',
        contratId: '',
        notes: '',
        ...initialData
    });
    
    // Mettre à jour l'état du formulaire quand initialData change
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            console.log("Mise à jour du formulaire avec les données initiales:", initialData);
            setFormData(prevFormData => ({
                ...prevFormData,
                ...initialData
            }));
        }
    }, [initialData]);
    
    // État pour la recherche et la sélection de contrat
    const [contrats, setContrats] = useState([]);
    const [loadingContrats, setLoadingContrats] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [showContratSelector, setShowContratSelector] = useState(false);
    const [contratError, setContratError] = useState(null);
    
    // Charger les informations du contrat sélectionné si un ID est fourni
    useEffect(() => {
        if (formData.contratId) {
            setLoadingContrats(true);
            console.log("Chargement du contrat associé:", formData.contratId);
            ContratService.getById(formData.contratId)
                .then(res => {
                    console.log("Contrat chargé:", res.data);
                    setSelectedContrat(res.data);
                })
                .catch(err => {
                    console.error("Erreur lors du chargement du contrat:", err);
                    setContratError("Impossible de charger les détails du contrat associé");
                })
                .finally(() => {
                    setLoadingContrats(false);
                });
        }
    }, [formData.contratId]);
    
    // S'assurer que le contrat est chargé lors de l'initialisation quand un contratId est présent
    useEffect(() => {
        if (initialData && initialData.contratId && !selectedContrat) {
            ContratService.getById(initialData.contratId)
                .then(res => {
                    setSelectedContrat(res.data);
                })
                .catch(err => {
                    console.error("Erreur lors du chargement du contrat initial:", err);
                });
        }
    }, [initialData, selectedContrat]);
    
    // Charger la liste des contrats pour la recherche
    useEffect(() => {
        if (showContratSelector) {
            setLoadingContrats(true);
            ContratService.getAll()
                .then(res => {
                    setContrats(res.data);
                    setSearchResults(res.data);
                })
                .catch(err => {
                    console.error("Erreur lors du chargement des contrats:", err);
                    setContratError("Impossible de charger la liste des contrats");
                })
                .finally(() => {
                    setLoadingContrats(false);
                });
        }
    }, [showContratSelector]);
    
    // Filtrer les résultats de recherche lorsque le terme de recherche change
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults(contrats);
        } else {
            const term = searchTerm.toLowerCase();
            setSearchResults(contrats.filter(c => 
                (c.referenceContrat?.toLowerCase().includes(term)) ||
                (c.client?.nom?.toLowerCase().includes(term)) ||
                (c.id.toString().includes(term))
            ));
        }
    }, [searchTerm, contrats]);
    
    // Gérer les changements de champ
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    // Gérer la sélection d'un contrat
    const handleSelectContrat = (contrat) => {
        setSelectedContrat(contrat);
        setFormData({ ...formData, contratId: contrat.id });
        setShowContratSelector(false);
        setSearchTerm('');
    };
    
    // Gérer la suppression du contrat associé
    const handleRemoveContrat = () => {
        setSelectedContrat(null);
        setFormData({ ...formData, contratId: '' });
    };
    
    // Gérer la soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    return (
        <div className="article-form-container">
            <Form onSubmit={handleSubmit}>
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-primary text-white">
                        <h4 className="mb-0">
                            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                            Informations de l'article
                        </h4>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="numero">
                                    <Form.Label>Numéro d'article</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="numero"
                                        placeholder="Exemple: A-001"
                                        value={formData.numero}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Un identifiant unique pour cet article
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group controlId="titre">
                                    <Form.Label>Titre de l'article</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="titre"
                                        placeholder="Titre de l'article"
                                        value={formData.titre}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4" controlId="contenu">
                            <Form.Label>Contenu de l'article</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="contenu"
                                rows={6}
                                placeholder="Texte complet de l'article..."
                                value={formData.contenu}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3" controlId="notes">
                            <Form.Label>Notes / Commentaires</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="notes"
                                rows={2}
                                placeholder="Notes internes sur cet article..."
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>

                <Card className="mb-4 shadow-sm">
                    <Card.Header className={`${selectedContrat ? 'bg-success' : 'bg-light'} ${selectedContrat ? 'text-white' : ''}`}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">
                                <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                {selectedContrat ? 'Contrat associé' : 'Associer un contrat'}
                            </h4>
                            {!selectedContrat && !showContratSelector && (
                                <Button 
                                    variant="primary" 
                                    size="sm"
                                    onClick={() => setShowContratSelector(true)}
                                >
                                    <FontAwesomeIcon icon={faSearch} className="me-1" /> 
                                    Rechercher un contrat
                                </Button>
                            )}
                        </div>
                    </Card.Header>
                    <Card.Body>
                        {contratError && (
                            <Alert variant="danger">
                                <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                                {contratError}
                            </Alert>
                        )}
                        
                        {loadingContrats ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2">Chargement des contrats...</p>
                            </div>
                        ) : showContratSelector ? (
                            <div className="contrat-selector">
                                <div className="mb-3">
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <FontAwesomeIcon icon={faSearch} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher par référence, client..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                        <Button 
                                            variant="outline-secondary"
                                            onClick={() => {
                                                setShowContratSelector(false);
                                                setSearchTerm('');
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </Button>
                                    </InputGroup>
                                </div>
                                
                                <div className="contrat-search-results">
                                    {searchResults.length === 0 ? (
                                        <Alert variant="info">
                                            Aucun contrat ne correspond à votre recherche
                                        </Alert>
                                    ) : (
                                        <div className="contrat-results-list">
                                            <div className="contrat-results-header">
                                                <Row>
                                                    <Col md={2} className="fw-bold">ID</Col>
                                                    <Col md={3} className="fw-bold">Référence</Col>
                                                    <Col md={3} className="fw-bold">Client</Col>
                                                    <Col md={2} className="fw-bold">Date</Col>
                                                    <Col md={2} className="fw-bold">Actions</Col>
                                                </Row>
                                            </div>
                                            {searchResults.map(contrat => (
                                                <div key={contrat.id} className="contrat-result-item">
                                                    <Row>
                                                        <Col md={2}>{contrat.id}</Col>
                                                        <Col md={3}>{contrat.referenceContrat || "—"}</Col>
                                                        <Col md={3}>{contrat.client?.nom || "—"}</Col>
                                                        <Col md={2}>
                                                            {contrat.dateSignature ? 
                                                                new Date(contrat.dateSignature).toLocaleDateString() : 
                                                                "—"
                                                            }
                                                        </Col>
                                                        <Col md={2}>
                                                            <Button 
                                                                variant="primary" 
                                                                size="sm"
                                                                onClick={() => handleSelectContrat(contrat)}
                                                            >
                                                                <FontAwesomeIcon icon={faLink} className="me-1" /> 
                                                                Sélectionner
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="text-center mt-3">
                                    <Button 
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setShowContratSelector(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="me-1" /> 
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        ) : selectedContrat ? (
                            <div className="selected-contrat-info">
                                <Row>
                                    <Col md={8}>
                                        <h5 className="mb-3">
                                            {selectedContrat.referenceContrat || `Contrat #${selectedContrat.id}`}
                                        </h5>
                                        
                                        <div className="contrat-details">
                                            <div className="contrat-detail-item">
                                                <span className="detail-label">Client:</span>
                                                <span className="detail-value">{selectedContrat.client?.nom || "—"}</span>
                                            </div>
                                            
                                            <div className="contrat-detail-item">
                                                <span className="detail-label">Date de signature:</span>
                                                <span className="detail-value">
                                                    {selectedContrat.dateSignature ? 
                                                        new Date(selectedContrat.dateSignature).toLocaleDateString('fr-FR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) : 
                                                        "Non spécifié"
                                                    }
                                                </span>
                                            </div>
                                            
                                            {selectedContrat.dureeMois && (
                                                <div className="contrat-detail-item">
                                                    <span className="detail-label">Durée:</span>
                                                    <span className="detail-value">{selectedContrat.dureeMois} mois</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <input 
                                            type="hidden" 
                                            name="contratId" 
                                            value={selectedContrat.id} 
                                        />
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <Button 
                                            variant="outline-danger" 
                                            onClick={handleRemoveContrat}
                                            className="mt-2"
                                            size="sm"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="me-1" /> 
                                            Dissocier
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        ) : (
                            <div className="no-contrat-info text-center py-4">
                                <div className="mb-3">
                                    <FontAwesomeIcon icon={faFileContract} size="3x" className="text-muted" />
                                </div>
                                <p className="mb-3">
                                    Aucun contrat n'est associé à cet article pour le moment
                                </p>
                                <Button 
                                    variant="primary"
                                    onClick={() => setShowContratSelector(true)}
                                >
                                    <FontAwesomeIcon icon={faSearch} className="me-1" /> 
                                    Rechercher un contrat
                                </Button>
                            </div>
                        )}
                    </Card.Body>
                </Card>
                
                <div className="d-flex justify-content-between">
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => window.history.back()}
                    >
                        <FontAwesomeIcon icon={faTimes} className="me-2" /> 
                        Annuler
                    </Button>
                    
                    <Button 
                        type="submit" 
                        variant="success" 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
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
        </div>
    );
}
