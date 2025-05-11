import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
    Container, Row, Col, Card, Badge, Button, 
    Spinner, Alert, OverlayTrigger, Tooltip, 
    Table, ListGroup
} from "react-bootstrap";
import {
    FaGraduationCap, FaUser, FaCalendarAlt, FaIdCard,
    FaArrowLeft, FaExclamationTriangle, FaPrint, FaSync,
    FaTrashAlt, FaEdit, FaClock, FaCheck, FaEnvelope,
    FaPhone, FaMapMarkerAlt, FaInfoCircle, FaIdBadge
} from "react-icons/fa";
import DiplomeService from "../../services/DiplomeService";
import AgentService from "../../services/AgentService";

const DiplomeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [diplome, setDiplome] = useState(null);
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Récupérer les informations du diplôme
                const diplomeRes = await DiplomeService.getById(id);
                const diplomeData = diplomeRes.data;
                setDiplome(diplomeData);
                
                // Récupérer les informations de l'agent associé
                try {
                    const agentRes = await AgentService.getAgentById(diplomeData.agentId);
                    setAgent(agentRes.data);
                } catch (err) {
                    console.error(`Erreur lors du chargement de l'agent ${diplomeData.agentId}:`, err);
                    setAgent({ nom: "Inconnu", prenom: "", email: "Agent non trouvé" });
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement du diplôme:", err);
                setError("Impossible de charger les détails du diplôme.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    // Fonction pour déterminer le statut du diplôme
    const getDiplomeStatus = (dateExpiration) => {
        if (!dateExpiration) return { status: "indefini", label: "Pas de date d'expiration", variant: "secondary" };
        
        const today = new Date();
        const expirationDate = new Date(dateExpiration);
        
        if (expirationDate < today) {
            return { status: "expired", label: "Expiré", variant: "danger" };
        }
        
        // Calcul de la différence en jours
        const diffTime = expirationDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 90) { // 3 mois
            return { status: "expiring-soon", label: "Expire bientôt", variant: "warning" };
        }
        
        return { status: "valid", label: "Valide", variant: "success" };
    };
    
    // Fonction pour calculer la durée de validité
    const getValidityDuration = (dateObtention, dateExpiration) => {
        if (!dateObtention || !dateExpiration) return "Non définie";
        
        const obtentionDate = new Date(dateObtention);
        const expirationDate = new Date(dateExpiration);
        
        // Calcul de la différence en années et mois
        let years = expirationDate.getFullYear() - obtentionDate.getFullYear();
        let months = expirationDate.getMonth() - obtentionDate.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        if (years > 0 && months > 0) {
            return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
        } else if (years > 0) {
            return `${years} an${years > 1 ? 's' : ''}`;
        } else {
            return `${months} mois`;
        }
    };

    // Fonction pour calculer le temps restant avant expiration
    const getRemainingTime = (dateExpiration) => {
        if (!dateExpiration) return "Non applicable";
        
        const today = new Date();
        const expirationDate = new Date(dateExpiration);
        
        if (expirationDate < today) {
            return "Expiré";
        }
        
        // Calcul de la différence en jours
        const diffTime = expirationDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} mois`;
        } else {
            const years = Math.floor(diffDays / 365);
            const remainingMonths = Math.floor((diffDays % 365) / 30);
            
            if (remainingMonths > 0) {
                return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
            } else {
                return `${years} an${years > 1 ? 's' : ''}`;
            }
        }
    };

    // Fonction pour formater les dates
    const formatDate = (dateString) => {
        if (!dateString) return "Non spécifiée";
        
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Fonction pour afficher la description du niveau SSIAP
    const getNiveauDescription = (niveau) => {
        switch(niveau) {
            case 'SSIAP_1':
                return "Agent de sécurité incendie et d'assistance aux personnes";
            case 'SSIAP_2':
                return "Chef d'équipe de sécurité incendie et d'assistance aux personnes";
            case 'SSIAP_3':
                return "Chef de service de sécurité incendie et d'assistance aux personnes";
            default:
                return "Non spécifié";
        }
    };

    // Fonction pour gérer la suppression du diplôme
    const handleDelete = async () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce diplôme SSIAP ${diplome?.niveau?.split('_')[1]} de ${agent?.nom} ${agent?.prenom} ?`)) {
            setDeleting(true);
            try {
                await DiplomeService.delete(id);
                navigate("/diplomes-ssiap", { state: { message: "Diplôme supprimé avec succès" } });
            } catch (err) {
                console.error("Erreur lors de la suppression:", err);
                setError("Erreur lors de la suppression du diplôme.");
                setDeleting(false);
            }
        }
    };

    // Fonction pour obtenir la couleur de badge selon le niveau SSIAP
    const getNiveauBadgeVariant = (niveau) => {
        switch(niveau) {
            case 'SSIAP_1': return "info";
            case 'SSIAP_2': return "primary";
            case 'SSIAP_3': return "success";
            default: return "secondary";
        }
    };

    if (loading) {
        return (
            <Container fluid className="py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" style={{width: "3rem", height: "3rem"}} />
                    <p className="mt-3 text-muted">Chargement des détails du diplôme...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="py-4">
                <Alert variant="danger" className="d-flex align-items-center shadow-sm">
                    <FaExclamationTriangle size={24} className="me-3" />
                    <div>
                        <Alert.Heading>Erreur</Alert.Heading>
                        <p className="mb-0">{error}</p>
                    </div>
                </Alert>
                <div className="text-center mt-4">
                    <Link to="/diplomes-ssiap" className="btn btn-outline-primary">
                        <FaArrowLeft className="me-2" /> Retour à la liste des diplômes
                    </Link>
                </div>
            </Container>
        );
    }

    if (!diplome) {
        return (
            <Container fluid className="py-4">
                <Alert variant="warning">
                    <Alert.Heading>Diplôme non trouvé</Alert.Heading>
                    <p>Le diplôme que vous recherchez n'existe pas ou a été supprimé.</p>
                </Alert>
                <div className="text-center mt-4">
                    <Link to="/diplomes-ssiap" className="btn btn-outline-primary">
                        <FaArrowLeft className="me-2" /> Retour à la liste des diplômes
                    </Link>
                </div>
            </Container>
        );
    }

    const diplomeStatus = getDiplomeStatus(diplome.dateExpiration);

    return (
        <Container fluid className="py-4">
            {/* En-tête */}
            <Card className="shadow-sm border-0 rounded-lg mb-4 overflow-hidden">
                <Card.Header className="bg-gradient bg-primary text-white py-3">
                    <Row className="align-items-center">
                        <Col>
                            <div className="d-flex align-items-center">
                                <FaGraduationCap size={28} className="me-3" />
                                <div>
                                    <h4 className="mb-0 fw-bold">
                                        Diplôme SSIAP {diplome.niveau?.split('_')[1]}
                                    </h4>
                                    <p className="text-white-50 mb-0 mt-1 small">
                                        {getNiveauDescription(diplome.niveau)}
                                    </p>
                                </div>
                                <Badge 
                                    bg={diplomeStatus.variant} 
                                    className="ms-3 px-3 py-2"
                                    style={{fontSize: "0.85rem"}}
                                >
                                    {diplomeStatus.label}
                                </Badge>
                            </div>
                        </Col>
                        <Col xs="auto">
                            <Link 
                                to="/diplomes-ssiap" 
                                className="btn btn-light d-flex align-items-center fw-semibold shadow-sm"
                            >
                                <FaArrowLeft className="me-2" /> Retour à la liste
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>
            </Card>
            
            <Row className="g-4">
                {/* Informations du diplôme */}
                <Col lg={6}>
                    <Card className="shadow-sm border-0 rounded-lg h-100">
                        <Card.Header className="bg-light py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold text-primary d-flex align-items-center">
                                    <FaIdCard className="me-2" /> Informations du diplôme
                                </h5>
                                <Badge 
                                    bg={getNiveauBadgeVariant(diplome.niveau)} 
                                    className="px-3 py-2"
                                >
                                    {diplome.niveau?.replace("_", " ")}
                                </Badge>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table borderless className="mb-0">
                                <tbody>
                                    <tr>
                                        <td className="text-secondary fw-semibold" style={{width: "40%"}}>
                                            <FaInfoCircle className="me-2 text-primary" /> Référence
                                        </td>
                                        <td className="fw-semibold">#{diplome.id}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-secondary fw-semibold">
                                            <FaCalendarAlt className="me-2 text-success" /> Date d'obtention
                                        </td>
                                        <td className="fw-semibold">{formatDate(diplome.dateObtention)}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-secondary fw-semibold">
                                            <FaCalendarAlt className="me-2 text-danger" /> Date d'expiration
                                        </td>
                                        <td className="fw-semibold">
                                            {formatDate(diplome.dateExpiration)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-secondary fw-semibold">
                                            <FaClock className="me-2 text-primary" /> Durée de validité
                                        </td>
                                        <td className="fw-semibold">
                                            {getValidityDuration(diplome.dateObtention, diplome.dateExpiration)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-secondary fw-semibold">
                                            <FaClock className="me-2 text-warning" /> Temps restant
                                        </td>
                                        <td className="fw-semibold">
                                            {getRemainingTime(diplome.dateExpiration)}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                        <Card.Footer className="bg-white border-top p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Le recyclage est obligatoire tous les 3 ans</Tooltip>}
                                >
                                    <div className="d-flex align-items-center text-muted small">
                                        <FaInfoCircle className="me-2" /> 
                                        Information importante
                                    </div>
                                </OverlayTrigger>
                                <Link 
                                    to={`/diplomes-ssiap/edit/${id}`}
                                    className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                >
                                    <FaEdit className="me-2" /> Modifier
                                </Link>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
                
                {/* Titulaire du diplôme */}
                <Col lg={6}>
                    <Card className="shadow-sm border-0 rounded-lg h-100">
                        <Card.Header className="bg-light py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold text-primary d-flex align-items-center">
                                    <FaUser className="me-2" /> Titulaire du diplôme
                                </h5>
                                {agent && agent.id && (
                                    <Link 
                                        to={`/agents/${agent.id}`} 
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                    >
                                        <FaIdBadge className="me-2" /> Voir profil complet
                                    </Link>
                                )}
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {agent ? (
                                <div className="p-3">
                                    <div className="d-flex mb-4">
                                        <div 
                                            className="avatar-circle bg-primary me-3"
                                            style={{
                                                width: "64px",
                                                height: "64px",
                                                fontSize: "1.5rem"
                                            }}
                                        >
                                            {agent.prenom?.charAt(0) || ""}{agent.nom?.charAt(0) || ""}
                                        </div>
                                        <div>
                                            <h5 className="mb-1">
                                                {agent.nom} {agent.prenom}
                                            </h5>
                                            <p className="text-muted mb-0">
                                                ID: #{agent.id}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="px-0 py-2 border-top-0">
                                            <div className="d-flex align-items-center">
                                                <FaEnvelope className="me-2 text-primary" />
                                                <span className="text-secondary me-2">Email:</span>
                                                <span className="fw-semibold">
                                                    {agent.email || "Non spécifié"}
                                                </span>
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="px-0 py-2">
                                            <div className="d-flex align-items-center">
                                                <FaPhone className="me-2 text-primary" />
                                                <span className="text-secondary me-2">Téléphone:</span>
                                                <span className="fw-semibold">
                                                    {agent.telephone || "Non spécifié"}
                                                </span>
                                            </div>
                                        </ListGroup.Item>
                                        {agent.adresse && (
                                            <ListGroup.Item className="px-0 py-2">
                                                <div className="d-flex align-items-center">
                                                    <FaMapMarkerAlt className="me-2 text-primary" />
                                                    <span className="text-secondary me-2">Adresse:</span>
                                                    <span className="fw-semibold">
                                                        {agent.adresse}
                                                    </span>
                                                </div>
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <FaExclamationTriangle size={40} className="text-warning mb-3" />
                                    <p className="text-muted">Informations de l'agent non disponibles.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Actions */}
                <Col xs={12}>
                    <Card className="shadow-sm border-0 rounded-lg">
                        <Card.Header className="bg-light py-3">
                            <h5 className="mb-0 fw-bold text-primary">
                                <FaIdCard className="me-2" /> Actions
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="justify-content-center g-3">
                                <Col md={4} sm={6}>
                                    <Button 
                                        variant="outline-secondary" 
                                        className="w-100 py-3 d-flex align-items-center justify-content-center"
                                        onClick={() => window.print()}
                                    >
                                        <FaPrint className="me-2" /> Imprimer le diplôme
                                    </Button>
                                </Col>
                                <Col md={4} sm={6}>
                                    <Link 
                                        to={`/diplomes-ssiap/edit/${id}`}
                                        className="btn btn-outline-primary w-100 py-3 d-flex align-items-center justify-content-center"
                                    >
                                        <FaSync className="me-2" /> Renouveler le diplôme
                                    </Link>
                                </Col>
                                <Col md={4} sm={12}>
                                    <Button 
                                        variant="outline-danger"
                                        className="w-100 py-3 d-flex align-items-center justify-content-center"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        {deleting ? (
                                            <>
                                                <Spinner 
                                                    as="span" 
                                                    animation="border" 
                                                    size="sm" 
                                                    className="me-2"
                                                />
                                                Suppression...
                                            </>
                                        ) : (
                                            <>
                                                <FaTrashAlt className="me-2" /> Supprimer le diplôme
                                            </>
                                        )}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* CSS personnalisé */}
            <style>{`
                .avatar-circle {
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }
                
                @media print {
                    .btn, .card-footer {
                        display: none !important;
                    }
                    
                    .container-fluid {
                        padding: 0 !important;
                    }
                    
                    .card {
                        border: 1px solid #ddd !important;
                        box-shadow: none !important;
                    }
                    
                    .row > [class*="col-"] {
                        max-width: 100% !important;
                        flex: 0 0 100% !important;
                    }
                }
            `}</style>
        </Container>
    );
};

export default DiplomeDetail;