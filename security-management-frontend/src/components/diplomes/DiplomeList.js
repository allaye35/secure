import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    Container, Row, Col, Card, Table, Form, InputGroup,
    Button, Badge, Spinner, Alert, OverlayTrigger,
    Tooltip, Dropdown
} from "react-bootstrap";
import {
    FaGraduationCap, FaSearch, FaFilter, FaUser,
    FaCalendarAlt, FaEye, FaPencilAlt, FaTrashAlt,
    FaPlus, FaExclamationTriangle, FaCheck, FaClock
} from "react-icons/fa";
import DiplomeService from "../../services/DiplomeService";
import AgentService from "../../services/AgentService";

const DiplomeList = () => {
    const [list, setList] = useState([]);
    const [agents, setAgents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour le filtrage
    const [searchTerm, setSearchTerm] = useState("");
    const [filterNiveau, setFilterNiveau] = useState("");
    const [filterDateType, setFilterDateType] = useState("all");
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Charger tous les diplômes
                const diplomesRes = await DiplomeService.getAll();
                const diplomes = diplomesRes.data;
                setList(diplomes);
                
                // Extraire les IDs uniques des agents pour éviter les doublons
                const agentIds = [...new Set(diplomes.map(diplome => diplome.agentId))];
                
                // Récupérer les informations pour chaque agent
                const agentsData = {};
                for (const agentId of agentIds) {
                    try {
                        const agentRes = await AgentService.getAgentById(agentId);
                        agentsData[agentId] = agentRes.data;
                    } catch (err) {
                        console.error(`Erreur lors du chargement de l'agent ${agentId}:`, err);
                        agentsData[agentId] = { nom: "Inconnu", prenom: "", email: "Agent non trouvé" };
                    }
                }
                
                setAgents(agentsData);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des diplômes:", err);
                setError("Impossible de charger les diplômes.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Fonction pour afficher les informations de l'agent
    const renderAgentInfo = (agentId) => {
        const agent = agents[agentId];
        if (!agent) return `Agent #${agentId}`;
        
        return (
            <div className="d-flex align-items-center">
                <div className="avatar-circle bg-primary me-2">
                    {agent.prenom?.charAt(0) || ""}{agent.nom?.charAt(0) || ""}
                </div>
                <div>
                    <div className="fw-bold">{agent.nom} {agent.prenom}</div>
                    <div className="text-muted small">{agent.email}</div>
                </div>
            </div>
        );
    };

    // Fonction pour afficher le badge de niveau SSIAP
    const renderNiveauBadge = (niveau) => {
        let variant = "secondary";
        
        switch(niveau) {
            case "SSIAP_1":
                variant = "info";
                break;
            case "SSIAP_2":
                variant = "primary";
                break;
            case "SSIAP_3":
                variant = "success";
                break;
            default:
                variant = "secondary";
        }
        
        return (
            <Badge bg={variant} className="px-3 py-2">
                {niveau?.replace('_', ' ')}
            </Badge>
        );
    };

    // Fonction pour afficher le statut d'expiration
    const renderExpirationStatus = (dateExpiration) => {
        if (!dateExpiration) return null;
        
        const expirationDate = new Date(dateExpiration);
        const currentDate = new Date();
        const threeMonthsLater = new Date(currentDate);
        threeMonthsLater.setMonth(currentDate.getMonth() + 3);
        
        if (expirationDate < currentDate) {
            return (
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="expired-tooltip">Diplôme expiré</Tooltip>}
                >
                    <Badge bg="danger" className="ms-2">
                        <FaExclamationTriangle className="me-1" /> Expiré
                    </Badge>
                </OverlayTrigger>
            );
        } else if (expirationDate <= threeMonthsLater) {
            return (
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="expiring-tooltip">Expire prochainement</Tooltip>}
                >
                    <Badge bg="warning" text="dark" className="ms-2">
                        <FaClock className="me-1" /> Expire bientôt
                    </Badge>
                </OverlayTrigger>
            );
        } else {
            return (
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="valid-tooltip">Diplôme valide</Tooltip>}
                >
                    <Badge bg="success" className="ms-2">
                        <FaCheck className="me-1" /> Valide
                    </Badge>
                </OverlayTrigger>
            );
        }
    };

    // Fonction de suppression avec confirmation
    const handleDelete = (diplome) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le diplôme ${diplome.niveau} de ${agents[diplome.agentId]?.nom || 'cet agent'} ?`)) {
            DiplomeService.delete(diplome.id)
                .then(() => {
                    setList(list.filter(x => x.id !== diplome.id));
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression du diplôme:", err);
                    alert("Erreur lors de la suppression du diplôme.");
                });
        }
    };

    // Fonction de filtrage des diplômes
    const filteredDiplomes = list.filter(diplome => {
        const agent = agents[diplome.agentId];
        const nomComplet = agent ? `${agent.nom} ${agent.prenom}`.toLowerCase() : "";
        const email = agent?.email?.toLowerCase() || "";
        const niveau = diplome.niveau?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        
        // Filtre par terme de recherche (nom, prénom, email ou niveau)
        const matchesSearch = !searchTerm || 
            nomComplet.includes(search) || 
            email.includes(search) ||
            niveau.includes(search);
        
        // Filtre par niveau
        const matchesNiveau = !filterNiveau || diplome.niveau === filterNiveau;
        
        // Filtre par type de date
        let matchesDateType = true;
        const currentDate = new Date();
        
        if (filterDateType === "expired") {
            // Diplômes expirés
            matchesDateType = diplome.dateExpiration && new Date(diplome.dateExpiration) < currentDate;
        } else if (filterDateType === "expiringSoon") {
            // Diplômes qui expirent dans moins de 3 mois
            if (diplome.dateExpiration) {
                const expirationDate = new Date(diplome.dateExpiration);
                const threeMonthsLater = new Date(currentDate);
                threeMonthsLater.setMonth(currentDate.getMonth() + 3);
                matchesDateType = expirationDate > currentDate && expirationDate <= threeMonthsLater;
            } else {
                matchesDateType = false;
            }
        } else if (filterDateType === "valid") {
            // Diplômes valides
            matchesDateType = !diplome.dateExpiration || new Date(diplome.dateExpiration) >= currentDate;
        }
        
        return matchesSearch && matchesNiveau && matchesDateType;
    });

    // Fonction pour formater la date en format français
    const formatDate = (dateString) => {
        if (!dateString) return "–";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    return (
        <Container fluid className="py-4">
            <Card className="shadow-sm border-0 rounded-lg overflow-hidden">
                <Card.Header className="bg-gradient bg-primary text-white py-3">
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="mb-0 fw-bold">
                                <FaGraduationCap className="me-2" /> Diplômes SSIAP
                            </h4>
                            <p className="text-white-50 mb-0 mt-1 small">
                                Gestion des certifications Service de Sécurité Incendie et d'Assistance à Personnes
                            </p>
                        </Col>
                        <Col xs="auto">
                            <Link 
                                to="/diplomes-ssiap/create" 
                                className="btn btn-light d-flex align-items-center fw-semibold shadow-sm"
                            >
                                <FaPlus className="me-2" /> Nouveau diplôme
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body className="p-0 pb-2">
                    {/* Filtres de recherche */}
                    <div className="p-3 border-bottom bg-light">
                        <Row className="g-3">
                            <Col lg={5} md={5}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0">
                                        <FaSearch className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Rechercher par nom, prénom ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-start-0 shadow-none ps-0"
                                    />
                                </InputGroup>
                            </Col>
                            
                            <Col lg={3} md={3} sm={6}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0">
                                        <FaGraduationCap className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Select 
                                        value={filterNiveau} 
                                        onChange={(e) => setFilterNiveau(e.target.value)}
                                        className="border-start-0 shadow-none"
                                    >
                                        <option value="">Tous les niveaux</option>
                                        <option value="SSIAP_1">SSIAP 1</option>
                                        <option value="SSIAP_2">SSIAP 2</option>
                                        <option value="SSIAP_3">SSIAP 3</option>
                                    </Form.Select>
                                </InputGroup>
                            </Col>
                            
                            <Col lg={4} md={4} sm={6}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0">
                                        <FaCalendarAlt className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Select 
                                        value={filterDateType} 
                                        onChange={(e) => setFilterDateType(e.target.value)}
                                        className="border-start-0 shadow-none"
                                    >
                                        <option value="all">Toutes les dates</option>
                                        <option value="valid">Diplômes valides</option>
                                        <option value="expiringSoon">Expirent bientôt (3 mois)</option>
                                        <option value="expired">Diplômes expirés</option>
                                    </Form.Select>
                                </InputGroup>
                            </Col>
                        </Row>
                    </div>
                    
                    {error && (
                        <Alert variant="danger" className="m-3">
                            <FaExclamationTriangle className="me-2" />
                            {error}
                        </Alert>
                    )}
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted mt-3">Chargement des diplômes...</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 small text-muted">
                                <FaFilter className="me-2" />
                                {filteredDiplomes.length} diplôme(s) trouvé(s)
                            </div>
                            
                            <Table responsive hover className="align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="text-center" style={{width: '50px'}}>#</th>
                                        <th style={{minWidth: '250px'}}>Agent</th>
                                        <th style={{width: '150px'}}>Niveau</th>
                                        <th style={{width: '140px'}}>Date d'obtention</th>
                                        <th style={{width: '200px'}}>Date d'expiration</th>
                                        <th className="text-center" style={{width: '160px'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDiplomes.length > 0 ? (
                                        filteredDiplomes.map((diplome, index) => (
                                            <tr key={diplome.id}>
                                                <td className="text-center">{index + 1}</td>
                                                <td>{renderAgentInfo(diplome.agentId)}</td>
                                                <td>{renderNiveauBadge(diplome.niveau)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaCalendarAlt className="text-success me-2" />
                                                        {formatDate(diplome.dateObtention)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaCalendarAlt className="text-danger me-2" />
                                                        {formatDate(diplome.dateExpiration)}
                                                        {renderExpirationStatus(diplome.dateExpiration)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <Link to={`/diplomes-ssiap/${diplome.id}`}>
                                                            <Button variant="outline-info" size="sm" className="d-flex align-items-center">
                                                                <FaEye />
                                                            </Button>
                                                        </Link>
                                                        <Link to={`/diplomes-ssiap/edit/${diplome.id}`}>
                                                            <Button variant="outline-primary" size="sm" className="d-flex align-items-center">
                                                                <FaPencilAlt />
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            className="d-flex align-items-center"
                                                            onClick={() => handleDelete(diplome)}
                                                        >
                                                            <FaTrashAlt />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted">
                                                <FaExclamationTriangle className="me-2" size={20} />
                                                Aucun diplôme trouvé avec les critères de recherche actuels.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Card.Body>
                
                <Card.Footer className="bg-white border-top d-flex justify-content-end py-3">
                    <Link to="/" className="btn btn-light me-2">
                        Retour à l'accueil
                    </Link>
                </Card.Footer>
            </Card>
            
            {/* CSS personnalisé */}
            <style>{`
                .avatar-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 0.8rem;
                }
                
                .table th {
                    font-weight: 600;
                    white-space: nowrap;
                    border-bottom-width: 1px;
                }
                
                .table td {
                    vertical-align: middle;
                }
                
                .table-hover tbody tr:hover {
                    background-color: rgba(0, 123, 255, 0.05);
                }
                
                .btn-outline-info:hover, .btn-outline-primary:hover, .btn-outline-danger:hover {
                    color: #fff;
                }
            `}</style>
        </Container>
    );
};

export default DiplomeList;
