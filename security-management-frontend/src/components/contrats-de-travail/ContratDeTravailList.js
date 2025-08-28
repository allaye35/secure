import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ContratDeTravailService, { MetaService } from "../../services/ContratDeTravailService";
import { Container, Row, Col, Form, Table, Card, Button, InputGroup, Badge, Spinner, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faPlus, faEye, faPencilAlt, faTrash, faFileContract } from "@fortawesome/free-solid-svg-icons";

const ContratDeTravailList = () => {
    const [contrats, setContrats] = useState([]);
    const [filteredContrats, setFilteredContrats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [agents, setAgents] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    
    // État de pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // États des filtres
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        typeContrat: "",
        entrepriseId: "",
        agentId: "",
        dateDebut: "",
        dateFin: "",
        actif: ""
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [contratsRes, agentsRes, entreprisesRes] = await Promise.all([
                    ContratDeTravailService.getAll(),
                    MetaService.getAgents(),
                    MetaService.getEntreprises()
                ]);
                
                setContrats(contratsRes.data);
                setFilteredContrats(contratsRes.data);
                setAgents(agentsRes.data);
                setEntreprises(entreprisesRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger les données. Veuillez réessayer plus tard.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        // Appliquer les filtres à chaque changement de filtre ou de terme de recherche
        applyFilters();
    }, [searchTerm, filters]);

    const applyFilters = () => {
        let results = [...contrats];
        
        // Filtrage par terme de recherche (référence ou infos générales)
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            results = results.filter(contrat => 
                contrat.referenceContrat?.toLowerCase().includes(term) ||
                contrat.typeContrat?.toLowerCase().includes(term)
            );
        }
        
        // Filtre par type de contrat
        if (filters.typeContrat) {
            results = results.filter(contrat => contrat.typeContrat === filters.typeContrat);
        }
        
        // Filtre par entreprise
        if (filters.entrepriseId) {
            results = results.filter(contrat => contrat.entrepriseId === Number(filters.entrepriseId));
        }
        
        // Filtre par agent
        if (filters.agentId) {
            results = results.filter(contrat => contrat.agentDeSecuriteId === Number(filters.agentId));
        }
        
        // Filtre par date de début
        if (filters.dateDebut) {
            results = results.filter(contrat => new Date(contrat.dateDebut) >= new Date(filters.dateDebut));
        }
        
        // Filtre par date de fin
        if (filters.dateFin) {
            results = results.filter(contrat => 
                contrat.dateFin ? new Date(contrat.dateFin) <= new Date(filters.dateFin) : true
            );
        }
        
        // Filtre par contrat actif ou non
        if (filters.actif === "actif") {
            const today = new Date();
            results = results.filter(contrat => 
                new Date(contrat.dateDebut) <= today && 
                (!contrat.dateFin || new Date(contrat.dateFin) >= today)
            );
        } else if (filters.actif === "expire") {
            const today = new Date();
            results = results.filter(contrat => 
                contrat.dateFin && new Date(contrat.dateFin) < today
            );
        } else if (filters.actif === "futur") {
            const today = new Date();
            results = results.filter(contrat => new Date(contrat.dateDebut) > today);
        }
        
        setFilteredContrats(results);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            typeContrat: "",
            entrepriseId: "",
            agentId: "",
            dateDebut: "",
            dateFin: "",
            actif: ""
        });
        setSearchTerm("");
        setFilteredContrats(contrats);
        setCurrentPage(1); // Réinitialiser la pagination lors de la réinitialisation des filtres
    };

    // Calculer les indices pour la pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContrats = filteredContrats.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredContrats.length / itemsPerPage);

    // Gérer le changement de page
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.")) {
            ContratDeTravailService.delete(id)
                .then(() => {
                    const updatedContrats = contrats.filter(c => c.id !== id);
                    setContrats(updatedContrats);
                    setFilteredContrats(filteredContrats.filter(c => c.id !== id));
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression:", err);
                    setError("Impossible de supprimer le contrat. Veuillez réessayer.");
                });
        }
    };

    const getContratStatus = (contrat) => {
        const today = new Date();
        const dateDebut = new Date(contrat.dateDebut);
        const dateFin = contrat.dateFin ? new Date(contrat.dateFin) : null;
        
        if (dateDebut > today) {
            return <Badge bg="warning">À venir</Badge>;
        } else if (!dateFin || dateFin >= today) {
            return <Badge bg="success">Actif</Badge>;
        } else {
            return <Badge bg="secondary">Expiré</Badge>;
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return "–";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };
    
    const getAgentName = (id) => {
        const agent = agents.find(a => a.id === id);
        return agent ? `${agent.prenom} ${agent.nom}` : id;
    };
    
    const getEntrepriseName = (id) => {
        const entreprise = entreprises.find(e => e.id === id);
        return entreprise ? entreprise.nom : id;
    };

    if (error) return (
        <Container className="mt-4">
            <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </div>
        </Container>
    );

    return (
        <Container fluid className="mt-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="h4 mb-0">
                                <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                Contrats de travail
                            </h2>
                        </Col>
                        <Col xs="auto">
                            <Link to="/contrats-de-travail/create" className="btn btn-light">
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Nouveau contrat
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6} lg={4}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Rechercher un contrat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button variant="outline-secondary">
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col>
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowFilters(!showFilters)}
                                className="ms-2"
                            >
                                <FontAwesomeIcon icon={faFilter} className="me-2" />
                                {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
                            </Button>
                            {showFilters && (
                                <Button 
                                    variant="outline-danger" 
                                    onClick={resetFilters}
                                    className="ms-2"
                                    size="sm"
                                >
                                    Réinitialiser les filtres
                                </Button>
                            )}
                        </Col>
                    </Row>
                    
                    {showFilters && (
                        <Card className="mb-4 border bg-light">
                            <Card.Body>
                                <Row>
                                    <Col md={4} lg={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Type de contrat</Form.Label>
                                            <Form.Select 
                                                name="typeContrat"
                                                value={filters.typeContrat}
                                                onChange={handleFilterChange}
                                            >
                                                <option value="">Tous</option>
                                                <option value="CDI">CDI</option>
                                                <option value="CDD">CDD</option>
                                                <option value="Intérim">Intérim</option>
                                                <option value="Stage">Stage</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} lg={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Agent</Form.Label>
                                            <Form.Select
                                                name="agentId"
                                                value={filters.agentId}
                                                onChange={handleFilterChange}
                                            >
                                                <option value="">Tous</option>
                                                {agents.map(agent => (
                                                    <option key={agent.id} value={agent.id}>
                                                        {agent.prenom} {agent.nom}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} lg={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Entreprise</Form.Label>
                                            <Form.Select
                                                name="entrepriseId"
                                                value={filters.entrepriseId}
                                                onChange={handleFilterChange}
                                            >
                                                <option value="">Toutes</option>
                                                {entreprises.map(entreprise => (
                                                    <option key={entreprise.id} value={entreprise.id}>
                                                        {entreprise.nom}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} lg={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Statut</Form.Label>
                                            <Form.Select
                                                name="actif"
                                                value={filters.actif}
                                                onChange={handleFilterChange}
                                            >
                                                <option value="">Tous</option>
                                                <option value="actif">Actifs</option>
                                                <option value="expire">Expirés</option>
                                                <option value="futur">À venir</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4} lg={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Date début (à partir de)</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dateDebut"
                                                value={filters.dateDebut}
                                                onChange={handleFilterChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} lg={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Date fin (jusqu'à)</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dateFin"
                                                value={filters.dateFin}
                                                onChange={handleFilterChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Chargement des contrats...</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <Table hover striped className="align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Référence</th>
                                            <th>Type</th>
                                            <th>Agent</th>
                                            <th>Entreprise</th>
                                            <th>Début</th>
                                            <th>Fin</th>
                                            <th>Salaire (€)</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentContrats.map((c, i) => (
                                            <tr key={c.id}>
                                                <td>{indexOfFirstItem + i + 1}</td>
                                                <td>{c.referenceContrat}</td>
                                                <td>{c.typeContrat}</td>
                                                <td>{getAgentName(c.agentDeSecuriteId)}</td>
                                                <td>{getEntrepriseName(c.entrepriseId)}</td>
                                                <td>{formatDate(c.dateDebut)}</td>
                                                <td>{formatDate(c.dateFin)}</td>
                                                <td>{c.salaireDeBase} €</td>
                                                <td>{getContratStatus(c)}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Link to={`/contrats-de-travail/${c.id}`} className="btn btn-sm btn-info text-white">
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </Link>
                                                        <Link to={`/contrats-de-travail/edit/${c.id}`} className="btn btn-sm btn-warning">
                                                            <FontAwesomeIcon icon={faPencilAlt} />
                                                        </Link>
                                                        <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))} 
                                    </tbody>
                                </Table>
                            </div>
                            
                            {filteredContrats.length === 0 && (
                                <div className="text-center py-4 bg-light rounded">
                                    <p className="text-muted mb-0">
                                        {contrats.length === 0 ? 
                                            "Aucun contrat de travail n'a été trouvé." : 
                                            "Aucun contrat ne correspond à vos critères de recherche."
                                        }
                                    </p>
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {filteredContrats.length > 0 && (
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <div className="d-flex align-items-center">
                                        <span className="me-2">Afficher </span>
                                        <Form.Select 
                                            className="form-select-sm" 
                                            style={{ width: '70px' }}
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </Form.Select>
                                        <span className="ms-2">éléments</span>
                                    </div>
                                    
                                    {filteredContrats.length > itemsPerPage && (
                                        <Pagination>
                                            <Pagination.First 
                                                onClick={() => handlePageChange(1)} 
                                                disabled={currentPage === 1}
                                            />
                                            <Pagination.Prev 
                                                onClick={() => handlePageChange(currentPage - 1)} 
                                                disabled={currentPage === 1}
                                            />
                                            
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                // Logique pour montrer les pages autour de la page courante
                                                let pageToShow;
                                                if (totalPages <= 5) {
                                                    pageToShow = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageToShow = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageToShow = totalPages - 4 + i;
                                                } else {
                                                    pageToShow = currentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <Pagination.Item 
                                                        key={pageToShow}
                                                        active={pageToShow === currentPage}
                                                        onClick={() => handlePageChange(pageToShow)}
                                                    >
                                                        {pageToShow}
                                                    </Pagination.Item>
                                                );
                                            })}
                                            
                                            <Pagination.Next 
                                                onClick={() => handlePageChange(currentPage + 1)} 
                                                disabled={currentPage === totalPages}
                                            />
                                            <Pagination.Last 
                                                onClick={() => handlePageChange(totalPages)} 
                                                disabled={currentPage === totalPages}
                                            />
                                        </Pagination>
                                    )}
                                </div>
                            )}
                            
                            <div className="mt-3 text-end">
                                <small className="text-muted">
                                    {filteredContrats.length > 0 
                                        ? `Affichage de ${indexOfFirstItem + 1} à ${Math.min(indexOfLastItem, filteredContrats.length)} sur ${filteredContrats.length} contrats (${contrats.length} au total)`
                                        : `${filteredContrats.length} contrat(s) sur ${contrats.length} au total`
                                    }
                                </small>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ContratDeTravailList;
