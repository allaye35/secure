// src/components/sites/SiteList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate }           from "react-router-dom";
import SiteService                     from "../../services/SiteService";
import { Button, Card, Container, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faPlus, faSearch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function SiteList() {
    const [sites, setSites] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const nav = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        SiteService.getAllSites()
            .then(({ data }) => {
                setSites(data);
                setFilteredSites(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error(error);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        const results = sites.filter(site => 
            site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.codePostal?.includes(searchTerm)
        );
        setFilteredSites(results);
    }, [searchTerm, sites]);

    const handleDelete = id => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce site ?")) return;
        
        setIsLoading(true);
        SiteService.deleteSite(id)
            .then(() => {
                setSites(sites.filter(s => s.id !== id));
                setIsLoading(false);
            })
            .catch(error => {
                console.error(error);
                setIsLoading(false);
                alert("Erreur lors de la suppression du site");
            });
    };

    return (
        <Container fluid className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary bg-gradient text-white d-flex justify-content-between align-items-center">
                    <div>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                        <span className="fw-bold fs-4">Liste des sites</span>
                    </div>
                    <Link to="/sites/create">
                        <Button variant="light" size="sm">
                            <FontAwesomeIcon icon={faPlus} className="me-1" /> Nouveau site
                        </Button>
                    </Link>
                </Card.Header>

                <Card.Body>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Rechercher par nom, ville ou code postal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    <div className="table-responsive">
                        <Table hover striped className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Adresse</th>
                                    <th>Ville</th>
                                    <th>Code postal</th>
                                    <th>Région</th>
                                    <th>Pays</th>
                                    <th>Missions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center">
                                            <div className="d-flex justify-content-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Chargement...</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSites.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-3">
                                            {searchTerm ? "Aucun site ne correspond à votre recherche" : "Aucun site enregistré"}
                                        </td>
                                    </tr>
                                ) : filteredSites.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td className="fw-semibold">{s.nom}</td>
                                        <td>
                                            {s.numero && s.rue ? `${s.numero} ${s.rue}` : (s.rue || "-")}
                                        </td>
                                        <td>{s.ville || "-"}</td>
                                        <td>{s.codePostal || "-"}</td>
                                        <td>{s.region || "-"}</td>
                                        <td>{s.pays || "-"}</td>
                                        <td>
                                            {Array.isArray(s.missionsIds) && s.missionsIds.length > 0 ? (
                                                <Badge bg="info" pill>
                                                    {s.missionsIds.length}
                                                </Badge>
                                            ) : "-"}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    onClick={() => nav(`/sites/${s.id}`)}
                                                    title="Voir détails"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </Button>
                                                <Button 
                                                    variant="outline-success" 
                                                    size="sm" 
                                                    onClick={() => nav(`/sites/edit/${s.id}`)}
                                                    title="Modifier"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(s.id)}
                                                    title="Supprimer"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                <Card.Footer className="text-muted">
                    <small>
                        {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} trouvé{filteredSites.length !== 1 ? 's' : ''}
                    </small>
                </Card.Footer>
            </Card>
        </Container>
    );
}
