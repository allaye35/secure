import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
    Container, Row, Col, Card, Badge, Spinner, 
    Button, Table, Alert, Nav, Tab, ListGroup 
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUser, faBuilding, faEnvelope, faPhone, faMapMarkerAlt, 
    faIdCard, faCreditCard, faArrowLeft, faEdit, faFilePdf,
    faFileContract, faClipboardList, faHistory, faFileInvoice
} from "@fortawesome/free-solid-svg-icons";
import ClientService from "../../services/ClientService";
import "../../styles/ClientDetail.css";

export default function ClientDetail() {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pour simuler des données associées (à remplacer par de vraies API)
    const [contrats, setContrats] = useState([]);
    const [devis, setDevis] = useState([]);
    const [factures, setFactures] = useState([]);
    const [activite, setActivite] = useState([]);    useEffect(() => {
        setLoading(true);
        ClientService.getById(id)
            .then(data => {
                // Vérifier si les données existent et sont complètes
                if (data && data.id) {
                    console.log("Données client reçues:", data);
                    // Normalisation des données pour éviter les problèmes d'affichage
                    const normalizedData = {
                        ...data,
                        // Ajouter des valeurs par défaut pour les champs qui pourraient être undefined
                        nom: data.nom || '',
                        prenom: data.prenom || '',
                        email: data.email || '',
                        telephone: data.telephone || '',
                        adresse: data.adresse || '',
                        numeroRue: data.numeroRue || '',
                        codePostal: data.codePostal || '',
                        ville: data.ville || '',
                        pays: data.pays || 'France',
                        role: data.role || 'USER',
                        typeClient: data.typeClient || 'CLIENT',
                        siege: data.siege || '',
                        representant: data.representant || '',
                        numeroSiret: data.numeroSiret || '',
                        modeContactPrefere: data.modeContactPrefere || ''
                    };
                    setClient(normalizedData);
                    // Simulation de chargement de données associées (à remplacer par des appels API réels)
                    simulateRelatedData(data.id);
                } else {
                    console.error("Données client incomplètes:", data);
                    setError("Les données du client sont incomplètes ou invalides.");
                }
            })
            .catch(err => {
                console.error("Erreur lors du chargement du client:", err);
                setError("Une erreur est survenue lors du chargement des détails du client.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    // Fonction pour simuler le chargement des données associées
    const simulateRelatedData = (clientId) => {
        // Simulation de contrats (à remplacer par un appel API réel)
        setContrats([
            { id: 101, reference: "CONT-2025-101", dateDebut: "2025-01-01", dateFin: "2025-12-31", statut: "ACTIF", montant: 1200 },
            { id: 102, reference: "CONT-2025-102", dateDebut: "2025-02-15", dateFin: "2025-08-15", statut: "EN_COURS", montant: 850 }
        ]);
        
        // Simulation de devis (à remplacer par un appel API réel)
        setDevis([
            { id: 201, reference: "DEV-2025-201", dateCreation: "2025-01-15", statut: "ACCEPTE", montant: 1200 },
            { id: 202, reference: "DEV-2025-202", dateCreation: "2025-03-10", statut: "EN_ATTENTE", montant: 950 }
        ]);
        
        // Simulation de factures (à remplacer par un appel API réel)
        setFactures([
            { id: 301, reference: "FAC-2025-301", dateEmission: "2025-02-01", dateEcheance: "2025-03-01", statut: "PAYEE", montant: 400 },
            { id: 302, reference: "FAC-2025-302", dateEmission: "2025-03-15", dateEcheance: "2025-04-15", statut: "EN_ATTENTE", montant: 350 }
        ]);
        
        // Simulation d'activités récentes (à remplacer par un appel API réel)
        setActivite([
            { id: 1, type: "CONNEXION", date: "2025-05-15T10:30:00", description: "Connexion à l'espace client" },
            { id: 2, type: "DEVIS", date: "2025-05-10T14:20:00", description: "Consultation du devis DEV-2025-202" },
            { id: 3, type: "CONTRAT", date: "2025-05-05T09:45:00", description: "Signature du contrat CONT-2025-101" }
        ]);
    };

    // Fonction pour formater une date (YYYY-MM-DD -> DD/MM/YYYY)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    // Fonction pour déterminer la couleur du badge selon le statut
    const getBadgeColor = (statut) => {
        switch (statut) {
            case "ACTIF": 
            case "ACCEPTE": 
            case "PAYEE": 
                return "success";
            case "EN_COURS": 
            case "EN_ATTENTE": 
                return "warning";
            case "REJETE": 
            case "EXPIRE": 
                return "danger";
            default: 
                return "secondary";
        }
    };

    if (loading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des détails du client...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    <Alert.Heading>Erreur</Alert.Heading>
                    <p>{error}</p>
                    <Button 
                        variant="outline-danger" 
                        as={Link} 
                        to="/clients">
                        Retour à la liste des clients
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!client) {
        return (
            <Container className="my-5">
                <Alert variant="warning">
                    <Alert.Heading>Client introuvable</Alert.Heading>
                    <p>Le client demandé n'existe pas ou a été supprimé.</p>
                    <Button 
                        variant="outline-primary" 
                        as={Link} 
                        to="/clients">
                        Retour à la liste des clients
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="my-5 client-detail-container">
            <Row className="mb-4">                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">
                            {client.typeClient === 'ENTREPRISE' ? (
                                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                            ) : (
                                <FontAwesomeIcon icon={faUser} className="me-2" />
                            )}
                            {client.typeClient === 'ENTREPRISE' 
                                ? (client.siege || 'Entreprise') 
                                : ((client.prenom || client.nom) 
                                    ? `${client.prenom || ''} ${client.nom || ''}`.trim() 
                                    : `Client #${client.id}`)
                            }
                        </h2>
                        <div>
                            <Button 
                                as={Link} 
                                to={`/clients/edit/${client.id}`}
                                variant="warning" 
                                className="me-2"
                            >
                                <FontAwesomeIcon icon={faEdit} className="me-2" />
                                Modifier
                            </Button>
                            <Button 
                                as={Link} 
                                to="/clients"
                                variant="outline-secondary"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                Retour
                            </Button>
                        </div>
                    </div>
                    <div className="mt-2">
                        <Badge bg={client.role === 'ADMIN' ? 'danger' : 'primary'} className="me-2">
                            {client.role || "USER"}
                        </Badge>
                        <Badge bg={client.typeClient === 'ENTREPRISE' ? 'success' : 'info'}>
                            {client.typeClient || "CLIENT"}
                        </Badge>
                    </div>
                </Col>
            </Row>

            <Tab.Container defaultActiveKey="details">
                <Row>
                    <Col lg={3} md={4} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Header className="bg-light">
                                <strong>Navigation</strong>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link eventKey="details">
                                            <FontAwesomeIcon icon={faIdCard} className="me-2" />
                                            Informations générales
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="contrats">
                                            <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                            Contrats
                                            <Badge bg="primary" pill className="ms-2">{contrats.length}</Badge>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="devis">
                                            <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                                            Devis
                                            <Badge bg="primary" pill className="ms-2">{devis.length}</Badge>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="factures">
                                            <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                                            Factures
                                            <Badge bg="primary" pill className="ms-2">{factures.length}</Badge>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="activite">
                                            <FontAwesomeIcon icon={faHistory} className="me-2" />
                                            Activité récente
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={9} md={8}>
                        <Card className="shadow-sm">
                            <Card.Body className="p-0">
                                <Tab.Content>
                                    {/* Onglet Informations générales */}
                                    <Tab.Pane eventKey="details">
                                        <div className="p-4">
                                            <h4 className="mb-4">Informations du client</h4>
                                            <Row>
                                                <Col md={6}>
                                                    <Card className="mb-4">
                                                        <Card.Header className="bg-light">
                                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                                            Informations personnelles
                                                        </Card.Header>                                                        <ListGroup variant="flush">
                                                            <ListGroup.Item className="d-flex justify-content-between">
                                                                <strong>ID:</strong> 
                                                                <span className="text-primary">{client.id}</span>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item className="d-flex justify-content-between">
                                                                <strong>Username:</strong> 
                                                                <span>{client.username || 'Non défini'}</span>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item className="d-flex justify-content-between">
                                                                <strong>Rôle:</strong> 
                                                                <Badge bg={client.role === 'ADMIN' ? 'danger' : 'primary'}>
                                                                    {client.role || "USER"}
                                                                </Badge>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item className="d-flex justify-content-between">
                                                                <strong>Type:</strong> 
                                                                <Badge bg={client.typeClient === 'ENTREPRISE' ? 'success' : 'info'}>
                                                                    {client.typeClient || "CLIENT"}
                                                                </Badge>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item className="d-flex justify-content-between">
                                                                <strong>Nom:</strong> 
                                                                <span className={!client.nom ? 'text-muted fst-italic' : ''}>
                                                                    {client.nom || 'Non renseigné'}
                                                                </span>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item className="d-flex justify-content-between">
                                                                <strong>Prénom:</strong> 
                                                                <span className={!client.prenom ? 'text-muted fst-italic' : ''}>
                                                                    {client.prenom || 'Non renseigné'}
                                                                </span>
                                                            </ListGroup.Item>
                                                            {client.typeClient === 'ENTREPRISE' && (
                                                                <>
                                                                    <ListGroup.Item className="d-flex justify-content-between">
                                                                        <strong>Entreprise:</strong> 
                                                                        <span className={!client.siege ? 'text-muted fst-italic' : ''}>
                                                                            {client.siege || 'Non renseigné'}
                                                                        </span>
                                                                    </ListGroup.Item>
                                                                    <ListGroup.Item className="d-flex justify-content-between">
                                                                        <strong>Représentant:</strong> 
                                                                        <span className={!client.representant ? 'text-muted fst-italic' : ''}>
                                                                            {client.representant || 'Non renseigné'}
                                                                        </span>
                                                                    </ListGroup.Item>
                                                                    <ListGroup.Item className="d-flex justify-content-between">
                                                                        <strong>SIRET:</strong> 
                                                                        <span className={!client.numeroSiret ? 'text-muted fst-italic' : ''}>
                                                                            {client.numeroSiret || 'Non renseigné'}
                                                                        </span>
                                                                    </ListGroup.Item>
                                                                </>
                                                            )}
                                                        </ListGroup>
                                                    </Card>
                                                </Col>
                                                
                                                <Col md={6}>
                                                    <Card className="mb-4">
                                                        <Card.Header className="bg-light">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                            Coordonnées
                                                        </Card.Header>                                                        <ListGroup variant="flush">
                                                            <ListGroup.Item>
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                                                                        <strong>Email:</strong>
                                                                    </div>
                                                                    {client.email ? (
                                                                        <a href={`mailto:${client.email}`} className="text-decoration-none">
                                                                            {client.email}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-muted fst-italic">Non renseigné</span>
                                                                    )}
                                                                </div>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                                                                        <strong>Téléphone:</strong>
                                                                    </div>
                                                                    {client.telephone ? (
                                                                        <a href={`tel:${client.telephone}`} className="text-decoration-none">
                                                                            {client.telephone}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-muted fst-italic">Non renseigné</span>
                                                                    )}
                                                                </div>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <div className="d-flex justify-content-between">
                                                                    <strong>Adresse:</strong> 
                                                                    <span className={!client.adresse ? 'text-muted fst-italic' : ''}>
                                                                        {client.adresse ? 
                                                                            (client.numeroRue ? `${client.numeroRue} ` : '') + client.adresse 
                                                                            : 'Non renseignée'}
                                                                    </span>
                                                                </div>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <div className="d-flex justify-content-between">
                                                                    <strong>Code postal / Ville:</strong> 
                                                                    <span className={!client.codePostal && !client.ville ? 'text-muted fst-italic' : ''}>
                                                                        {client.codePostal || client.ville ? 
                                                                            `${client.codePostal || ''} ${client.ville || ''}`.trim() 
                                                                            : 'Non renseigné'}
                                                                    </span>
                                                                </div>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <div className="d-flex justify-content-between">
                                                                    <strong>Pays:</strong> 
                                                                    <span>{client.pays || 'France'}</span>
                                                                </div>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <div className="d-flex justify-content-between">
                                                                    <strong>Mode contact préféré:</strong> 
                                                                    <span className={!client.modeContactPrefere ? 'text-muted fst-italic' : ''}>
                                                                        {client.modeContactPrefere || 'Non défini'}
                                                                    </span>
                                                                </div>
                                                            </ListGroup.Item>
                                                        </ListGroup>
                                                    </Card>
                                                </Col>
                                            </Row>                                            {/* Carte pour visualiser l'adresse */}
                                            {client.adresse ? (
                                                <Card className="mb-4">
                                                    <Card.Header className="bg-light">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span>
                                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-danger" />
                                                                Localisation
                                                            </span>
                                                            <Badge bg="info">
                                                                {`${client.adresse}${client.codePostal ? ', ' + client.codePostal : ''}${client.ville ? ' ' + client.ville : ''}`}
                                                            </Badge>
                                                        </div>
                                                    </Card.Header>
                                                    <Card.Body className="p-0">
                                                        <div className="embed-responsive embed-responsive-16by9">
                                                            <iframe
                                                                title="Carte du client"
                                                                className="embed-responsive-item map-iframe"
                                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                                                    `${client.adresse} ${client.codePostal || ''} ${client.ville || ''} ${client.pays || 'France'}`
                                                                )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ) : (
                                                <Alert variant="warning" className="mb-4 d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-3 fa-lg" />
                                                    <div>
                                                        <strong>Localisation non disponible</strong>
                                                        <p className="mb-0">L'adresse du client n'est pas renseignée.</p>
                                                    </div>
                                                </Alert>
                                            )}
                                        </div>
                                    </Tab.Pane>

                                    {/* Onglet Contrats */}
                                    <Tab.Pane eventKey="contrats">
                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h4 className="mb-0">Contrats</h4>
                                                <Button variant="success" size="sm">
                                                    <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                                    Nouveau contrat
                                                </Button>
                                            </div>
                                            
                                            {contrats.length === 0 ? (
                                                <Alert variant="info">
                                                    Aucun contrat associé à ce client.
                                                </Alert>
                                            ) : (
                                                <Table hover responsive className="mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Référence</th>
                                                            <th>Date début</th>
                                                            <th>Date fin</th>
                                                            <th>Montant</th>
                                                            <th>Statut</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {contrats.map(contrat => (
                                                            <tr key={contrat.id}>
                                                                <td>{contrat.reference}</td>
                                                                <td>{formatDate(contrat.dateDebut)}</td>
                                                                <td>{formatDate(contrat.dateFin)}</td>
                                                                <td>{contrat.montant} €</td>
                                                                <td>
                                                                    <Badge bg={getBadgeColor(contrat.statut)}>
                                                                        {contrat.statut}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Button variant="outline-primary" size="sm" className="me-1">
                                                                        Voir
                                                                    </Button>
                                                                    <Button variant="outline-secondary" size="sm">
                                                                        <FontAwesomeIcon icon={faFilePdf} />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            )}
                                        </div>
                                    </Tab.Pane>

                                    {/* Onglet Devis */}
                                    <Tab.Pane eventKey="devis">
                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h4 className="mb-0">Devis</h4>
                                                <Button variant="success" size="sm">
                                                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                                                    Nouveau devis
                                                </Button>
                                            </div>
                                            
                                            {devis.length === 0 ? (
                                                <Alert variant="info">
                                                    Aucun devis associé à ce client.
                                                </Alert>
                                            ) : (
                                                <Table hover responsive className="mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Référence</th>
                                                            <th>Date création</th>
                                                            <th>Montant</th>
                                                            <th>Statut</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {devis.map(d => (
                                                            <tr key={d.id}>
                                                                <td>{d.reference}</td>
                                                                <td>{formatDate(d.dateCreation)}</td>
                                                                <td>{d.montant} €</td>
                                                                <td>
                                                                    <Badge bg={getBadgeColor(d.statut)}>
                                                                        {d.statut}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Button variant="outline-primary" size="sm" className="me-1">
                                                                        Voir
                                                                    </Button>
                                                                    <Button variant="outline-secondary" size="sm">
                                                                        <FontAwesomeIcon icon={faFilePdf} />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            )}
                                        </div>
                                    </Tab.Pane>

                                    {/* Onglet Factures */}
                                    <Tab.Pane eventKey="factures">
                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h4 className="mb-0">Factures</h4>
                                                <Button variant="success" size="sm">
                                                    <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                                                    Nouvelle facture
                                                </Button>
                                            </div>
                                            
                                            {factures.length === 0 ? (
                                                <Alert variant="info">
                                                    Aucune facture associée à ce client.
                                                </Alert>
                                            ) : (
                                                <Table hover responsive className="mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Référence</th>
                                                            <th>Date émission</th>
                                                            <th>Date échéance</th>
                                                            <th>Montant</th>
                                                            <th>Statut</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {factures.map(facture => (
                                                            <tr key={facture.id}>
                                                                <td>{facture.reference}</td>
                                                                <td>{formatDate(facture.dateEmission)}</td>
                                                                <td>{formatDate(facture.dateEcheance)}</td>
                                                                <td>{facture.montant} €</td>
                                                                <td>
                                                                    <Badge bg={getBadgeColor(facture.statut)}>
                                                                        {facture.statut}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Button variant="outline-primary" size="sm" className="me-1">
                                                                        Voir
                                                                    </Button>
                                                                    <Button variant="outline-secondary" size="sm">
                                                                        <FontAwesomeIcon icon={faFilePdf} />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            )}
                                        </div>
                                    </Tab.Pane>

                                    {/* Onglet Activité récente */}
                                    <Tab.Pane eventKey="activite">
                                        <div className="p-4">
                                            <h4 className="mb-4">Activité récente</h4>
                                            
                                            {activite.length === 0 ? (
                                                <Alert variant="info">
                                                    Aucune activité récente pour ce client.
                                                </Alert>
                                            ) : (
                                                <ListGroup>
                                                    {activite.map(item => (
                                                        <ListGroup.Item key={item.id} className="d-flex align-items-center">
                                                            <div className="activity-icon me-3">
                                                                <FontAwesomeIcon 
                                                                    icon={
                                                                        item.type === 'CONNEXION' ? faUser :
                                                                        item.type === 'DEVIS' ? faClipboardList :
                                                                        item.type === 'CONTRAT' ? faFileContract : 
                                                                        item.type === 'FACTURE' ? faFileInvoice : faUser
                                                                    } 
                                                                />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex align-items-center">
                                                                    <strong>{item.description}</strong>
                                                                    <Badge bg="light" text="dark" className="ms-2">{item.type}</Badge>
                                                                </div>
                                                                <small className="text-muted">
                                                                    {new Date(item.date).toLocaleString()}
                                                                </small>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))}                                                </ListGroup>
                                            )}
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
}
