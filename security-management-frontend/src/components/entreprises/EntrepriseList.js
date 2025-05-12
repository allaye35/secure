// src/components/entreprises/EntrepriseList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Container, Row, Col, Card, Badge, Form, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faEdit, faTrash, faSearch, faBuilding, faFilter } from "@fortawesome/free-solid-svg-icons";
import EntrepriseService from "../../services/EntrepriseService";

export default function EntrepriseList() {
    const [entreprises, setEntreprises] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    /* chargement initial */
    useEffect(() => {
        setLoading(true);
        EntrepriseService.getAllEntreprises()
            .then(res => {
                setEntreprises(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement entreprises :", err);
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
    };

    // Filtrer les entreprises en fonction du terme de recherche
    const filteredEntreprises = entreprises.filter(e => 
        e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.siretPrestataire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                        <Table hover striped className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Nom</th>
                                    <th>SIRET</th>
                                    <th>Représentant</th>
                                    <th>Adresse</th>
                                    <th>Contact</th>
                                    <th>Devis</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-3">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Chargement...</span>
                                            </div>
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
                                            </td>
                                            <td>{e.telephone}</td>                                            <td>
                                                {e.devisIds?.length ? (
                                                    <Badge bg="info" pill>{e.devisIds.length}</Badge>
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
