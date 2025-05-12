// src/components/sites/SiteDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SiteService from "../../services/SiteService";
import MissionService from "../../services/MissionService";
import { Container, Card, Row, Col, Table, Button, Badge, Breadcrumb, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEdit, faTrash, faArrowLeft, faEye, faBriefcase } from '@fortawesome/free-solid-svg-icons';

export default function SiteDetail() {
    const { id } = useParams();
    const nav = useNavigate();

    const [site, setSite] = useState(null);
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Récupération du site
                const { data: siteData } = await SiteService.getSiteById(id);
                setSite(siteData);

                // Si des missions associées, on les charge
                if (Array.isArray(siteData.missionsIds) && siteData.missionsIds.length > 0) {
                    const fetches = siteData.missionsIds.map(mid =>
                        MissionService.getMissionById(mid).then(res => res.data)
                    );
                    const details = await Promise.all(fetches);
                    setMissions(details);
                } else {
                    setMissions([]);
                }
            } catch (err) {
                console.error(err);
                setError("Impossible de charger les détails du site.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleDelete = () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce site ?")) return;
        
        SiteService.deleteSite(id)
            .then(() => nav("/sites"))
            .catch(err => {
                console.error(err);
                alert("Erreur lors de la suppression du site");
            });
    };

    const getStatusBadge = (status) => {
        switch(status?.toLowerCase()) {
            case 'en cours':
                return <Badge bg="success">En cours</Badge>;
            case 'terminé':
            case 'terminée':
                return <Badge bg="secondary">Terminée</Badge>;
            case 'planifié':
            case 'planifiée':
                return <Badge bg="info">Planifiée</Badge>;
            case 'annulé':
            case 'annulée':
                return <Badge bg="danger">Annulée</Badge>;
            default:
                return <Badge bg="warning">{status || 'Non défini'}</Badge>;
        }
    };

    const fmtDate = d => d ? new Date(d).toLocaleDateString() : "-";
    const fmtTime = t => t?.slice(0, 5) || "-";

    if (loading) {
        return (
            <Container className="d-flex justify-content-center py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className="mb-0">Chargement du site...</p>
                </div>
            </Container>
        );
    }

    if (error || !site) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    {error || "Site non trouvé."}
                    <div className="mt-2">
                        <Link to="/sites" className="btn btn-outline-primary btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Retour à la liste
                        </Link>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Breadcrumb className="mb-3">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/sites" }}>Sites</Breadcrumb.Item>
                <Breadcrumb.Item active>Site #{site.id} - {site.nom}</Breadcrumb.Item>
            </Breadcrumb>

            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary bg-gradient text-white d-flex justify-content-between align-items-center">
                    <div>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                        <span className="fw-bold fs-4">Site : {site.nom}</span>
                    </div>
                    <div>
                        <Button 
                            variant="outline-light" 
                            size="sm" 
                            className="me-2"
                            as={Link} 
                            to={`/sites/edit/${site.id}`}
                        >
                            <FontAwesomeIcon icon={faEdit} className="me-1" /> Modifier
                        </Button>
                        <Button 
                            variant="danger" 
                            size="sm"
                            onClick={handleDelete}
                        >
                            <FontAwesomeIcon icon={faTrash} className="me-1" /> Supprimer
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body>
                    <Row>
                        <Col md="6" className="mb-4">
                            <Card className="h-100">
                                <Card.Header className="bg-light">
                                    <h5 className="mb-0">Informations générales</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Table borderless>
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" style={{width: "40%"}}>Identifiant</td>
                                                <td>{site.id}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Nom</td>
                                                <td>{site.nom}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Adresse complète</td>
                                                <td>
                                                    {site.numero} {site.rue}<br />
                                                    {site.codePostal} {site.ville}<br />
                                                    {site.departement && `${site.departement}, `}{site.region}<br />
                                                    {site.pays}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        <Col md="6" className="mb-4">
                            <Card className="h-100">
                                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faBriefcase} className="me-1" /> Missions associées
                                    </h5>
                                    <Badge bg="info" pill>
                                        {missions.length}
                                    </Badge>
                                </Card.Header>
                                <Card.Body style={{maxHeight: '300px', overflowY: 'auto'}}>
                                    {missions.length === 0 ? (
                                        <p className="text-muted text-center py-3">
                                            <em>Aucune mission liée à ce site.</em>
                                        </p>
                                    ) : (
                                        <Table hover size="sm" responsive>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Titre</th>
                                                    <th>Dates</th>
                                                    <th>Statut</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {missions.map(m => (
                                                    <tr key={m.id}>
                                                        <td>{m.id}</td>
                                                        <td className="text-truncate" style={{maxWidth: '150px'}}>
                                                            {m.titre || '(Sans titre)'}
                                                        </td>
                                                        <td className="small">
                                                            {fmtDate(m.dateDebut)}<br />
                                                            <span className="text-muted">au {fmtDate(m.dateFin)}</span>
                                                        </td>
                                                        <td>{getStatusBadge(m.statutMission)}</td>
                                                        <td>
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm" 
                                                                onClick={() => nav(`/missions/${m.id}`)}
                                                                title="Voir la mission"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>

                <Card.Footer className="text-muted">
                    <Link to="/sites" className="btn btn-outline-secondary">
                        <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Retour à la liste
                    </Link>
                </Card.Footer>
            </Card>
        </Container>
    );
}
