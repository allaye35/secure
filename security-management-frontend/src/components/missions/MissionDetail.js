// src/components/missions/MissionDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MissionService from "../../services/MissionService";
import SiteService from "../../services/SiteService";
import ContratService from "../../services/ContratService";
import DevisService from "../../services/DevisService";
import PlanningService from "../../services/PlanningService";
import FactureService from "../../services/FactureService";
import RapportService from "../../services/RapportService";
import PointageService from "../../services/PointageService";
import AgentService from "../../services/AgentService";
import { Card, Container, Row, Col, Badge, ListGroup, Button, Table } from 'react-bootstrap';


export default function MissionDetail() {
    const { id } = useParams();
    const [mission, setMission] = useState(null);
    const [error, setError] = useState("");
    const [site, setSite] = useState(null);
    const [contrat, setContrat] = useState(null);
    const [devis, setDevis] = useState(null);
    const [planning, setPlanning] = useState(null);
    const [factures, setFactures] = useState([]);
    const [rapports, setRapports] = useState([]);
    const [pointages, setPointages] = useState([]);
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        MissionService.getMissionById(id)
            .then(async ({ data }) => {
                setMission(data);
                // Site
                if (data.siteId && !data.site) {
                    SiteService.getSiteById(data.siteId)
                        .then(res => setSite(res.data))
                        .catch(() => setSite(null));
                } else if (data.site) {
                    setSite(data.site);
                }
                // Contrat
                if ((data.contratId || (data.contrat && data.contrat.id)) && !data.contrat) {
                    const cid = data.contratId || (data.contrat && data.contrat.id);
                    ContratService.getById(cid)
                        .then(res => setContrat(res.data))
                        .catch(() => setContrat(null));
                } else if (data.contrat) {
                    setContrat(data.contrat);
                }
                // Devis
                if ((data.devisId || (data.devis && data.devis.id)) && !data.devis) {
                    const did = data.devisId || (data.devis && data.devis.id);
                    DevisService.getById(did)
                        .then(res => setDevis(res.data))
                        .catch(() => setDevis(null));
                } else if (data.devis) {
                    setDevis(data.devis);
                }
                // Planning
                if ((data.planningId || (data.planning && data.planning.id)) && !data.planning) {
                    const pid = data.planningId || (data.planning && data.planning.id);
                    PlanningService.getPlanningById(pid)
                        .then(res => setPlanning(res.data))
                        .catch(() => setPlanning(null));
                } else if (data.planning) {
                    setPlanning(data.planning);
                }
                // Factures (supporte mission.factures ou mission.factureIds)
                if (Array.isArray(data.factures) && data.factures.length > 0) {
                    const facturesPromises = data.factures.map(f => {
                        // Toujours hydrater si la date n'est pas présente
                        const hasDate = f && (f.dateFacture || f.date_emission || f.dateEmission || f.date || f.date_creation || f.createdAt);
                        if (f && f.id && !hasDate) {
                            return FactureService.getById(f.id).then(res => res.data).catch(() => null);
                        } else {
                            return Promise.resolve(f);
                        }
                    });
                    const facturesDetails = await Promise.all(facturesPromises);
                    setFactures(facturesDetails.filter(f => !!f));
                } else if (Array.isArray(data.factureIds) && data.factureIds.length > 0) {
                    // Ajout : supporte mission.factureIds (liste d'IDs)
                    const facturesPromises = data.factureIds.map(id =>
                        FactureService.getById(id).then(res => res.data).catch(() => null)
                    );
                    const facturesDetails = await Promise.all(facturesPromises);
                    setFactures(facturesDetails.filter(f => !!f));
                } else {
                    setFactures([]);
                }
                // Rapports (supporte mission.rapports ou mission.rapportIds)
                if (Array.isArray(data.rapports) && data.rapports.length > 0) {
                    const rapportsPromises = data.rapports.map(r => {
                        if (r && r.id && (Object.keys(r).length === 1 || !r.dateIntervention)) {
                            return RapportService.getRapportById(r.id).then(res => res.data).catch(() => null);
                        } else {
                            return Promise.resolve(r);
                        }
                    });
                    const rapportsDetails = await Promise.all(rapportsPromises);
                    setRapports(rapportsDetails.filter(r => !!r));
                } else if (Array.isArray(data.rapportIds) && data.rapportIds.length > 0) {
                    // Ajout : supporte mission.rapportIds (liste d'IDs)
                    const rapportsPromises = data.rapportIds.map(id =>
                        RapportService.getRapportById(id).then(res => res.data).catch(() => null)
                    );
                    const rapportsDetails = await Promise.all(rapportsPromises);
                    setRapports(rapportsDetails.filter(r => !!r));
                } else {
                    setRapports([]);
                }
                // Pointages (si mission.pointages est une liste d'IDs ou d'objets incomplets)
                if (Array.isArray(data.pointages) && data.pointages.length > 0) {
                    const pointagesPromises = data.pointages.map(p => {
                        if (p && p.id && (Object.keys(p).length === 1 || !p.date)) {
                            return PointageService.getById(p.id).then(res => res.data).catch(() => null);
                        } else {
                            return Promise.resolve(p);
                        }
                    });
                    const pointagesDetails = await Promise.all(pointagesPromises);
                    setPointages(pointagesDetails.filter(p => !!p));
                } else {
                    setPointages([]);
                }
                // Agents (hydrate agent details if only IDs are present, or if only agentIds is present)
                console.log('MissionDetail: data.agentIds =', data.agentIds);
                if (Array.isArray(data.agents) && data.agents.length > 0) {
                    const agentsPromises = data.agents.map(a => {
                        if (a && a.id && (Object.keys(a).length === 1 || !a.nom)) {
                            return AgentService.getAgentById(a.id).then(res => res.data).catch(() => null);
                        } else {
                            return Promise.resolve(a);
                        }
                    });
                    const agentsDetails = await Promise.all(agentsPromises);
                    setAgents(agentsDetails.filter(a => !!a));
                    console.log('MissionDetail: agents récupérés (via agents)', agentsDetails.filter(a => !!a));
                } else if (Array.isArray(data.agentIds) && data.agentIds.length > 0) {
                    // Si on reçoit uniquement une liste d'IDs, on hydrate chaque agent
                    const agentsPromises = data.agentIds.map(agentId =>
                        AgentService.getAgentById(agentId).then(res => res.data).catch((e) => {console.error('Erreur récupération agent', agentId, e); return null;})
                    );
                    const agentsDetails = await Promise.all(agentsPromises);
                    setAgents(agentsDetails.filter(a => !!a));
                    console.log('MissionDetail: agents récupérés (via agentIds)', agentsDetails.filter(a => !!a));
                } else {
                    setAgents([]);
                    console.log('MissionDetail: Aucun agent à afficher');
                }
            })
            .catch(() => setError("Impossible de charger la mission."));
    }, [id]);

    const formatDate = d => d ? new Date(d).toLocaleDateString() : "-";
    const formatTime = t => t ? t.slice(0, 5) : "-";

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'en cours':
                return <Badge bg="primary">En cours</Badge>;
            case 'terminé':
            case 'termine':
            case 'terminée':
            case 'terminee':
                return <Badge bg="success">Terminé</Badge>;
            case 'planifié':
            case 'planifie':
            case 'planifiée':
            case 'planifiee':
                return <Badge bg="info">Planifié</Badge>;
            case 'annulé':
            case 'annule':
            case 'annulée':
            case 'annulee':
                return <Badge bg="danger">Annulé</Badge>;
            default:
                return <Badge bg="secondary">{status || 'Non défini'}</Badge>;
        }
    };

    if (error) return (
        <Container className="mt-4">
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        </Container>
    );
    
    if (!mission) return (
        <Container className="mt-4">
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        </Container>
    );

    // Ajout d'une fonction pour parser les dates au format DD/MM/YYYY si besoin
    const parseDate = (d) => {
        if (!d) return null;
        // Si format ISO ou timestamp
        if (/\d{4}-\d{2}-\d{2}/.test(d) || !isNaN(Date.parse(d))) {
            return new Date(d);
        }
        // Si format DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
            const [day, month, year] = d.split('/');
            return new Date(`${year}-${month}-${day}`);
        }
        return null;
    };

    return (
        <Container className="mt-4 mb-4">
            <Card>
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">
                        <i className="bi bi-file-text"></i> Détails de la Mission #{mission.id}
                    </h2>
                    <Button variant="light" as={Link} to="/missions">
                        <i className="bi bi-arrow-left"></i> Retour
                    </Button>
                </Card.Header>
                
                <Card.Body>
                    <Row>
                        <Col lg={6}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Informations générales</h4>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>Titre :</strong> {mission.titre}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Description :</strong> {mission.description}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Période :</strong>
                                            <div>
                                                Du {formatDate(mission.dateDebut)} à {formatTime(mission.heureDebut)}
                                            </div>
                                            <div>
                                                Au {formatDate(mission.dateFin)} à {formatTime(mission.heureFin)}
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Statut :</strong> {getStatusBadge(mission.statutMission)}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Type :</strong> <Badge bg="info">{mission.typeMission}</Badge>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Nombre d'agents prévus :</strong> {mission.nombreAgents}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Quantité :</strong> {mission.quantite}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Tarification</h4>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>Tarif unitaire (HT) :</strong> {mission.tarif?.prixUnitaireHT ?? "-"} €
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Montant HT :</strong> {mission.montantHT ?? "-"} €
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Montant TVA :</strong> {mission.montantTVA ?? "-"} €
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Montant TTC :</strong> {mission.montantTTC ?? "-"} €
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Devis associé :</strong>{" "}
                                            {devis ? 
                                                <Link to={`/devis/${devis.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="bi bi-file-earmark-text"></i> {devis.referenceDevis ? `Devis ${devis.referenceDevis}` : `Devis #${devis.id}`}
                                                </Link> : "-"}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Relations</h4>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>Planning :</strong>{" "}
                                            {planning ? (
                                                <Link to={`/plannings/${planning.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="bi bi-calendar"></i> {planning.nom ? `Planning ${planning.nom}` : `#${planning.id}`}
                                                </Link>
                                            ) : "-"}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Site :</strong>{" "}
                                            {site ? 
                                                <Link to={`/sites/${site.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="bi bi-geo"></i> #{site.id} – {site.nom || site.name}
                                                </Link> : "-"}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Géolocalisation :</strong>{" "}
                                            {site && site.latitude && site.longitude ? (
                                                <span>
                                                    <i className="bi bi-geo-alt"></i> Lat {site.latitude}, Lng {site.longitude}
                                                </span>
                                            ) : mission.geolocalisationGPS ? (
                                                <span>
                                                    <i className="bi bi-geo-alt"></i> Lat {mission.geolocalisationGPS.position?.lat}, Lng {mission.geolocalisationGPS.position?.lng}
                                                </span>
                                            ) : "-"}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Contrat :</strong>{" "}
                                            {contrat ? 
                                                <Link to={`/contrats/${contrat.id}`} className="btn btn-sm btn-outline-primary">
                                                    <i className="bi bi-file-earmark"></i> {contrat.referenceContrat ? `Contrat ${contrat.referenceContrat}` : `Contrat #${contrat.id}`}
                                                </Link> : "-"}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Factures associées :</strong>{" "}
                                            {factures.length > 0 ? 
                                                factures.map(f => {
                                                    // Ajout : gestion de dateEmission (camelCase) et parsing DD/MM/YYYY
                                                    let dateValue = f.dateFacture || f.date_emission || f.dateEmission || f.date || f.date_creation || f.createdAt;
                                                    let dateAffiche = dateValue ? parseDate(dateValue) : null;
                                                    return (
                                                        <div key={f.id} className="mb-2">
                                                            <Link to={`/factures/${f.id}`} className="btn btn-sm btn-outline-primary me-2 mb-1">
                                                                <i className="bi bi-receipt"></i> {f.referenceFacture ? f.referenceFacture : `#${f.id}`}
                                                            </Link>
                                                            <div className="ms-3 d-inline-block">
                                                                <span><strong>Montant TTC :</strong> {f.montantTTC !== undefined && f.montantTTC !== null ? f.montantTTC : '-'} €</span>{' | '}
                                                                <span><strong>Date :</strong> {dateAffiche ? dateAffiche.toLocaleDateString() : '-'}</span>{' | '}
                                                                <span><strong>Statut :</strong> {f.statutFacture || f.statut || '-'}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }) : "-"}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Agents assignés</h4>
                                </Card.Header>
                                <Card.Body>
                                    {agents.length > 0 ? (
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>Nom</th>
                                                    <th>Email</th>
                                                    <th>Téléphone</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {agents.map(a => (
                                                    <tr key={a.id}>
                                                        <td>{a.nom} {a.prenom}</td>
                                                        <td>{a.email}</td>
                                                        <td>{a.telephone}</td>
                                                        <td>
                                                            <Link to={`/agents/${a.id}`} className="btn btn-sm btn-outline-primary">
                                                                <i className="bi bi-eye"></i>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="bi bi-exclamation-triangle"></i> Aucun agent affecté
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Rapports d'intervention</h4>
                                </Card.Header>
                                <Card.Body>
                                    {rapports.length > 0 ? (
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Date</th>
                                                    <th>Titre</th>
                                                    <th>Description</th>
                                                    <th>Statut</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rapports.map(r => (
                                                    <tr key={r.id}>
                                                        <td>{r.id}</td>
                                                        <td>{formatDate(r.dateIntervention)}</td>
                                                        <td>{r.titre || '-'}</td>
                                                        <td>{r.description || '-'}</td>
                                                        <td>{r.statut ? getStatusBadge(r.statut) : '-'}</td>
                                                        <td>
                                                            <Link to={`/rapports/${r.id}`} className="btn btn-sm btn-outline-primary">
                                                                <i className="bi bi-eye"></i>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="bi bi-exclamation-triangle"></i> Aucun rapport
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card className="mb-4">
                                <Card.Header className="bg-light">
                                    <h4 className="mb-0">Pointages</h4>
                                </Card.Header>
                                <Card.Body>
                                    {pointages.length > 0 ? (
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Date</th>
                                                    <th>Horaire</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pointages.map(p => (
                                                    <tr key={p.id}>
                                                        <td>{p.id}</td>
                                                        <td>{formatDate(p.date)}</td>
                                                        <td>{formatTime(p.heureDebut)} → {formatTime(p.heureFin)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="bi bi-exclamation-triangle"></i> Aucun pointage
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-3">
                        <Button variant="primary" as={Link} to={`/missions/edit/${mission.id}`}>
                            <i className="bi bi-pencil"></i> Modifier
                        </Button>
                        <Button variant="secondary" as={Link} to="/missions">
                            <i className="bi bi-arrow-left"></i> Retour à la liste
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
