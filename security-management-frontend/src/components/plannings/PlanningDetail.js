import { useEffect, useState } from "react";
import { useParams, Link }     from "react-router-dom";
import PlanningService         from "../../services/PlanningService";
import { Container, Card, Badge, Button, Alert, Spinner, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faArrowLeft, faEye, faEdit } from "@fortawesome/free-solid-svg-icons";

export default function PlanningDetail() {
    const { id } = useParams();
    const [planning, setPlanning] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        setLoading(true);
        PlanningService
            .getPlanningById(id)
            .then(res => {
                setPlanning(res.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erreur lors du chargement du planning:", error);
                setErr("Impossible de charger ce planning");
                setLoading(false);
            });
    }, [id]);

    if (err) return (
        <Container className="py-4">
            <Alert variant="danger">
                <Alert.Heading>Erreur</Alert.Heading>
                <p>{err}</p>
                <hr />
                <div className="d-flex justify-content-end">
                    <Link to="/plannings">
                        <Button variant="outline-danger">
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Retour aux plannings
                        </Button>
                    </Link>
                </div>
            </Alert>
        </Container>
    );
    
    if (loading || !planning) return (
        <Container className="py-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Chargement du planning...</p>
        </Container>
    );

    return (
        <Container fluid className="py-4">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">
                            <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                            Planning #{planning.id}
                        </h2>
                        <Link to={`/plannings/edit/${planning.id}`}>
                            <Button variant="light">
                                <FontAwesomeIcon icon={faEdit} className="me-1" /> Modifier
                            </Button>
                        </Link>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <Card className="h-100">
                                <Card.Header className="bg-light">Informations générales</Card.Header>
                                <Card.Body>                                    <p className="mb-2">
                                        <strong>Identifiant:</strong> {planning.id}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Créé le:</strong> {new Date(planning.dateCreation).toLocaleString()}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Dernière modification:</strong> {new Date(planning.dateModification).toLocaleString()}
                                    </p>
                                    {planning.description && (
                                        <div className="mt-3">
                                            <strong>Description:</strong>
                                            <p className="mb-0 text-muted mt-1">{planning.description}</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                        
                        <div className="col-md-6 mt-3 mt-md-0">
                            <Card className="h-100">
                                <Card.Header className="bg-light">Agents impliqués</Card.Header>
                                <Card.Body>
                                    {(planning.missions?.flatMap((m) => m.agents) || []).length === 0 ? (
                                        <Alert variant="warning">Aucun agent assigné à ce planning</Alert>
                                    ) : (
                                        <div className="d-flex flex-wrap gap-1">
                                            {[...new Set((planning.missions?.flatMap((m) => m.agents) || []).map(a => a.id))].map(agentId => {
                                                const agent = (planning.missions?.flatMap((m) => m.agents) || []).find(a => a.id === agentId);
                                                return agent ? (
                                                    <Badge bg="info" key={`agent-${agentId}`} className="p-2 mb-1">
                                                        {agent.nom} {agent.prenom}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                    <Card>
                        <Card.Header className="bg-light">
                            <h4 className="mb-0">Missions</h4>
                        </Card.Header>
                        <Card.Body>
                            {(planning.missions || []).length === 0 ? (
                                <Alert variant="warning">
                                    Aucune mission assignée à ce planning
                                </Alert>
                            ) : (
                                <ListGroup>
                                    {(planning.missions || []).map(m => (
                                        <ListGroup.Item key={m.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5>{m.titre}</h5>
                                                <p className="mb-0 text-muted">
                                                    {m.dateDebut && m.dateFin ? (
                                                        <>Du {new Date(m.dateDebut).toLocaleDateString()} au {new Date(m.dateFin).toLocaleDateString()}</>
                                                    ) : (
                                                        "Dates non définies"
                                                    )}
                                                </p>
                                            </div>
                                            <Link to={`/missions/${m.id}`}>
                                                <Button variant="outline-primary" size="sm">
                                                    <FontAwesomeIcon icon={faEye} className="me-1" /> Détails
                                                </Button>
                                            </Link>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="mt-3">
                        <Link to="/plannings">
                            <Button variant="secondary">
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> 
                                Retour aux plannings
                            </Button>
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
