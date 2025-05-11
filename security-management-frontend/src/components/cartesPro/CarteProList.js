import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    Container, Row, Col, Card, Table, Button, Badge, 
    Form, InputGroup, Spinner, Alert, OverlayTrigger,
    Tooltip, Dropdown, Modal
} from "react-bootstrap";
import {
    FaIdCard, FaPlus, FaSearch, FaFilter, FaSync,
    FaUserShield, FaCalendarAlt, FaInfoCircle, FaPencilAlt,
    FaTrashAlt, FaExclamationTriangle, FaCheck, FaTimes,
    FaExclamationCircle
} from "react-icons/fa";

// Services
import CarteProService from "../../services/CarteProService";
import AgentService from "../../services/AgentService";

const CarteProList = () => {
    // États principaux
    const [list, setList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [agents, setAgents] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [validiteFilter, setValiditeFilter] = useState("all");
    
    // État pour modal de confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [carteToDelete, setCarteToDelete] = useState(null);
    
    // État pour notification
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ message: "", variant: "success" });
    
    // Types de cartes disponibles (extraits de l'enum TypeCarteProfessionnelle)
    const typeOptions = [
        "CQP_APS", 
        "GARDE_DU_CORPS", 
        "SECURITE_EVENEMENTIELLE", 
        "SURVEILLANCE_TECHNIQUE", 
        "RONDIER", 
        "CONTROLEUR_ACCES", 
        "AGENT_SURVEILLANCE_VIDEO"
    ];

    // Fonction pour charger les données
    const loadData = () => {
        setLoading(true);
        setError(null);
        
        // Récupérer toutes les cartes professionnelles et les agents
        Promise.all([
            CarteProService.getAll(),
            AgentService.getAllAgents()
        ])
            .then(([cartesRes, agentsRes]) => {
                const cartesData = cartesRes.data;
                setList(cartesData);
                setFilteredList(cartesData);
                
                // Créer un dictionnaire d'agents pour un accès facile par ID
                const agentsMap = {};
                agentsRes.data.forEach(agent => {
                    agentsMap[agent.id] = agent;
                });
                setAgents(agentsMap);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement:", err);
                setError("Impossible de charger les données.");
                setLoading(false);
            });
    };

    // Charger les données au montage du composant
    useEffect(() => {
        loadData();
    }, []);

    // Appliquer les filtres lorsque les filtres changent
    useEffect(() => {
        applyFilters();
    }, [searchTerm, typeFilter, validiteFilter, list]);

    // Fonction pour afficher une notification temporaire
    const showTemporaryNotification = (message, variant = "success") => {
        setNotification({ message, variant });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
    };

    // Fonction pour vérifier la validité d'une carte
    const checkValidite = (dateDebut, dateFin) => {
        const now = new Date();
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        
        if (now < debut) {
            return { status: "future", label: "À venir", variant: "info" };
        } else if (now > fin) {
            return { status: "expired", label: "Expirée", variant: "danger" };
        } else {
            // Si la date d'expiration est dans moins de 30 jours
            const daysToExpire = Math.ceil((fin - now) / (1000 * 60 * 60 * 24));
            if (daysToExpire <= 30) {
                return { status: "warning", label: `Expire dans ${daysToExpire} jour(s)`, variant: "warning" };
            }
            return { status: "valid", label: "Valide", variant: "success" };
        }
    };

    // Fonction pour formater la date
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Fonction pour appliquer les filtres
    const applyFilters = () => {
        let result = [...list];
        
        // Filtre par type de carte
        if (typeFilter) {
            result = result.filter(carte => carte.typeCarte === typeFilter);
        }
        
        // Filtre par validité
        if (validiteFilter !== "all") {
            result = result.filter(carte => {
                const validiteInfo = checkValidite(carte.dateDebut, carte.dateFin);
                switch (validiteFilter) {
                    case "valid": return validiteInfo.status === "valid";
                    case "warning": return validiteInfo.status === "warning";
                    case "expired": return validiteInfo.status === "expired";
                    case "future": return validiteInfo.status === "future";
                    default: return true;
                }
            });
        }
        
        // Filtre par terme de recherche (nom d'agent ou numéro de carte)
        if (searchTerm.trim() !== "") {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(carte => {
                const agent = agents[carte.agentId];
                const agentName = agent ? `${agent.nom} ${agent.prenom}`.toLowerCase() : "";
                const numeroLower = carte.numeroCarte ? carte.numeroCarte.toLowerCase() : "";
                
                return agentName.includes(searchTermLower) || numeroLower.includes(searchTermLower);
            });
        }
        
        setFilteredList(result);
    };

    // Fonction pour obtenir les détails d'un agent par son ID
    const getAgentInfo = (agentId) => {
        if (!agentId) return "Non assigné";
        const agent = agents[agentId];
        return agent ? `${agent.nom} ${agent.prenom}` : `Agent #${agentId}`;
    };

    // Fonction pour demander la confirmation de suppression
    const confirmDelete = (carte) => {
        setCarteToDelete(carte);
        setShowDeleteModal(true);
    };

    // Fonction pour supprimer après confirmation
    const handleDelete = () => {
        if (!carteToDelete) return;
        
        CarteProService.delete(carteToDelete.id)
            .then(() => {
                // Mise à jour des listes après suppression
                const updatedList = list.filter(carte => carte.id !== carteToDelete.id);
                setList(updatedList);
                applyFilters();
                
                // Notification de succès
                showTemporaryNotification(`La carte ${carteToDelete.numeroCarte} a été supprimée avec succès.`, "success");
                setShowDeleteModal(false);
            })
            .catch(err => {
                console.error("Erreur lors de la suppression:", err);
                showTemporaryNotification("Erreur lors de la suppression de la carte professionnelle", "danger");
                setShowDeleteModal(false);
            });
    };

    // Fonction pour réinitialiser les filtres
    const resetFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setValiditeFilter("all");
    };

    // Helper pour les tooltips
    const renderTooltip = (text) => (
        <Tooltip id="button-tooltip">
            {text}
        </Tooltip>
    );

    // Fonction pour obtenir une description du type de carte
    const getTypeDescription = (type) => {
        if (!type) return "";
        return type.replace(/_/g, " ");
    };

    return (
        <Container fluid className="py-4">
            {/* Notification temporaire */}
            {showNotification && (
                <Alert 
                    variant={notification.variant} 
                    className="position-fixed top-0 end-0 m-4 shadow-sm alert-dismissible fade show" 
                    style={{ zIndex: 1050, maxWidth: '300px', animation: 'fadeIn 0.5s' }}
                    onClose={() => setShowNotification(false)}
                    dismissible
                >
                    <div className="d-flex align-items-center">
                        {notification.variant === 'success' && <FaCheck className="me-2" />}
                        {notification.variant === 'danger' && <FaExclamationTriangle className="me-2" />}
                        {notification.variant === 'info' && <FaInfoCircle className="me-2" />}
                        {notification.message}
                    </div>
                </Alert>
            )}

            <Card className="shadow-sm border-0 rounded-lg">
                <Card.Header className="bg-gradient bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                <FaIdCard className="me-2" /> Gestion des cartes professionnelles
                            </h5>
                        </Col>
                        <Col xs="auto">
                            <Link 
                                to="/cartes-professionnelles/create" 
                                className="btn btn-warning fw-bold shadow-sm text-dark" 
                                style={{ 
                                    fontSize: '0.95rem', 
                                    transition: 'all 0.3s ease',
                                    border: '2px solid #f8f9fa'
                                }}
                            >
                                <FaPlus className="me-1" /> Nouvelle carte
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body className="p-0">
                    <div className="p-4">
                        {error && (
                            <Alert variant="danger" className="mb-4 d-flex align-items-center">
                                <FaExclamationTriangle className="me-2" />
                                {error}
                            </Alert>
                        )}

                        {/* Barre de recherche et filtres */}
                        <Row className="mb-4 g-3 align-items-end">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary mb-1">Recherche</Form.Label>
                                    <InputGroup className="shadow-sm">
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FaSearch className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Rechercher par agent ou numéro..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary mb-1">Type de carte</Form.Label>
                                    <InputGroup className="shadow-sm">
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FaIdCard className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Select
                                            value={typeFilter}
                                            onChange={e => setTypeFilter(e.target.value)}
                                            className="border-start-0"
                                        >
                                            <option value="">Tous les types</option>
                                            {typeOptions.map(type => (
                                                <option key={type} value={type}>
                                                    {type.replace(/_/g, ' ')}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary mb-1">Validité</Form.Label>
                                    <InputGroup className="shadow-sm">
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FaCalendarAlt className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Select
                                            value={validiteFilter}
                                            onChange={e => setValiditeFilter(e.target.value)}
                                            className="border-start-0"
                                        >
                                            <option value="all">Toutes les cartes</option>
                                            <option value="valid">Cartes valides</option>
                                            <option value="warning">Expirent bientôt</option>
                                            <option value="expired">Cartes expirées</option>
                                            <option value="future">À venir</option>
                                        </Form.Select>
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            <Col md={2} className="d-flex gap-2 justify-content-md-end">
                                <Button
                                    variant="outline-secondary"
                                    onClick={resetFilters}
                                    className="d-flex align-items-center shadow-sm"
                                >
                                    <FaTimes className="me-1" /> Réinitialiser
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    onClick={loadData}
                                    className="d-flex align-items-center shadow-sm"
                                >
                                    <FaSync className="me-1" /> Actualiser
                                </Button>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between mb-3 align-items-center">
                            <Badge bg="info" className="fs-6 py-2 px-3">
                                {filteredList.length === list.length ? (
                                    <>Affichage de toutes les cartes ({list.length})</>
                                ) : (
                                    <>Affichage de {filteredList.length} sur {list.length} cartes</>
                                )}                            </Badge>
                            <div className="d-flex gap-2 small">
                                <Badge bg="success" className="d-flex align-items-center">
                                    <FaCheck className="me-1" /> Valide
                                </Badge>
                                <Badge bg="warning" className="d-flex align-items-center text-dark">
                                    <FaExclamationCircle className="me-1" /> Expire bientôt
                                </Badge>
                                <Badge bg="danger" className="d-flex align-items-center">
                                    <FaTimes className="me-1" /> Expirée
                                </Badge>
                                <Badge bg="info" className="d-flex align-items-center">
                                    <FaCalendarAlt className="me-1" /> À venir
                                </Badge>
                            </div>
                        </div>

                        {/* Contenu principal selon l'état */}
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Chargement des cartes professionnelles...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle border shadow-sm bg-white">
                                    <thead>
                                        <tr className="bg-light">
                                            <th>Agent</th>
                                            <th>Type de carte</th>
                                            <th>Numéro</th>
                                            <th>Dates de validité</th>
                                            <th>Statut</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">
                                                    <FaExclamationTriangle className="me-2" />
                                                    {list.length === 0 ? (
                                                        "Aucune carte trouvée. Créez votre première carte professionnelle !"
                                                    ) : (
                                                        "Aucune carte ne correspond à vos critères de recherche."
                                                    )}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredList.map(carte => {
                                                const validiteInfo = checkValidite(carte.dateDebut, carte.dateFin);
                                                
                                                return (
                                                    <tr key={carte.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div 
                                                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                                                    style={{ width: '40px', height: '40px' }}
                                                                >
                                                                    <FaUserShield />
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold">{getAgentInfo(carte.agentId)}</div>
                                                                    {agents[carte.agentId]?.email && (
                                                                        <div className="small text-muted">{agents[carte.agentId]?.email}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg="light" text="dark" className="px-3 py-2 fs-6">
                                                                {getTypeDescription(carte.typeCarte)}
                                                            </Badge>
                                                        </td>
                                                        <td className="fw-bold">
                                                            {carte.numeroCarte}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-1">
                                                                <div className="d-flex align-items-center">
                                                                    <FaCalendarAlt className="text-success me-1" /> <span>Début: {formatDate(carte.dateDebut)}</span>
                                                                </div>
                                                                <div className="d-flex align-items-center">
                                                                    <FaCalendarAlt className="text-danger me-1" /> <span>Fin: {formatDate(carte.dateFin)}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg={validiteInfo.variant} className="px-3 py-2 d-flex align-items-center" style={{ width: 'fit-content' }}>
                                                                {validiteInfo.status === "valid" && <FaCheck className="me-1" />}
                                                                {validiteInfo.status === "warning" && <FaExclamationCircle className="me-1" />}
                                                                {validiteInfo.status === "expired" && <FaTimes className="me-1" />}
                                                                {validiteInfo.status === "future" && <FaCalendarAlt className="me-1" />}
                                                                {validiteInfo.label}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <OverlayTrigger
                                                                    placement="top"
                                                                    overlay={renderTooltip("Voir les détails")}
                                                                >
                                                                    <Link to={`/cartes-professionnelles/${carte.id}`} className="btn btn-sm btn-outline-info shadow-sm">
                                                                        <FaInfoCircle />
                                                                    </Link>
                                                                </OverlayTrigger>
                                                                
                                                                <OverlayTrigger
                                                                    placement="top"
                                                                    overlay={renderTooltip("Modifier")}
                                                                >
                                                                    <Link to={`/cartes-professionnelles/edit/${carte.id}`} className="btn btn-sm btn-outline-primary shadow-sm">
                                                                        <FaPencilAlt />
                                                                    </Link>
                                                                </OverlayTrigger>
                                                                
                                                                <OverlayTrigger
                                                                    placement="top"
                                                                    overlay={renderTooltip("Supprimer")}
                                                                >
                                                                    <Button 
                                                                        variant="outline-danger" 
                                                                        size="sm"
                                                                        onClick={() => confirmDelete(carte)}
                                                                        className="shadow-sm"
                                                                    >
                                                                        <FaTrashAlt />
                                                                    </Button>
                                                                </OverlayTrigger>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>
            
            {/* Modal de confirmation pour la suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Êtes-vous sûr de vouloir supprimer la carte professionnelle <strong>{carteToDelete?.numeroCarte}</strong>?</p>
                    <p>Cette action ne peut pas être annulée.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        <FaTrashAlt className="me-1" /> Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* CSS pour les animations et styles spécifiques */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .hover-shadow:hover {
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
                    transform: translateY(-2px);
                }
                
                .transition-all {
                    transition: all 0.3s ease;
                }
                
                .badge {
                    font-weight: 500;
                }
                
                th {
                    font-weight: 600;
                    white-space: nowrap;
                }
                
                tr:hover {
                    background-color: rgba(0, 123, 255, 0.03);
                }
                
                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .btn:active {
                    transform: translateY(0);
                }
                
                .table {
                    border-collapse: separate;
                    border-spacing: 0;
                }
                
                .table td:first-child, .table th:first-child {
                    border-left: 1px solid #dee2e6;
                }
                
                .table td:last-child, .table th:last-child {
                    border-right: 1px solid #dee2e6;
                }
                
                .table tr:last-child td {
                    border-bottom: 1px solid #dee2e6;
                }
                
                .table thead th, .table tbody td {
                    border-right: 1px solid #dee2e6;
                }
            `}</style>
        </Container>
    );
};

export default CarteProList;
