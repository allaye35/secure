import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Card, Row, Col, Table, Badge, Spinner, Button, Breadcrumb } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faIdCard, faUser, faPhone, faEnvelope, faMapMarkerAlt, faFileInvoice, faEdit, faArrowLeft, faCheckCircle, faClock, faTimesCircle, faFileContract, faListAlt } from "@fortawesome/free-solid-svg-icons";
import EntrepriseService from "../../services/EntrepriseService";
import DevisService from "../../services/DevisService";
import ContratDeTravailService from "../../services/ContratDeTravailService";

export default function EntrepriseDetail() {
    const { id } = useParams();
    const [entreprise, setEntreprise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour stocker les détails des devis et contrats associés
    const [devisList, setDevisList] = useState([]);
    const [contratsList, setContratsList] = useState([]);
    const [devisLoading, setDevisLoading] = useState(false);
    const [contratsLoading, setContratsLoading] = useState(false);    useEffect(() => {
        setLoading(true);
        EntrepriseService.getEntrepriseById(id)
            .then(res => {
                const entrepriseData = res.data;
                setEntreprise(entrepriseData);
                setLoading(false);
                
                // Si l'entreprise a des devis, charger leurs détails
                if (entrepriseData.devisIds && entrepriseData.devisIds.length > 0) {
                    loadDevisDetails(entrepriseData.devisIds);
                }
                
                // Si l'entreprise a des contrats, charger leurs détails
                if (entrepriseData.contratsDeTravailIds && entrepriseData.contratsDeTravailIds.length > 0) {
                    loadContratsDetails(entrepriseData.contratsDeTravailIds);
                }
            })
            .catch(err => {
                console.error("Chargement entreprise :", err);
                setError("Impossible de charger les détails de l'entreprise");
                setLoading(false);
            });
    }, [id]);
    
    // Fonction pour charger les détails des devis
    const loadDevisDetails = (devisIds) => {
        setDevisLoading(true);
        Promise.all(
            devisIds.map(devisId => 
                DevisService.getById(devisId)
                    .then(res => res.data)
                    .catch(err => {
                        console.error(`Erreur lors du chargement du devis ${devisId}:`, err);
                        return null;
                    })
            )
        )
        .then(devisDetails => {
            setDevisList(devisDetails.filter(devis => devis !== null));
            setDevisLoading(false);
        });
    };
      // Fonction pour charger les détails des contrats
    const loadContratsDetails = (contratIds) => {
        setContratsLoading(true);
        Promise.all(
            contratIds.map(contratId => 
                ContratDeTravailService.getById(contratId)
                    .then(res => {
                        const contratData = res.data;
                        
                        // Si le contrat a un ID d'agent mais pas de nom, on pourrait enrichir les données ici
                        // Note: Cette partie est commentée car elle nécessiterait un service pour récupérer les détails de l'agent
                        /*
                        if (contratData.agentDeSecuriteId && !contratData.agentNom) {
                            return AgentService.getById(contratData.agentDeSecuriteId)
                                .then(agentRes => {
                                    return {
                                        ...contratData,
                                        agentNom: `${agentRes.data.nom} ${agentRes.data.prenom}`
                                    };
                                })
                                .catch(() => contratData);
                        }
                        */
                        
                        return contratData;
                    })
                    .catch(err => {
                        console.error(`Erreur lors du chargement du contrat ${contratId}:`, err);
                        return null;
                    })
            )
        )
        .then(contratsDetails => {
            setContratsList(contratsDetails.filter(contrat => contrat !== null));
            setContratsLoading(false);
        });
    };

    // Fonction pour afficher le statut avec le bon badge de couleur
    const renderStatutBadge = (statut) => {
        switch(statut?.toUpperCase()) {
            case "ACCEPTÉ":
            case "ACCEPTE":
            case "VALIDÉ":
            case "VALIDE":
                return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> {statut}</Badge>;
            case "EN ATTENTE":
            case "ATTENTE":
                return <Badge bg="warning"><FontAwesomeIcon icon={faClock} className="me-1" /> {statut}</Badge>;
            case "REFUSÉ":
            case "REFUSE":
            case "ANNULÉ":
            case "ANNULE":
                return <Badge bg="danger"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> {statut}</Badge>;
            default:
                return <Badge bg="secondary">{statut}</Badge>;
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Chargement des détails de l'entreprise...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <Link to="/entreprises">
                    <Button variant="secondary">
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour à la liste
                    </Button>
                </Link>
            </Container>
        );
    }

    if (!entreprise) return <p>Aucune donnée disponible</p>;    return (
        <Container fluid className="py-4">            {/* La navigation fil d'Ariane a été supprimée */}            <div className="bg-light p-3 rounded-3 shadow-sm mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0 text-primary fw-bold">
                        <FontAwesomeIcon icon={faBuilding} className="me-2" />
                        Fiche Entreprise: {entreprise.nom}
                    </h2>
                    
                    <div>
                        <Link to="/entreprises" className="me-2">
                            <Button variant="outline-primary" size="sm" className="rounded-pill px-3">
                                <FontAwesomeIcon icon={faListAlt} className="me-2" />
                                Liste des entreprises
                            </Button>
                        </Link>
                        
                        <Link to={`/entreprises/edit/${id}`}>
                            <Button variant="primary" size="sm" className="rounded-pill px-3">
                                <FontAwesomeIcon icon={faEdit} className="me-2" />
                                Modifier
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Row>
                <Col lg={8}>
                <Card className="shadow mb-4 border-0">
                        <Card.Header className="bg-primary bg-gradient text-white py-3">
                            <h4 className="m-0 fw-bold">
                                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                {entreprise.nom}
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>                                    <Card className="h-100 border-0">
                                        <Card.Body>
                                            <h5 className="text-primary border-bottom pb-2 mb-4">Informations générales</h5>
                                              <div className="mb-4">
                                                <div className="text-primary mb-1">
                                                    <FontAwesomeIcon icon={faIdCard} className="me-2" />
                                                    SIRET
                                                </div>
                                                <div className="fw-bold fs-5 border-bottom border-light pb-2">{entreprise.siretPrestataire || "Non renseigné"}</div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <div className="text-primary mb-1">
                                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                                    Représentant
                                                </div>
                                                <div className="fw-bold border-bottom border-light pb-2">{entreprise.representantPrestataire || "Non renseigné"}</div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="text-primary mb-1">
                                                    <FontAwesomeIcon icon={faPhone} className="me-2" />
                                                    Téléphone
                                                </div>
                                                <div className="fw-bold border-bottom border-light pb-2">{entreprise.telephone || "Non renseigné"}</div>
                                            </div>                                            <div className="mb-4">
                                                <div className="text-primary mb-1">
                                                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                                    Email
                                                </div>
                                                <div className="fw-bold border-bottom border-light pb-2">
                                                    {entreprise.email ? (
                                                        <a href={`mailto:${entreprise.email}`} className="text-decoration-none text-primary">
                                                            {entreprise.email}
                                                        </a>
                                                    ) : "Non renseigné"}
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>                                    <Card className="h-100 border-0">
                                        <Card.Body>
                                            <h5 className="text-primary border-bottom pb-2 mb-4">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                Adresse
                                            </h5>
                                            <address className="fs-6 mb-4">
                                                <strong className="fs-5">{entreprise.numeroRue} {entreprise.rue}</strong><br />
                                                {entreprise.codePostal} {entreprise.ville}<br />
                                                {entreprise.pays}<br />
                                            </address>

                                            <div className="mt-4">
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    className="rounded-pill px-3"
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                        `${entreprise.numeroRue} ${entreprise.rue}, ${entreprise.codePostal} ${entreprise.ville}, ${entreprise.pays}`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                    Voir sur la carte
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>                    <Card className="shadow mb-4 border-0">
                        <Card.Header className="bg-primary bg-opacity-75 bg-gradient text-white py-3">
                            <h5 className="m-0 fw-bold">
                                <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                                Devis associés {" "}
                                {entreprise.devisIds?.length ? 
                                    <Badge bg="light" text="dark" pill className="ms-2">{entreprise.devisIds.length}</Badge> : 
                                    <Badge bg="secondary" pill className="ms-2">0</Badge>
                                }
                            </h5>
                        </Card.Header><Card.Body>
                            {devisLoading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="info" size="sm" />
                                    <p className="mt-2">Chargement des devis...</p>
                                </div>
                            ) : entreprise.devisIds?.length ? (                                <Table hover responsive size="sm" className="border">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="text-primary">Référence</th>
                                            <th className="text-primary">Description</th>
                                            <th className="text-center text-primary">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {devisList.map(devis => (
                                            <tr key={devis.id}>                                                <td>
                                                    <Link to={`/devis/${devis.id}`} className="text-decoration-none fw-bold text-primary">
                                                        {devis.referenceDevis}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{maxWidth: "180px"}}>
                                                        {devis.description || "—"}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    {renderStatutBadge(devis.statut)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <FontAwesomeIcon icon={faFileInvoice} size="2x" className="mb-2" />
                                    <p>Aucun devis associé à cette entreprise.</p>
                                    <Link to="/devis/create">
                                        <Button variant="outline-primary" size="sm">
                                            Créer un devis
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </Card.Body>
                    </Card>                    <Card className="shadow mb-4 border-0">
                        <Card.Header className="bg-primary bg-opacity-50 bg-gradient text-white py-3">
                            <h5 className="m-0 fw-bold">
                                <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                Contrats de travail {" "}
                                {entreprise.contratsDeTravailIds?.length ? 
                                    <Badge bg="light" text="dark" pill className="ms-2">{entreprise.contratsDeTravailIds.length}</Badge> : 
                                    <Badge bg="secondary" pill className="ms-2">0</Badge>
                                }
                            </h5>
                        </Card.Header><Card.Body>
                            {contratsLoading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="success" size="sm" />
                                    <p className="mt-2">Chargement des contrats...</p>
                                </div>
                            ) : entreprise.contratsDeTravailIds?.length ? (                                <Table hover responsive size="sm" className="border">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="text-primary">Référence</th>
                                            <th className="text-primary">Agent</th>
                                            <th className="text-center text-primary">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contratsList.map(contrat => (
                                            <tr key={contrat.id}>                                                <td>
                                                    <Link to={`/contrats-de-travail/${contrat.id}`} className="text-decoration-none fw-bold text-primary">
                                                        <FontAwesomeIcon icon={faFileContract} className="me-1 text-primary" />
                                                        {contrat.referenceContrat || contrat.reference || "—"}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{maxWidth: "180px"}}>
                                                        <FontAwesomeIcon icon={faUser} className="me-1 text-secondary" />
                                                        {contrat.agentNom || contrat.agentDeSecuriteNom || (contrat.agentDeSecuriteId ? `Agent #${contrat.agentDeSecuriteId}` : "—")}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    {contrat.dateDebut ? new Date(contrat.dateDebut).toLocaleDateString() : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <FontAwesomeIcon icon={faFileContract} size="2x" className="mb-2" />
                                    <p>Aucun contrat de travail associé à cette entreprise.</p>
                                    <Link to="/contrats-de-travail/create">
                                        <Button variant="outline-success" size="sm">
                                            Créer un contrat
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
