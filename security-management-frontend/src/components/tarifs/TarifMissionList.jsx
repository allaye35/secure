import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Form, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faPlus, faSearch, faEuroSign, faMoon, faCalendarWeek, faCalendarDay, faCalendarCheck, faPercent } from "@fortawesome/free-solid-svg-icons";


export default function TarifMissionList() {
    const [tarifs, setTarifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtreTexte, setFiltreTexte] = useState("");
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const navigate = useNavigate();    useEffect(() => {
        TarifMissionService.getAll()
            .then(({ data }) => setTarifs(data))
            .catch((err) => setError("Erreur de chargement des tarifs: " + (err.response?.data?.message || err.message)))
            .finally(() => setLoading(false));
    }, []);
    
    // Fonction pour trier les tarifs
    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
    };
    
    // Fonction pour filtrer les tarifs
    const filteredTarifs = tarifs.filter((tarif) => {
        const searchText = filtreTexte.toLowerCase();
        return (
            tarif.typeMission?.toLowerCase().includes(searchText) ||
            tarif.prixUnitaireHT?.toString().includes(searchText) ||
            tarif.id?.toString().includes(searchText)
        );
    });
    
    // Fonction pour trier les tarifs
    const sortedTarifs = [...filteredTarifs].sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];
        
        if (typeof valueA === "string") {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });    const handleDelete = (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce tarif ? Cette action est irréversible.")) return;
        
        setLoading(true);
        TarifMissionService.delete(id)
            .then(() => {
                setTarifs(t => t.filter(x => x.id !== id));
                // Ajoutez une alerte de succès si vous avez un système de notifications
            })
            .catch((err) => {
                setError("Échec de la suppression: " + (err.response?.data?.message || err.message));
            })
            .finally(() => setLoading(false));
    };
    
    // Formatage du prix pour un affichage plus agréable
    const formatPrix = (prix) => {
        return Number(prix).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    };
    
    // Formatage du pourcentage
    const formatPourcentage = (pourcentage) => {
        return pourcentage ? `${pourcentage}%` : "-";
    };

    if (loading && tarifs.length === 0) {
        return (
            <Container fluid className="py-4">
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement des tarifs de mission...</p>
                </div>
            </Container>
        );
    }    return (
        <Container fluid className="py-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Card className="shadow border-0">
                <Card.Header className="bg-primary bg-gradient text-white py-3">
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="m-0 fw-bold">
                                <FontAwesomeIcon icon={faEuroSign} className="me-2" />
                                Tarifs des Missions
                            </h4>
                        </Col>
                        <Col xs="auto">
                            <Button 
                                variant="light" 
                                className="d-flex align-items-center rounded-pill" 
                                onClick={() => navigate("/tarifs/create")}
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Nouveau tarif
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>
                
                <Card.Body>
                    <Row className="mb-4">
                        <Col md={6} lg={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher par type, prix..."
                                    value={filtreTexte}
                                    onChange={(e) => setFiltreTexte(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    {loading && tarifs.length > 0 ? (
                        <div className="text-center my-3">
                            <Spinner animation="border" size="sm" variant="primary" />
                            <span className="ms-2">Mise à jour...</span>
                        </div>
                    ) : null}

                    <div className="table-responsive">
                        <Table hover className="align-middle border-bottom">
                            <thead className="bg-light">
                                <tr>
                                    <th 
                                        style={{cursor: 'pointer'}} 
                                        onClick={() => handleSort("id")}
                                        className={sortField === "id" ? "text-primary" : ""}
                                    >
                                        ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th 
                                        style={{cursor: 'pointer'}} 
                                        onClick={() => handleSort("typeMission")}
                                        className={sortField === "typeMission" ? "text-primary" : ""}
                                    >
                                        Type mission {sortField === "typeMission" && (sortDirection === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th 
                                        style={{cursor: 'pointer'}} 
                                        onClick={() => handleSort("prixUnitaireHT")}
                                        className={sortField === "prixUnitaireHT" ? "text-primary" : ""}
                                    >
                                        <FontAwesomeIcon icon={faEuroSign} className="me-1" />
                                        Prix HT {sortField === "prixUnitaireHT" && (sortDirection === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th>
                                        <FontAwesomeIcon icon={faMoon} className="me-1" />
                                        Nuit (%)
                                    </th>
                                    <th>
                                        <FontAwesomeIcon icon={faCalendarWeek} className="me-1" />
                                        Weekend (%)
                                    </th>
                                    <th>
                                        <FontAwesomeIcon icon={faCalendarDay} className="me-1" />
                                        Dimanche (%)
                                    </th>
                                    <th>
                                        <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                                        Férié (%)
                                    </th>
                                    <th>
                                        <FontAwesomeIcon icon={faPercent} className="me-1" />
                                        TVA
                                    </th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTarifs.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-muted">
                                            {filtreTexte 
                                                ? "Aucun tarif ne correspond à votre recherche" 
                                                : "Aucun tarif enregistré"}
                                        </td>
                                    </tr>
                                ) : sortedTarifs.map(tarif => (
                                    <tr key={tarif.id}>
                                        <td>{tarif.id}</td>
                                        <td>
                                            <Badge 
                                                bg="light" 
                                                text="dark" 
                                                className="border border-1 px-3 py-2"
                                            >
                                                {tarif.typeMission}
                                            </Badge>
                                        </td>
                                        <td className="fw-bold">{formatPrix(tarif.prixUnitaireHT)}</td>
                                        <td>{formatPourcentage(tarif.majorationNuit)}</td>
                                        <td>{formatPourcentage(tarif.majorationWeekend)}</td>
                                        <td>{formatPourcentage(tarif.majorationDimanche)}</td>
                                        <td>{formatPourcentage(tarif.majorationFerie)}</td>
                                        <td>{formatPourcentage(tarif.tauxTVA)}</td>
                                        <td className="text-center">
                                            <Button 
                                                variant="outline-info" 
                                                size="sm" 
                                                className="me-2" 
                                                onClick={() => navigate(`/tarifs/${tarif.id}`)}
                                                title="Voir les détails"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </Button>
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="me-2"
                                                onClick={() => navigate(`/tarifs/edit/${tarif.id}`)}
                                                title="Modifier"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => handleDelete(tarif.id)}
                                                title="Supprimer"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    
                    <div className="mt-3 text-end">
                        <small className="text-muted">
                            {sortedTarifs.length} {sortedTarifs.length > 1 ? "tarifs" : "tarif"} trouvé{sortedTarifs.length > 1 ? "s" : ""}
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
