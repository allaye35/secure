import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Form, InputGroup, Modal, Pagination, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faPlus, faSearch, faEuroSign, faMoon, faCalendarWeek, faCalendarDay, faCalendarCheck, faPercent, faSort, faSortUp, faSortDown, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "../../styles/TarifMissionList.css";


export default function TarifMissionList() {
    const [tarifs, setTarifs] = useState([]);
    const [filteredTarifs, setFilteredTarifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(""); // Message de succès
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tarifToDelete, setTarifToDelete] = useState(null);
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        TarifMissionService.getAll()
            .then(({ data }) => {
                setTarifs(data);
                setFilteredTarifs(data);
            })
            .catch(() => setError("Erreur de chargement des tarifs"))
            .finally(() => setLoading(false));
    }, []);

    // Filtrage des tarifs en fonction du terme de recherche
    useEffect(() => {
        const results = tarifs.filter(tarif => 
            tarif.typeMission.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tarif.id.toString().includes(searchTerm)
        );
        setFilteredTarifs(results);
    }, [searchTerm, tarifs]);

    // Tri des tarifs
    useEffect(() => {
        let sortedTarifs = [...filteredTarifs];
        sortedTarifs.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setFilteredTarifs(sortedTarifs);
    }, [sortConfig.key, sortConfig.direction]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key === columnName) {
            return sortConfig.direction === 'ascending' 
                ? <FontAwesomeIcon icon={faSortUp} className="ms-1" /> 
                : <FontAwesomeIcon icon={faSortDown} className="ms-1" />;
        }
        return <FontAwesomeIcon icon={faSort} className="ms-1 text-muted" />;
    };

    const confirmDelete = (id) => {
        setTarifToDelete(id);
        setShowDeleteModal(true);
    };    const handleDelete = () => {
        TarifMissionService.delete(tarifToDelete)
            .then(() => {
                setTarifs(t => t.filter(x => x.id !== tarifToDelete));
                setShowDeleteModal(false);
                setSuccess("Le tarif a été supprimé avec succès");
                setTimeout(() => setSuccess(""), 3000); // Effacer le message de succès après 3 secondes
            })
            .catch(() => {
                setShowDeleteModal(false);
                setError("Échec de la suppression");
                setTimeout(() => setError(""), 3000); // Effacer le message d'erreur après 3 secondes
            });
    };// Format currency
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return "-";
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
    };
    
    // Format percentage
    const formatPercent = (value) => {
        if (value === undefined || value === null) return "-";
        return new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value / 100);
    };
    
    // Gestion de la pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTarifs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTarifs.length / itemsPerPage);
    
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    // Rendu des liens de pagination
    const renderPaginationItems = () => {
        const items = [];
        const maxPagesToShow = 5; // Nombre maximum de pages à afficher
        
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;
        
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item 
                    key={i} 
                    active={i === currentPage}
                    onClick={() => paginate(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        
        return items;
    };
    
    if (loading) return (
        <div className="d-flex justify-content-center my-5">
            <Spinner animation="grow" role="status" variant="primary" className="me-2">
                <span className="visually-hidden">Chargement...</span>
            </Spinner>
            <Spinner animation="grow" role="status" variant="primary" className="me-2" style={{animationDelay: '0.2s'}}>
                <span className="visually-hidden">Chargement...</span>
            </Spinner>
            <Spinner animation="grow" role="status" variant="primary" style={{animationDelay: '0.4s'}}>
                <span className="visually-hidden">Chargement...</span>
            </Spinner>
        </div>
    );

    return (
        <Container fluid className="tarif-list py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white">
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="mb-0 fs-4">Tarifs Missions</h2>
                        </Col>
                        <Col xs="auto">
                            <Button variant="primary" onClick={() => navigate("/tarifs/create")} className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faPlus} className="me-2" /> Nouveau tarif
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>                <Card.Body>
                    {error && (
                        <Alert variant="danger" onClose={() => setError("")} dismissible>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
                            {success}
                        </Alert>
                    )}                    <Row className="mb-3">
                        <Col md={6} lg={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Rechercher par ID ou type de mission..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Réinitialiser la pagination lors d'une recherche
                                    }}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2} className="mt-2 mt-sm-0">
                            <InputGroup>
                                <InputGroup.Text>Afficher</InputGroup.Text>
                                <Form.Select 
                                    value={itemsPerPage} 
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </Form.Select>
                                <InputGroup.Text>par page</InputGroup.Text>
                            </InputGroup>
                        </Col>
                    </Row>

                    <div className="table-responsive">
                        <Table hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th onClick={() => requestSort('id')} className="sortable-header">
                                        ID {getSortIcon('id')}
                                    </th>
                                    <th onClick={() => requestSort('typeMission')} className="sortable-header">
                                        Type mission {getSortIcon('typeMission')}
                                    </th>
                                    <th onClick={() => requestSort('prixUnitaireHT')} className="sortable-header">
                                        Prix HT {getSortIcon('prixUnitaireHT')}
                                    </th>
                                    <th onClick={() => requestSort('majorationNuit')} className="sortable-header">
                                        <FontAwesomeIcon icon={faMoon} className="me-1" /> Nuit (%) {getSortIcon('majorationNuit')}
                                    </th>
                                    <th onClick={() => requestSort('majorationWeekend')} className="sortable-header">
                                        <FontAwesomeIcon icon={faCalendarWeek} className="me-1" /> Weekend (%) {getSortIcon('majorationWeekend')}
                                    </th>
                                    <th onClick={() => requestSort('majorationDimanche')} className="sortable-header">
                                        <FontAwesomeIcon icon={faCalendarDay} className="me-1" /> Dimanche (%) {getSortIcon('majorationDimanche')}
                                    </th>
                                    <th onClick={() => requestSort('majorationFerie')} className="sortable-header">
                                        <FontAwesomeIcon icon={faCalendarCheck} className="me-1" /> Férié (%) {getSortIcon('majorationFerie')}
                                    </th>
                                    <th onClick={() => requestSort('tauxTVA')} className="sortable-header">
                                        <FontAwesomeIcon icon={faPercent} className="me-1" /> TVA {getSortIcon('tauxTVA')}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTarifs.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-3 text-muted fst-italic">
                                            Aucun tarif trouvé
                                        </td>
                                    </tr>
                                ) : currentItems.map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <Badge bg="secondary">{t.id}</Badge>
                                        </td>
                                        <td>{t.typeMission}</td>
                                        <td>
                                            <span className="text-success fw-bold">
                                                <FontAwesomeIcon icon={faEuroSign} className="me-1" />
                                                {formatCurrency(t.prixUnitaireHT)}
                                            </span>
                                        </td>
                                        <td>{formatPercent(t.majorationNuit)}</td>
                                        <td>{formatPercent(t.majorationWeekend)}</td>
                                        <td>{formatPercent(t.majorationDimanche)}</td>
                                        <td>{formatPercent(t.majorationFerie)}</td>
                                        <td>{formatPercent(t.tauxTVA)}</td>
                                        <td>
                                            <div className="action-buttons d-flex flex-wrap">
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Voir les détails</Tooltip>}>
                                                    <Button variant="outline-primary" size="sm" className="me-1 mb-1" 
                                                        onClick={() => navigate(`/tarifs/${t.id}`)}>
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Modifier</Tooltip>}>
                                                    <Button variant="outline-success" size="sm" className="me-1 mb-1" 
                                                        onClick={() => navigate(`/tarifs/edit/${t.id}`)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Supprimer</Tooltip>}>
                                                    <Button variant="outline-danger" size="sm" className="mb-1"
                                                        onClick={() => confirmDelete(t.id)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </OverlayTrigger>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                    <Row className="align-items-center">
                        <Col>
                            <small className="text-muted">Affichage de {Math.min(indexOfFirstItem + 1, filteredTarifs.length)} à {Math.min(indexOfLastItem, filteredTarifs.length)} sur {filteredTarifs.length} tarifs</small>
                        </Col>
                        <Col xs="auto">
                            {totalPages > 1 && (
                                <Pagination className="mb-0">
                                    <Pagination.Prev onClick={goToPreviousPage} disabled={currentPage === 1}>
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </Pagination.Prev>
                                    {renderPaginationItems()}
                                    <Pagination.Next onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </Pagination.Next>
                                </Pagination>
                            )}
                        </Col>
                    </Row>
                </Card.Footer>
            </Card>

            {/* Modal de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Êtes-vous sûr de vouloir supprimer ce tarif ? Cette action ne peut pas être annulée.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
