// src/components/contrats/ContratDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ContratService from "../../services/ContratService";
import DevisService from "../../services/DevisService";
import MissionService from "../../services/MissionService";
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFileContract, faArrowLeft, faPencilAlt, faCalendarAlt, 
    faFileInvoice, faTasks, faFilePdf, faClock, faCheck, faTimes, 
    faExclamationTriangle, faPlus
} from "@fortawesome/free-solid-svg-icons";

export default function ContratDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contrat, setContrat] = useState(null);
    const [devis, setDevis] = useState(null);
    const [missions, setMissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Charger les détails du contrat
                const contratResponse = await ContratService.getById(id);
                const contratData = contratResponse.data;
                setContrat(contratData);
                
                // Charger le devis associé si existant
                if (contratData.devisId) {
                    try {
                        const devisResponse = await DevisService.getById(contratData.devisId);
                        setDevis(devisResponse.data);
                    } catch (err) {
                        console.error("Erreur lors du chargement du devis:", err);
                        setDevis(null);
                    }
                }
                
                // Charger les missions liées
                const missionsResponse = await MissionService.getAllMissions();
                const missionsFiltrees = missionsResponse.data.filter(m => m.contratId === Number(id));
                setMissions(missionsFiltrees);
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger les détails du contrat. Veuillez réessayer ultérieurement.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des détails du contrat...</p>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    {error}
                </Alert>
                <Button variant="secondary" onClick={() => navigate('/contrats')}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="h4 mb-0">
                            <FontAwesomeIcon icon={faFileContract} className="me-2" />
                            Contrat #{contrat.id} - {contrat.referenceContrat}
                        </h2>
                        <div>
                            <Button variant="light" className="me-2" onClick={() => navigate("/contrats")}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                                Retour
                            </Button>
                            <Button variant="warning" onClick={() => navigate(`/contrats/edit/${id}`)}>
                                <FontAwesomeIcon icon={faPencilAlt} className="me-1" />
                                Modifier
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                
                <Card.Body>
                    <Row>
                        {/* Section Détails du contrat */}
                        <Col lg={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Header className="bg-light">
                                    <h3 className="h5 mb-0">
                                        <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                        Informations générales
                                    </h3>
                                </Card.Header>
                                <Card.Body>
                                    <Table hover responsive className="mb-0">
                                        <tbody>
                                            <tr>
                                                <th className="w-40">Référence</th>
                                                <td><strong>{contrat.referenceContrat}</strong></td>
                                            </tr>
                                            <tr>
                                                <th>
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                                    Date de signature
                                                </th>
                                                <td>{formatDate(contrat.dateSignature)}</td>
                                            </tr>
                                            <tr>
                                                <th>
                                                    <FontAwesomeIcon icon={faClock} className="me-2" />
                                                    Durée
                                                </th>
                                                <td>
                                                    {contrat.dureeMois ? (
                                                        <Badge bg="info">
                                                            {contrat.dureeMois} {contrat.dureeMois > 1 ? 'mois' : 'mois'}
                                                        </Badge>
                                                    ) : "—"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Tacite reconduction</th>
                                                <td>
                                                    {contrat.taciteReconduction ? (
                                                        <Badge bg="success">
                                                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                            Oui
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="danger">
                                                            <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                            Non
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Préavis</th>
                                                <td>{contrat.preavisMois ? `${contrat.preavisMois} mois` : "—"}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        {/* Section Devis associé */}
                        <Col lg={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Header className="bg-light">
                                    <h3 className="h5 mb-0">
                                        <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                                        Devis associé
                                    </h3>
                                </Card.Header>
                                <Card.Body>
                                    {!contrat.devisId && (
                                        <Alert variant="light">
                                            Aucun devis associé à ce contrat.
                                        </Alert>
                                    )}
                                    {contrat.devisId && !devis && (
                                        <div className="text-center">
                                            <Spinner animation="border" size="sm" />
                                            <p className="mb-0 mt-2">Chargement du devis...</p>
                                        </div>
                                    )}
                                    {devis && (
                                        <Table hover responsive className="mb-0">
                                            <tbody>
                                                <tr>
                                                    <th className="w-40">Référence Devis</th>
                                                    <td>
                                                        <Link to={`/devis/${devis.id}`}>
                                                            <strong>{devis.referenceDevis}</strong>
                                                        </Link>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Date du devis</th>
                                                    <td>{formatDate(devis.dateDevis)}</td>
                                                </tr>
                                                {devis.montantTotal && (
                                                    <tr>
                                                        <th>Montant total</th>
                                                        <td>{devis.montantTotal} €</td>
                                                    </tr>
                                                )}
                                                {devis.dateValidite && (
                                                    <tr>
                                                        <th>Date de validité</th>
                                                        <td>{formatDate(devis.dateValidite)}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Row>
                        {/* Section Missions liées */}
                        <Col lg={8} className="mb-4">
                            <Card>
                                <Card.Header className="bg-light">
                                    <h3 className="h5 mb-0">
                                        <FontAwesomeIcon icon={faTasks} className="me-2" />
                                        Missions liées
                                        {missions && (
                                            <Badge bg="primary" pill className="ms-2">
                                                {missions.length}
                                            </Badge>
                                        )}
                                    </h3>
                                </Card.Header>
                                <Card.Body>
                                    {!missions && (
                                        <div className="text-center">
                                            <Spinner animation="border" size="sm" />
                                            <p className="mb-0 mt-2">Chargement des missions...</p>
                                        </div>
                                    )}
                                    {missions && missions.length === 0 && (
                                        <Alert variant="light">
                                            Aucune mission n'est associée à ce contrat.
                                        </Alert>
                                    )}
                                    {missions && missions.length > 0 && (
                                        <ListGroup>
                                            {missions.map(mission => (
                                                <ListGroup.Item key={mission.id} action as={Link} 
                                                    to={`/missions/${mission.id}`}
                                                    className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h5 className="mb-1">{mission.titreMission}</h5>
                                                        <p className="text-muted mb-0 small">
                                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                            {formatDate(mission.dateDebutMission)} → {formatDate(mission.dateFinMission)}
                                                        </p>
                                                    </div>
                                                    <Badge bg={
                                                        new Date(mission.dateFinMission) < new Date() ? "secondary" : 
                                                        new Date(mission.dateDebutMission) > new Date() ? "warning" : "success"
                                                    }>
                                                        {new Date(mission.dateFinMission) < new Date() ? "Terminée" : 
                                                         new Date(mission.dateDebutMission) > new Date() ? "À venir" : "En cours"}
                                                    </Badge>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                    
                                    {missions && missions.length > 0 && (
                                        <div className="text-end mt-3">
                                            <Button variant="outline-primary" size="sm" as={Link} to="/missions/create" state={{ contratId: id }}>
                                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                                Ajouter une mission
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        {/* Section Document PDF */}
                        <Col lg={4} className="mb-4">
                            <Card>
                                <Card.Header className="bg-light">
                                    <h3 className="h5 mb-0">
                                        <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                                        Document PDF
                                    </h3>
                                </Card.Header>
                                <Card.Body className="text-center">
                                    {contrat.documentPdf ? (
                                        <div>
                                            <p className="mb-4">Le document PDF signé est disponible.</p>
                                            <Button 
                                                variant="danger" 
                                                href={`data:application/pdf;base64,${contrat.documentPdf}`}
                                                target="_blank" rel="noreferrer"
                                            >
                                                <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                                                Ouvrir le PDF signé
                                            </Button>
                                        </div>
                                    ) : (
                                        <Alert variant="light">
                                            Aucun document PDF n'est associé à ce contrat.
                                        </Alert>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}
