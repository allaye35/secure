import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PointageService from "../../services/PointageService";
import { 
    Container, Row, Col, Card, Table, Button, Badge, 
    Spinner, Alert, Form, InputGroup, OverlayTrigger, 
    Tooltip, Nav
} from "react-bootstrap";
import { 
    FaUserClock, FaPlus, FaSearch, FaFilter, FaEye, 
    FaPencilAlt, FaTrashAlt, FaExclamationTriangle,
    FaCalendarAlt, FaCheck, FaTimes, FaClock, FaMapMarkerAlt
} from "react-icons/fa";

export default function PointageList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ message: "", variant: "success" });
    const navigate = useNavigate();

    // Chargement des données
    const loadData = () => {
        setLoading(true);
        PointageService.getAll()
            .then(({ data }) => {
                setItems(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Erreur de chargement des pointages");
                setLoading(false);
                // Afficher une notification d'erreur
                showTemporaryNotification('Erreur lors du chargement des données', 'danger');
            });
    };

    useEffect(() => {
        loadData();
    }, []);

    // Fonction pour afficher une notification temporaire
    const showTemporaryNotification = (message, variant = 'success') => {
        setNotification({ message, variant });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
    };

    // Fonction de suppression
    const handleDelete = (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce pointage ?")) return;
        
        PointageService.delete(id)
            .then(() => {
                setItems(prev => prev.filter(x => x.id !== id));
                showTemporaryNotification("Pointage supprimé avec succès", "success");
            })
            .catch(() => showTemporaryNotification("Échec de la suppression", "danger"));
    };

    // Filtrage des pointages
    const filteredItems = items.filter(p => {
        const searchString = `${p.id} ${new Date(p.datePointage).toLocaleString()} ${p.mission?.id || ""}`
            .toLowerCase();
        return searchTerm === '' || searchString.includes(searchTerm.toLowerCase());
    });

    // Rendu du tooltip
    const renderTooltip = (text) => (
        <Tooltip id="button-tooltip">
            {text}
        </Tooltip>
    );

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
                        {notification.message}
                    </div>
                </Alert>
            )}
            
            <Card className="shadow-sm border-0 rounded-lg">
                <Card.Header className="bg-gradient bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                <FaUserClock className="me-2" /> Gestion des pointages
                            </h5>
                        </Col>
                        <Col xs="auto">
                            <Link 
                                to="/pointages/create" 
                                className="btn btn-warning fw-bold shadow-sm text-dark" 
                                style={{ 
                                    fontSize: '0.95rem', 
                                    transition: 'all 0.3s ease',
                                    border: '2px solid #f8f9fa'
                                }}
                            >
                                <FaPlus className="me-1" /> Nouveau pointage
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
                        <Row className="mb-4 align-items-center">
                            <Col md={6}>
                                <div className="shadow-sm rounded">
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FaSearch className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Rechercher un pointage..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </div>
                            </Col>
                            <Col md={6} className="d-flex gap-2 justify-content-md-end align-items-center">
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={loadData} 
                                    title="Actualiser les données"
                                    className="shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '38px', height: '38px' }}
                                >
                                    <FaFilter />
                                </Button>
                                
                                <Badge 
                                    bg="info" 
                                    className="d-flex align-items-center px-3 shadow-sm"
                                    style={{ height: '38px', fontSize: '0.95rem' }}
                                >
                                    {filteredItems.length} pointage{filteredItems.length > 1 ? 's' : ''}
                                </Badge>
                            </Col>
                        </Row>

                        {/* Contenu principal */}
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Chargement des pointages...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle border shadow-sm bg-white">
                                    <thead>
                                        <tr className="bg-light">
                                            <th className="text-center" style={{borderBottom: '2px solid #dee2e6'}}>
                                                <div className="d-flex align-items-center p-2">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                        <FaUserClock className="text-primary" size={14} />
                                                    </div>
                                                    <span>ID</span>
                                                </div>
                                            </th>
                                            <th style={{borderBottom: '2px solid #dee2e6'}}>
                                                <div className="d-flex align-items-center p-2">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                        <FaCalendarAlt className="text-primary" size={14} />
                                                    </div>
                                                    <span>Date & Heure</span>
                                                </div>
                                            </th>
                                            <th style={{borderBottom: '2px solid #dee2e6'}}>
                                                <div className="d-flex align-items-center p-2">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                        <FaCheck className="text-primary" size={14} />
                                                    </div>
                                                    <span>Statut</span>
                                                </div>
                                            </th>
                                            <th style={{borderBottom: '2px solid #dee2e6'}}>
                                                <div className="d-flex align-items-center p-2">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                        <FaMapMarkerAlt className="text-primary" size={14} />
                                                    </div>
                                                    <span>Position</span>
                                                </div>
                                            </th>
                                            <th style={{borderBottom: '2px solid #dee2e6'}}>
                                                <div className="d-flex align-items-center p-2">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                        <FaUserClock className="text-primary" size={14} />
                                                    </div>
                                                    <span>Mission</span>
                                                </div>
                                            </th>
                                            <th className="text-center" style={{borderBottom: '2px solid #dee2e6'}}>
                                                <div className="p-2">Actions</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">
                                                    <FaExclamationTriangle className="me-2" />
                                                    Aucun pointage trouvé
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredItems.map(p => (
                                                <tr key={p.id} className={p.index % 2 === 0 ? 'bg-light bg-opacity-50' : ''}>
                                                    <td className="text-center fw-bold">{p.id}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <Badge bg="light" text="dark" className="me-2 p-2">
                                                                <FaCalendarAlt className="me-1" />
                                                            </Badge>
                                                            <div>
                                                                {new Date(p.datePointage).toLocaleDateString()} 
                                                                <div className="small text-muted">
                                                                    {new Date(p.datePointage).toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column gap-1">
                                                            <Badge 
                                                                bg={p.estPresent ? 'success' : 'danger'} 
                                                                className="d-inline-flex align-items-center"
                                                                style={{ width: 'fit-content' }}
                                                            >
                                                                {p.estPresent ? (
                                                                    <><FaCheck className="me-1" /> Présent</>
                                                                ) : (
                                                                    <><FaTimes className="me-1" /> Absent</>
                                                                )}
                                                            </Badge>
                                                            
                                                            {p.estRetard && (
                                                                <Badge 
                                                                    bg="warning" 
                                                                    text="dark"
                                                                    className="d-inline-flex align-items-center"
                                                                    style={{ width: 'fit-content' }}
                                                                >
                                                                    <FaClock className="me-1" /> En retard
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <Badge bg="light" text="dark" className="me-2 p-2">
                                                                <FaMapMarkerAlt className="text-danger" />
                                                            </Badge>
                                                            <div>
                                                                <span className="fw-bold">Lat:</span> {p.positionActuelle?.latitude?.toFixed(5) ?? "-"} 
                                                                <br />
                                                                <span className="fw-bold">Long:</span> {p.positionActuelle?.longitude?.toFixed(5) ?? "-"}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge 
                                                            bg="primary" 
                                                            className="d-inline-flex align-items-center px-3 py-2"
                                                            style={{ width: 'fit-content' }}
                                                        >
                                                            <FaUserClock className="me-1" /> Mission #{p.mission?.id ?? "-"}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={renderTooltip("Voir les détails")}
                                                            >
                                                                <Link 
                                                                    to={`/pointages/${p.id}`} 
                                                                    className="btn btn-sm btn-outline-info shadow-sm"
                                                                >
                                                                    <FaEye />
                                                                </Link>
                                                            </OverlayTrigger>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={renderTooltip("Modifier")}
                                                            >
                                                                <Link 
                                                                    to={`/pointages/edit/${p.id}`} 
                                                                    className="btn btn-sm btn-outline-primary shadow-sm"
                                                                >
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
                                                                    className="shadow-sm"
                                                                    onClick={() => handleDelete(p.id)}
                                                                >
                                                                    <FaTrashAlt />
                                                                </Button>
                                                            </OverlayTrigger>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

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

                @media print {
                    .btn, .nav, .card-header, .form-control, .input-group {
                        display: none !important;
                    }
                }
            `}</style>
        </Container>
    );
}