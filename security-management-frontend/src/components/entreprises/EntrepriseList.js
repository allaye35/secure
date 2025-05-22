// src/components/entreprises/EntrepriseList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Container, Row, Col, Card, Badge, Form, InputGroup, OverlayTrigger, Tooltip, Popover } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faEdit, faTrash, faSearch, faBuilding, faFilter, faFileInvoice, faFileContract } from "@fortawesome/free-solid-svg-icons";
import EntrepriseService from "../../services/EntrepriseService";
import DevisService from "../../services/DevisService";
import ContratDeTravailService from "../../services/ContratDeTravailService";

export default function EntrepriseList() {
    const [entreprises, setEntreprises] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [allDevis, setAllDevis] = useState([]);
    const [allContrats, setAllContrats] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    /* chargement initial */
    useEffect(() => {
        setLoading(true);
        
        // Chargement des entreprises, devis et contrats en parallèle
        Promise.all([
            EntrepriseService.getAllEntreprises(),
            DevisService.getAll(),
            ContratDeTravailService.getAll()
        ])
        .then(([entreprisesData, devisData, contratsRes]) => {
            setEntreprises(entreprisesData || []);
            setAllDevis(devisData || []);
            setAllContrats(contratsRes?.data || []);
            setDataLoaded(true);
            setLoading(false);
        })
        .catch(err => {
            console.error("Erreur chargement des données :", err);
            setLoading(false);
        });
    }, []);

    /* suppression */
    const handleDelete = id => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;
        
        setLoading(true);
        EntrepriseService.deleteEntreprise(id)
            .then(() => {
                setEntreprises(old => old.filter(e => e.id !== id));
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur suppression :", err);
                setLoading(false);
                alert("Erreur lors de la suppression de l'entreprise");
            });
    };    // Filtrer les entreprises en fonction du terme de recherche
    const filteredEntreprises = (entreprises || []).filter(e => 
        e?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e?.siretPrestataire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.ville?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container fluid className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary bg-gradient text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="m-0">
                                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                Liste des Entreprises
                            </h4>
                        </Col>
                        <Col xs="auto">
                            <Link to="/entreprises/create">
                                <Button variant="success" size="sm" className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                                    Nouvelle Entreprise
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Rechercher par nom, SIRET ou ville..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <Badge bg="primary" className="me-1">
                                {filteredEntreprises.length} Entreprise(s)
                            </Badge>
                        </Col>
                    </Row>

                    <div className="table-responsive">
                        <Table hover striped className="align-middle">                            <thead className="table-light">
                                <tr>
                                    <th>Nom</th>
                                    <th>SIRET</th>
                                    <th>Représentant</th>
                                    <th>Adresse</th>
                                    <th>Contact</th>
                                    <th>Devis</th>
                                    <th>Contrats</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (                                    <tr>
                                        <td colSpan="8" className="text-center py-3">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Chargement...</span>
                                            </div>
                                        </td>
                                    </tr>) : !dataLoaded ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-3">
                                            Chargement des données associées...
                                        </td>
                                    </tr>
                                ) : filteredEntreprises.length ? (
                                    filteredEntreprises.map(e => (
                                        <tr key={e.id}>
                                            <td className="fw-bold">{e.nom}</td>
                                            <td>{e.siretPrestataire}</td>
                                            <td>{e.representantPrestataire}</td>
                                            <td>
                                                <small>
                                                    {e.numeroRue} {e.rue}<br />
                                                    {e.codePostal} {e.ville}, {e.pays}
                                                </small>
                                            </td>                                            <td>{e.telephone}</td>
                                            <td>
                                                {e.devisIds?.length ? (
                                                    <OverlayTrigger
                                                        placement="left"
                                                        overlay={
                                                            <Popover id={`devis-popover-${e.id}`} style={{ maxWidth: '400px' }}>
                                                                <Popover.Header as="h3">
                                                                    <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                                                                    Devis associés
                                                                </Popover.Header>
                                                                <Popover.Body className="p-0">
                                                                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                                                        <Table size="sm" borderless>
                                                                            <thead className="bg-light">
                                                                                <tr>
                                                                                    <th>Référence</th>
                                                                                    <th>Description</th>
                                                                                    <th>Date</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {allDevis
                                                                                    .filter(d => e.devisIds.includes(d.id))
                                                                                    .map(devis => (
                                                                                        <tr key={devis.id}>
                                                                                            <td>{devis.referenceDevis || 'N/A'}</td>
                                                                                            <td>{devis.description?.length > 30 ? devis.description.substring(0, 30) + '...' : devis.description || 'Sans description'}</td>
                                                                                            <td>{devis.dateCreation ? new Date(devis.dateCreation).toLocaleDateString() : 'N/A'}</td>
                                                                                        </tr>
                                                                                    ))
                                                                                }
                                                                            </tbody>
                                                                        </Table>
                                                                    </div>
                                                                </Popover.Body>
                                                            </Popover>
                                                        }
                                                        trigger={["hover", "focus"]}
                                                    >
                                                        <Badge bg="info" pill className="cursor-pointer">
                                                            <FontAwesomeIcon icon={faFileInvoice} className="me-1" />
                                                            {e.devisIds.length}
                                                        </Badge>
                                                    </OverlayTrigger>
                                                ) : (
                                                    <Badge bg="secondary" pill>0</Badge>
                                                )}
                                            </td>
                                            <td>
                                                {e.contratsDeTravailIds?.length ? (
                                                    <OverlayTrigger
                                                        placement="left"
                                                        overlay={
                                                            <Popover id={`contrats-popover-${e.id}`} style={{ maxWidth: '400px' }}>
                                                                <Popover.Header as="h3">
                                                                    <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                                                    Contrats associés
                                                                </Popover.Header>
                                                                <Popover.Body className="p-0">
                                                                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                                                        <Table size="sm" borderless>
                                                                            <thead className="bg-light">
                                                                                <tr>
                                                                                    <th>Référence</th>
                                                                                    <th>Type</th>
                                                                                    <th>Agent</th>
                                                                                    <th>Dates</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {allContrats
                                                                                    .filter(c => e.contratsDeTravailIds?.includes(c.id))
                                                                                    .map(contrat => (
                                                                                        <tr key={contrat.id}>
                                                                                            <td>{contrat.referenceContrat || 'N/A'}</td>
                                                                                            <td>{contrat.typeContrat || 'N/A'}</td>
                                                                                            <td>{contrat.agentDeSecuriteId || 'N/A'}</td>
                                                                                            <td>
                                                                                                {contrat.dateDebut ? new Date(contrat.dateDebut).toLocaleDateString() : 'N/A'}
                                                                                                {contrat.dateFin && ` au ${new Date(contrat.dateFin).toLocaleDateString()}`}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))
                                                                                }
                                                                            </tbody>
                                                                        </Table>
                                                                    </div>
                                                                </Popover.Body>
                                                            </Popover>
                                                        }
                                                        trigger={["hover", "focus"]}
                                                    >
                                                        <Badge bg="info" pill className="cursor-pointer">
                                                            <FontAwesomeIcon icon={faFileContract} className="me-1" />
                                                            {e.contratsDeTravailIds.length}
                                                        </Badge>
                                                    </OverlayTrigger>
                                                ) : (
                                                    <Badge bg="secondary" pill>0</Badge>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Link to={`/entreprises/${e.id}`}>
                                                        <Button variant="outline-primary" size="sm" title="Voir le détail">
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/entreprises/edit/${e.id}`}>
                                                        <Button variant="outline-warning" size="sm" title="Modifier">
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm" 
                                                        onClick={() => handleDelete(e.id)}
                                                        title="Supprimer"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-3">
                                            Aucune entreprise disponible.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
