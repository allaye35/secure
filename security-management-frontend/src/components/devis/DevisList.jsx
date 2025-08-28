import React, { useEffect, useState } from "react";
import { useNavigate, Link }                 from "react-router-dom";
import DevisService                    from "../../services/DevisService";
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Pagination, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileInvoice, faSearch, faPlus, faEdit, faTrash, 
  faEye, faSort, faSortUp, faSortDown, faFilter, faSync,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/DevisList.css";

// Statuts de devis (correspond à l'enum StatutDevis.java dans le backend)
const STATUTS = ["EN_ATTENTE", "ACCEPTE_PAR_ENTREPRISE", "REFUSE_PAR_ENTREPRISE", "VALIDE_PAR_CLIENT"];

export default function DevisList() {
    const [devis, setDevis]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const navigate = useNavigate();
    
    // Nouvelles variables de calcul pour les statistiques
    const [stats, setStats] = useState({
        totalHT: 0,
        totalTVA: 0, 
        totalTTC: 0,
        nombreDevis: 0,
        devisParStatut: {},
        nombreAgentsTotal: 0,
        quantiteTotal: 0
    });
    
    // État pour la pagination, le filtrage et le tri
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterStatut, setFilterStatut] = useState('');

    useEffect(() => {
        DevisService.getAll()
            .then(response => {
                if (response && response.data) {
                    if (Array.isArray(response.data)) {
                        setDevis(response.data);
                        
                        // Calcul des statistiques
                        const newStats = {
                            totalHT: 0,
                            totalTVA: 0,
                            totalTTC: 0,
                            nombreDevis: response.data.length,
                            devisParStatut: {},
                            nombreAgentsTotal: 0,
                            quantiteTotal: 0
                        };
                        
                        response.data.forEach(d => {
                            // Calcul des montants
                            newStats.totalHT += d.montantHT || 0;
                            newStats.totalTVA += d.montantTVA || 0;
                            newStats.totalTTC += d.montantTTC || 0;
                            
                            // Calcul des quantités
                            newStats.nombreAgentsTotal += d.nombreAgents || 0;
                            newStats.quantiteTotal += d.quantite || 0;
                            
                            // Comptage par statut
                            if (d.statut) {
                                newStats.devisParStatut[d.statut] = (newStats.devisParStatut[d.statut] || 0) + 1;
                            }
                        });
                        
                        setStats(newStats);
                    } else {
                        setError("Format de données inattendu");
                    }
                } else {
                    setError("Données non reçues");
                }
            })
            .catch(err => {
                console.error("Erreur lors du chargement des devis:", err);
                setError("Impossible de charger les devis");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Confirmer la suppression ?")) return;
        DevisService.delete(id)
            .then(() => setDevis(ds => ds.filter(d => d.id !== id)))
            .catch(() => alert("Échec de la suppression"));
    };    // Filtrer les devis en fonction de la recherche et du statut
    const filteredDevis = React.useMemo(() => {
        return devis.filter(d => {
            const matchesSearch = searchTerm === '' || 
                (d.referenceDevis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.id?.toString().includes(searchTerm.toLowerCase()));
                
            const matchesStatut = filterStatut === '' || d.statut === filterStatut;
            
            return matchesSearch && matchesStatut;
        });
    }, [devis, searchTerm, filterStatut]);
    
    // Trier les devis
    const sortedDevis = React.useMemo(() => {
        const sorted = [...filteredDevis];
        sorted.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            // Gérer les valeurs nulles ou undefined
            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';
            
            // Convertir les dates en objets Date pour la comparaison
            if (sortField === 'dateCreation' || sortField === 'dateValidite') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            // Comparer les valeurs
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [filteredDevis, sortField, sortDirection]);
    
    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDevis = sortedDevis.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedDevis.length / itemsPerPage);
    
    // Changer de page
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Faire défiler vers le haut de la liste
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Gérer le changement de tri
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    
    // Afficher l'icône de tri appropriée
    const renderSortIcon = (field) => {
        if (sortField !== field) {
            return <FontAwesomeIcon icon={faSort} className="ms-1 text-muted" />;
        }
        return <FontAwesomeIcon icon={sortDirection === 'asc' ? faSortUp : faSortDown} className="ms-1" />;
    };
    
    // Générer les éléments de pagination
    const renderPaginationItems = () => {
        const items = [];
        
        // Bouton précédent
        items.push(
            <Pagination.Prev 
                key="prev" 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            />
        );
        
        // Premier élément toujours visible
        items.push(
            <Pagination.Item 
                key={1} 
                active={currentPage === 1}
                onClick={() => handlePageChange(1)}
            >
                1
            </Pagination.Item>
        );
        
        // Si on a beaucoup de pages
        if (totalPages > 5) {
            // Si la page courante est > 2, montrer ellipsis
            if (currentPage > 2) {
                items.push(<Pagination.Ellipsis key="ellipsis1" />);
            }
            
            // Pages autour de la page courante
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                if (i !== 1 && i !== totalPages) { // Ne pas dupliquer la première et dernière page
                    items.push(
                        <Pagination.Item 
                            key={i} 
                            active={currentPage === i}
                            onClick={() => handlePageChange(i)}
                        >
                            {i}
                        </Pagination.Item>
                    );
                }
            }
            
            // Si la page courante est < totalPages-1, montrer ellipsis
            if (currentPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="ellipsis2" />);
            }
        } else {
            // Si peu de pages, afficher toutes les pages
            for (let i = 2; i < totalPages; i++) {
                items.push(
                    <Pagination.Item 
                        key={i} 
                        active={currentPage === i}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </Pagination.Item>
                );
            }
        }
        
        // Dernière page toujours visible si > 1
        if (totalPages > 1) {
            items.push(
                <Pagination.Item 
                    key={totalPages} 
                    active={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }
        
        // Bouton suivant
        items.push(
            <Pagination.Next 
                key="next" 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
            />
        );
        
        return items;
    };
    
    // Afficher un message de chargement
    if (loading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des devis...</p>
            </Container>
        );
    }
    
    // Afficher un message d'erreur
    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Card className="shadow-sm border-0 rounded-lg">
                <Card.Header className="bg-gradient bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                <FontAwesomeIcon icon={faFileInvoice} className="me-2" /> Gestion des devis
                            </h5>
                        </Col>
                        <Col xs="auto">
                            <Button 
                                variant="warning" 
                                className="fw-bold shadow-sm text-dark"
                                onClick={() => navigate("/devis/create")}
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-1" /> Nouveau devis
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>

<<<<<<< Updated upstream
            <table className="tbl-devis">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th># Missions</th>
                    <th>HT (€)</th>
                    <th>TTC (€)</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {devis.length === 0
                    ? (
                        <tr>
                            <td colSpan="7" className="no-data">
                                Aucun devis disponible
                            </td>
                        </tr>
                    )
                    : devis.map(d => (
                        <tr key={d.id}>
                            <td>{d.id}</td>
                            <td>{d.referenceDevis}</td>
                            <td>{d.statut}</td>
                            <td>{d.missionIds?.length || 0}</td>
                            <td>{(d.montantHT||0).toFixed?.(2) || d.montantHT}</td>
                            <td>{(d.montantTTC||0).toFixed?.(2) || d.montantTTC}</td>
                            <td className="actions">
                                <button onClick={() => navigate(`/devis/${d.id}`)}>👁️</button>
                                <button onClick={() => navigate(`/devis/edit/${d.id}`)}>✏️</button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </div>
=======
                <Card.Body className="p-4">
                    {/* Statistiques */}
                    <Row className="mb-4 g-3">
                        <Col md={6} lg={3}>
                            <Card className="border-0 shadow-sm bg-light">
                                <Card.Body className="p-3">
                                    <h6 className="text-muted mb-2">Total des devis</h6>
                                    <h3 className="mb-1">{stats.nombreDevis}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={3}>
                            <Card className="border-0 shadow-sm bg-light">
                                <Card.Body className="p-3">
                                    <h6 className="text-muted mb-2">Total TTC</h6>
                                    <h3 className="mb-1">{stats.totalTTC.toFixed(2)}€</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={3}>
                            <Card className="border-0 shadow-sm bg-light">
                                <Card.Body className="p-3">
                                    <h6 className="text-muted mb-2">Agents requis</h6>
                                    <h3 className="mb-1">{stats.nombreAgentsTotal}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={3}>
                            <Card className="border-0 shadow-sm bg-light">
                                <Card.Body className="p-3">
                                    <h6 className="text-muted mb-2">Quantité (h/j)</h6>
                                    <h3 className="mb-1">{stats.quantiteTotal}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    
                    {/* Filtres et recherche */}
                    <Row className="mb-4 align-items-center">
                        <Col md={5}>
                            <InputGroup className="shadow-sm">
                                <InputGroup.Text className="bg-white border-end-0">
                                    <FontAwesomeIcon icon={faSearch} className="text-primary" />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Rechercher un devis..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Retour à la première page lors de la recherche
                                    }}
                                    className="border-start-0"
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <InputGroup className="shadow-sm">
                                <InputGroup.Text className="bg-white border-end-0">
                                    <FontAwesomeIcon icon={faFilter} className="text-primary" />
                                </InputGroup.Text>
                                <Form.Select
                                    value={filterStatut}
                                    onChange={(e) => {
                                        setFilterStatut(e.target.value);
                                        setCurrentPage(1); // Retour à la première page lors du filtrage
                                    }}
                                    className="border-start-0"
                                >
                                    <option value="">Tous les statuts</option>
                                    {STATUTS.map(statut => (
                                        <option key={statut} value={statut}>{statut.replace(/_/g, ' ')}</option>
                                    ))}
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <InputGroup>
                                <InputGroup.Text>Afficher</InputGroup.Text>
                                <Form.Select 
                                    value={itemsPerPage} 
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Retour à la première page
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={2} className="d-flex justify-content-end">
                            <Button 
                                variant="outline-secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatut('');
                                    setSortField('id');
                                    setSortDirection('asc');
                                    setCurrentPage(1);
                                }}
                                className="me-2"
                                title="Réinitialiser les filtres"
                            >
                                <FontAwesomeIcon icon={faSync} />
                            </Button>
                            <Badge bg="info" className="d-flex align-items-center px-3 py-2">
                                {filteredDevis.length} devis
                            </Badge>
                        </Col>
                    </Row>
                    
                    {/* Tableau des devis */}
                    <div className="table-responsive">
                        <Table hover className="align-middle shadow-sm">
                            <thead className="bg-light">
                                <tr>
                                    <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>
                                        ID {renderSortIcon('id')}
                                    </th>
                                    <th onClick={() => handleSort('referenceDevis')} style={{cursor: 'pointer'}}>
                                        Référence {renderSortIcon('referenceDevis')}
                                    </th>
                                    <th onClick={() => handleSort('description')} style={{cursor: 'pointer'}}>
                                        Description {renderSortIcon('description')}
                                    </th>
                                    <th onClick={() => handleSort('statut')} style={{cursor: 'pointer'}}>
                                        Statut {renderSortIcon('statut')}
                                    </th>
                                    <th onClick={() => handleSort('dateCreation')} style={{cursor: 'pointer'}}>
                                        Date création {renderSortIcon('dateCreation')}
                                    </th>
                                    <th onClick={() => handleSort('dateValidite')} style={{cursor: 'pointer'}}>
                                        Date validité {renderSortIcon('dateValidite')}
                                    </th>
                                    <th>Entreprise</th>
                                    <th>Client</th>
                                    <th>Missions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentDevis.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center py-4">
                                            Aucun devis disponible
                                        </td>
                                    </tr>
                                ) : (
                                    currentDevis.map(d => (
                                        <tr key={d.id}>
                                            <td>{d.id}</td>
                                            <td>{d.referenceDevis}</td>
                                            <td title={d.description}>
                                                {d.description?.slice(0, 30)}{d.description?.length > 30 ? '...' : ''}
                                            </td>
                                            <td>
                                                <Badge 
                                                    bg={
                                                        d.statut === 'ACCEPTE_PAR_ENTREPRISE' ? 'success' : 
                                                        d.statut === 'REFUSE_PAR_ENTREPRISE' ? 'danger' : 
                                                        d.statut === 'VALIDE_PAR_CLIENT' ? 'primary' : 
                                                        'warning'
                                                    }
                                                >
                                                    {d.statut?.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                            <td>{new Date(d.dateCreation).toLocaleDateString()}</td>
                                            <td>{new Date(d.dateValidite).toLocaleDateString()}</td>
                                            <td>{d.entrepriseId ?? "-"}</td>
                                            <td>{d.clientId ?? "-"}</td>
                                            <td>{d.missionIds?.length ?? 0}</td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Button 
                                                        as={Link} 
                                                        to={`/devis/${d.id}`}
                                                        variant="outline-info"
                                                        size="sm"
                                                        title="Voir détails"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                    <Button 
                                                        as={Link} 
                                                        to={`/devis/edit/${d.id}`}
                                                        variant="outline-warning"
                                                        size="sm"
                                                        title="Modifier"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger"
                                                        size="sm"
                                                        title="Supprimer"
                                                        onClick={() => handleDelete(d.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>{renderPaginationItems()}</Pagination>
                        </div>
                    )}
                </Card.Body>
                  <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <small className="text-muted">
                            Total: {filteredDevis.length} {filteredDevis.length > 1 ? 'devis' : 'devis'}
                            {filteredDevis.length !== devis.length && (
                                <> (filtré de {devis.length})</>
                            )}
                        </small>
                    </div>
                    <div>
                        <small className="text-info">
                            <i>Toutes les données de calcul sont fournies par le backend</i>
                        </small>
                    </div>
                </Card.Footer>
            </Card>
        </Container>
>>>>>>> Stashed changes
    );
}
