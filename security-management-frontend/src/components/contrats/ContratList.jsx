// src/components/contrats/ContratList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ContratService from "../../services/ContratService";
import DevisService from "../../services/DevisService";
import MissionService from "../../services/MissionService";
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Spinner, Alert, Tooltip, 
         OverlayTrigger, Dropdown, Modal, Nav, Pagination, ProgressBar, Collapse } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faPlus, faEye, faPencilAlt, faTrash, faFileSignature, 
         faClipboardCheck, faTasks, faList, faClipboardList, faListCheck, faCalendarCheck, 
         faInfoCircle, faExclamationTriangle, faCheckCircle, faSort, faSortUp, faSortDown,
         faCalendarAlt, faClock, faFileContract, faFileInvoice, faTag, faUserTie } from "@fortawesome/free-solid-svg-icons";
import "../../styles/ContratList.css";

export default function ContratList() {
    // Importer notre feuille de style CSS
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/styles/ContratList.css';
        document.head.appendChild(link);
        
        // Style global pour garantir que les tooltips s'affichent au premier plan
        const style = document.createElement('style');
        style.innerHTML = `
            .tooltip {
                z-index: 9999 !important;
            }
            .btn, .btn-group {
                z-index: 5 !important;
                position: relative;
            }
        `;
        document.head.appendChild(style);
        
        // Nettoyer les styles lors du démontage du composant
        return () => {
            document.head.removeChild(style);
            if (link.parentNode) {
                document.head.removeChild(link);
            }
        };
    }, []);
    
    // États principaux
    const [contrats, setContrats] = useState([]);
    const [devisMap, setDevisMap] = useState({});
    const [missionsMap, setMissionsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredContrats, setFilteredContrats] = useState([]);
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [showMissionsModal, setShowMissionsModal] = useState(false);
    
    // États pour filtrage et recherche
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        dureeMin: "",
        dureeMax: "",
        dateMin: "",
        dateMax: "",
        avecMissions: "",
        sortBy: "id",
        sortDirection: "asc"
    });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'table'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    const navigate = useNavigate();

    useEffect(() => {
        // Chargement des données
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Charger tous les contrats
                const contratsResponse = await ContratService.getAll();
                const list = contratsResponse.data;
                setContrats(list);
                setFilteredContrats(list);
                
                // Extraire tous les devisId et charger leurs détails
                const devisIds = Array.from(
                    new Set(list.map(c => c.devisId).filter(Boolean))
                );
                
                // Chargement parallèle des devis
                const devisResults = await Promise.all(devisIds.map(id =>
                    DevisService.getById(id)
                        .then(r => ({ id, dto: r.data }))
                        .catch(() => null)
                ));
                
                const devisMapData = {};
                devisResults.forEach(r => { if (r) devisMapData[r.id] = r.dto; });
                setDevisMap(devisMapData);
                
                // Chargement parallèle des missions pour chaque contrat
                const missionsResults = await Promise.all(list.map(c =>
                    MissionService.getByContratId(c.id)
                        .then(r => ({ contratId: c.id, missions: r.data }))
                        .catch(() => ({ contratId: c.id, missions: [] }))
                ));
                
                const missionsMapData = {};
                missionsResults.forEach(r => { missionsMapData[r.contratId] = r.missions; });
                setMissionsMap(missionsMapData);
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger les contrats. Veuillez réessayer ultérieurement.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    // Application des filtres lorsqu'ils changent
    useEffect(() => {
        applyFilters();
    }, [searchTerm, filters, contrats]);
      const applyFilters = () => {
        let results = [...contrats];
        
        // Filtrage par terme de recherche (référence ou autres infos)
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            results = results.filter(contrat => 
                (contrat.referenceContrat && contrat.referenceContrat.toLowerCase().includes(term)) ||
                (devisMap[contrat.devisId]?.referenceDevis && 
                 devisMap[contrat.devisId].referenceDevis.toLowerCase().includes(term)) ||
                (contrat.id && contrat.id.toString().includes(term))
            );
        }
        
        // Filtrage par durée minimum
        if (filters.dureeMin) {
            results = results.filter(contrat => 
                contrat.dureeMois && parseInt(contrat.dureeMois) >= parseInt(filters.dureeMin)
            );
        }
        
        // Filtrage par durée maximum
        if (filters.dureeMax) {
            results = results.filter(contrat => 
                contrat.dureeMois && parseInt(contrat.dureeMois) <= parseInt(filters.dureeMax)
            );
        }
        
        // Filtrage par date minimum
        if (filters.dateMin) {
            const dateMin = new Date(filters.dateMin);
            results = results.filter(contrat => 
                contrat.dateSignature && new Date(contrat.dateSignature) >= dateMin
            );
        }
        
        // Filtrage par date maximum
        if (filters.dateMax) {
            const dateMax = new Date(filters.dateMax);
            results = results.filter(contrat => 
                contrat.dateSignature && new Date(contrat.dateSignature) <= dateMax
            );
        }
        
        // Filtrage par présence de missions
        if (filters.avecMissions === "avec") {
            results = results.filter(contrat => 
                (missionsMap[contrat.id] && missionsMap[contrat.id].length > 0)
            );
        } else if (filters.avecMissions === "sans") {
            results = results.filter(contrat => 
                !missionsMap[contrat.id] || missionsMap[contrat.id].length === 0
            );
        }
        
        // Tri des résultats
        results = sortContrats(results);
        
        // Réinitialiser la page courante quand les filtres changent
        setCurrentPage(1);
        
        setFilteredContrats(results);
    };
    
    // Tri des contrats
    const sortContrats = (listToSort) => {
        return [...listToSort].sort((a, b) => {
            let compareValueA, compareValueB;
            
            // Déterminer les valeurs à comparer selon le critère de tri
            switch (filters.sortBy) {
                case 'id':
                    compareValueA = a.id;
                    compareValueB = b.id;
                    break;
                case 'reference':
                    compareValueA = a.referenceContrat || '';
                    compareValueB = b.referenceContrat || '';
                    break;
                case 'date':
                    compareValueA = a.dateSignature ? new Date(a.dateSignature) : new Date(0);
                    compareValueB = b.dateSignature ? new Date(b.dateSignature) : new Date(0);
                    break;
                case 'duree':
                    compareValueA = a.dureeMois || 0;
                    compareValueB = b.dureeMois || 0;
                    break;
                case 'missions':
                    compareValueA = (missionsMap[a.id] || []).length;
                    compareValueB = (missionsMap[b.id] || []).length;
                    break;
                default:
                    compareValueA = a.id;
                    compareValueB = b.id;
            }
            
            // Appliquer la direction du tri
            let result = 0;
            if (typeof compareValueA === 'string') {
                result = compareValueA.localeCompare(compareValueB);
            } else {
                result = compareValueA > compareValueB ? 1 : compareValueA < compareValueB ? -1 : 0;
            }
            
            return filters.sortDirection === 'asc' ? result : -result;
        });
    };    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            dureeMin: "",
            dureeMax: "",
            dateMin: "",
            dateMax: "",
            avecMissions: "",
            sortBy: "id",
            sortDirection: "asc"
        });
        setSearchTerm("");
        setFilteredContrats(contrats);
    };
    
    // Gestion de la pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const totalPages = Math.ceil(filteredContrats.length / itemsPerPage);
    const currentContrats = filteredContrats.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    // Changer le mode d'affichage
    const toggleViewMode = (mode) => {
        setViewMode(mode);
    };
    
    // Gestion du tri
    const handleSortChange = (sortField) => {
        setFilters(prev => ({
            ...prev,
            sortDirection: prev.sortBy === sortField && prev.sortDirection === 'asc' ? 'desc' : 'asc',
            sortBy: sortField
        }));
    };
    
    // Extraire les statistiques sur les contrats
    const getContratStats = () => {
        const total = filteredContrats.length;
        const withMissions = filteredContrats.filter(c => 
            missionsMap[c.id] && missionsMap[c.id].length > 0
        ).length;
        const withoutMissions = total - withMissions;
        const averageDuration = total > 0 ? 
            filteredContrats.reduce((sum, c) => sum + (c.dureeMois || 0), 0) / total : 0;
        
        return {
            total,
            withMissions,
            withoutMissions,
            averageDuration: Math.round(averageDuration * 10) / 10
        };
    };

    const handleDelete = id => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.")) {
            ContratService.remove(id)
                .then(() => {
                    setContrats(prevContrats => prevContrats.filter(c => c.id !== id));
                    setFilteredContrats(prevFiltered => prevFiltered.filter(c => c.id !== id));
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression:", err);
                    setError("Impossible de supprimer le contrat. Veuillez réessayer.");
                });
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };      const getMissionBadge = (contratId) => {
        const missions = missionsMap[contratId] || [];
        
        if (missions.length === 0) {
            return (
                <Badge bg="secondary" className="d-flex align-items-center" style={{ cursor: 'default', position: 'relative', zIndex: 1 }}>
                    <FontAwesomeIcon icon={faClipboardList} className="me-1" />
                    Aucune mission
                </Badge>
            );
        } 
        
        return (
            <Button 
                variant={missions.length === 1 ? "info" : "primary"} 
                size="sm" 
                onClick={() => handleShowMissions(contratId)}
                className="d-flex align-items-center shadow-sm"
                style={{ position: 'relative', zIndex: 1, minWidth: '110px' }}
            >
                <FontAwesomeIcon icon={missions.length === 1 ? faListCheck : faClipboardList} className="me-1" />
                {missions.length} mission{missions.length > 1 ? "s" : ""}
            </Button>
        );
    };
    
    const handleShowMissions = (contratId) => {
        setSelectedContrat(contrats.find(c => c.id === contratId));
        setShowMissionsModal(true);
    };

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                    {error}
                </Alert>
            </Container>
        );
    }    return (
        <Container fluid className="mt-4">
            <Card className="shadow mb-4">
                <Card.Header className="bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="h4 mb-0">
                                <FontAwesomeIcon icon={faFileSignature} className="me-2" />
                                Gestion des Contrats
                            </h2>
                        </Col>
                        <Col xs="auto">
                            <Button variant="light" onClick={() => navigate("/contrats/create")} className="fw-bold">
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Nouveau contrat
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    {/* Section de statistiques */}
                    <div className="stats-container">
                        <Row>
                            {!loading && (
                                <>
                                    <Col sm={6} md={3} className="mb-3">
                                        <Card className="stats-card primary shadow-sm h-100">
                                            <Card.Body>
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-circle bg-primary bg-opacity-10 text-primary">
                                                        <FontAwesomeIcon icon={faFileContract} size="lg" />
                                                    </div>
                                                    <div>
                                                        <h6 className="text-muted mb-1">Total contrats</h6>
                                                        <h3 className="mb-0">{getContratStats().total}</h3>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm={6} md={3} className="mb-3">
                                        <Card className="stats-card success shadow-sm h-100">
                                            <Card.Body>
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-circle bg-success bg-opacity-10 text-success">
                                                        <FontAwesomeIcon icon={faTasks} size="lg" />
                                                    </div>
                                                    <div>
                                                        <h6 className="text-muted mb-1">Avec missions</h6>
                                                        <h3 className="mb-0">{getContratStats().withMissions}</h3>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm={6} md={3} className="mb-3">
                                        <Card className="stats-card warning shadow-sm h-100">
                                            <Card.Body>
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-circle bg-warning bg-opacity-10 text-warning">
                                                        <FontAwesomeIcon icon={faClipboardList} size="lg" />
                                                    </div>
                                                    <div>
                                                        <h6 className="text-muted mb-1">Sans mission</h6>
                                                        <h3 className="mb-0">{getContratStats().withoutMissions}</h3>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm={6} md={3} className="mb-3">
                                        <Card className="stats-card info shadow-sm h-100">
                                            <Card.Body>
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-circle bg-info bg-opacity-10 text-info">
                                                        <FontAwesomeIcon icon={faClock} size="lg" />
                                                    </div>
                                                    <div>
                                                        <h6 className="text-muted mb-1">Durée moyenne</h6>
                                                        <h3 className="mb-0">{getContratStats().averageDuration} <small>mois</small></h3>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </>
                            )}
                        </Row>
                    </div>
                    
                    <Row className="mb-4 align-items-center">
                        <Col md={5}>
                            <InputGroup className="search-form">
                                <Form.Control
                                    placeholder="Rechercher par référence, ID, devis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="py-2"
                                />
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <div className="d-flex align-items-center">
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="ms-2 me-2"
                                >
                                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                                    {showFilters ? "Masquer filtres" : "Afficher filtres"}
                                </Button>
                                {showFilters && (
                                    <Button 
                                        variant="outline-danger" 
                                        onClick={resetFilters}
                                        size="sm"
                                    >
                                        Réinitialiser
                                    </Button>
                                )}
                            </div>
                        </Col>
                        <Col md={3} className="text-end">
                            <div className="btn-group">
                                <Button 
                                    variant="outline-secondary" 
                                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => toggleViewMode('grid')}
                                >
                                    <FontAwesomeIcon icon={faTasks} /> Grille
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                                    onClick={() => toggleViewMode('table')}
                                >
                                    <FontAwesomeIcon icon={faList} /> Tableau
                                </Button>
                            </div>
                        </Col>
                    </Row>
                      <Collapse in={showFilters}>
                        <div className="filter-section">
                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Header className="bg-light">
                                    <h5 className="mb-0">Filtres avancés</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                                                    Durée minimum (mois)
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="dureeMin"
                                                    value={filters.dureeMin}
                                                    onChange={handleFilterChange}
                                                    min="0"
                                                    className="shadow-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                                                    Durée maximum (mois)
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="dureeMax"
                                                    value={filters.dureeMax}
                                                    onChange={handleFilterChange}
                                                    min="0"
                                                    className="shadow-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                                                    Date signature (début)
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="dateMin"
                                                    value={filters.dateMin}
                                                    onChange={handleFilterChange}
                                                    className="shadow-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                                                    Date signature (fin)
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="dateMax"
                                                    value={filters.dateMax}
                                                    onChange={handleFilterChange}
                                                    className="shadow-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    <FontAwesomeIcon icon={faTasks} className="me-2 text-primary" />
                                                    Missions
                                                </Form.Label>
                                                <Form.Select
                                                    name="avecMissions"
                                                    value={filters.avecMissions}
                                                    onChange={handleFilterChange}
                                                    className="shadow-sm"
                                                >
                                                    <option value="">Tous les contrats</option>
                                                    <option value="avec">Avec missions</option>
                                                    <option value="sans">Sans mission</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    <FontAwesomeIcon icon={faSort} className="me-2 text-primary" />
                                                    Trier par
                                                </Form.Label>
                                                <Form.Select
                                                    name="sortBy"
                                                    value={filters.sortBy}
                                                    onChange={handleFilterChange}
                                                    className="shadow-sm"
                                                >
                                                    <option value="id">ID</option>
                                                    <option value="reference">Référence</option>
                                                    <option value="date">Date signature</option>
                                                    <option value="duree">Durée</option>
                                                    <option value="missions">Nombre de missions</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    <FontAwesomeIcon 
                                                        icon={filters.sortDirection === 'asc' ? faSortUp : faSortDown} 
                                                        className="me-2 text-primary" 
                                                    />
                                                    Direction
                                                </Form.Label>
                                                <Form.Select
                                                    name="sortDirection"
                                                    value={filters.sortDirection}
                                                    onChange={handleFilterChange}
                                                    className="shadow-sm"
                                                >
                                                    <option value="asc">Ascendant</option>
                                                    <option value="desc">Descendant</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </div>
                    </Collapse>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                            <p className="mt-3 text-primary fw-bold">Chargement des contrats...</p>
                        </div>
                    ) : (
                        <>
                            {/* Mode d'affichage en grille */}
                            {viewMode === 'grid' ? (
                                <Row>
                                    {currentContrats.map((c, index) => {
                                        const devis = devisMap[c.devisId];
                                        const missions = missionsMap[c.id] || [];
                                        const hasMissions = missions.length > 0;
                                        
                                        return (
                                            <Col xl={3} lg={4} md={6} sm={12} key={c.id} className="contrat-grid-item">
                                                <Card className="contrat-card shadow-sm h-100">
                                                    <Card.Header>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <h5 className="mb-0">
                                                                <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                                                #{c.id}
                                                            </h5>
                                                            <Badge bg={hasMissions ? "success" : "warning"} className="px-3 py-2">
                                                                {hasMissions ? `${missions.length} mission${missions.length > 1 ? 's' : ''}` : "Sans mission"}
                                                            </Badge>
                                                        </div>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <div className="contrat-detail-item">
                                                            <span className="label">
                                                                <FontAwesomeIcon icon={faTag} className="me-2 text-primary" />
                                                                Référence:
                                                            </span>
                                                            <span className="value fw-bold">{c.referenceContrat}</span>
                                                        </div>
                                                        <div className="contrat-detail-item">
                                                            <span className="label">
                                                                <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                                                                Signature:
                                                            </span>
                                                            <span className="value">{formatDate(c.dateSignature)}</span>
                                                        </div>
                                                        <div className="contrat-detail-item">
                                                            <span className="label">
                                                                <FontAwesomeIcon icon={faClock} className="me-2 text-warning" />
                                                                Durée:
                                                            </span>
                                                            <span className="value">
                                                                {c.dureeMois ? `${c.dureeMois} mois` : "—"}
                                                            </span>
                                                        </div>
                                                        <div className="contrat-detail-item">
                                                            <span className="label">
                                                                <FontAwesomeIcon icon={faFileInvoice} className="me-2 text-info" />
                                                                Devis:
                                                            </span>
                                                            <span className="value">
                                                                {devis ? (
                                                                    <Link to={`/devis/${c.devisId}`} className="text-decoration-none">
                                                                        {devis.referenceDevis}
                                                                    </Link>
                                                                ) : "—"}
                                                            </span>
                                                        </div>
                                                        
                                                        {missions.length > 0 && (
                                                            <div className="mt-3">
                                                                <h6 className="text-muted mb-2">Dernière mission:</h6>
                                                                <div className="mission-list-item">
                                                                    <div className="fw-bold text-truncate">{missions[0].titreMission}</div>
                                                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                                                        <small className="text-muted">
                                                                            {missions[0].dateDebut && new Date(missions[0].dateDebut).toLocaleDateString()}
                                                                        </small>
                                                                        <Badge bg={
                                                                            missions[0].statut === "EN_COURS" ? "success" : 
                                                                            missions[0].statut === "PLANIFIEE" ? "info" : 
                                                                            missions[0].statut === "TERMINEE" ? "secondary" : "warning"
                                                                        } pill>
                                                                            {missions[0].statut?.replace(/_/g, " ") || "Non défini"}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                    <Card.Footer className="d-flex justify-content-between">
                                                        <Button 
                                                            variant="primary" 
                                                            size="sm" 
                                                            className="btn-action"
                                                            onClick={() => navigate(`/contrats/${c.id}`)}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </Button>
                                                        <Button 
                                                            variant="warning" 
                                                            size="sm" 
                                                            className="btn-action"
                                                            onClick={() => navigate(`/contrats/edit/${c.id}`)}
                                                        >
                                                            <FontAwesomeIcon icon={faPencilAlt} />
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm" 
                                                            className="btn-action"
                                                            onClick={() => handleDelete(c.id)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </Button>
                                                    </Card.Footer>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            ) : (
                                /* Mode d'affichage en tableau */
                                <div className="table-responsive">
                                    <Table hover striped className="align-middle contrat-list-table shadow-sm">
                                        <thead>
                                            <tr>
                                                <th style={{width: '50px'}} className="text-center" onClick={() => handleSortChange('id')}>
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        ID
                                                        {filters.sortBy === 'id' && (
                                                            <FontAwesomeIcon 
                                                                icon={filters.sortDirection === 'asc' ? faSortUp : faSortDown} 
                                                                className="ms-1" 
                                                            />
                                                        )}
                                                    </div>
                                                </th>
                                                <th style={{width: '15%'}} onClick={() => handleSortChange('reference')}>
                                                    <div className="d-flex align-items-center">
                                                        Référence
                                                        {filters.sortBy === 'reference' && (
                                                            <FontAwesomeIcon 
                                                                icon={filters.sortDirection === 'asc' ? faSortUp : faSortDown} 
                                                                className="ms-1" 
                                                            />
                                                        )}
                                                    </div>
                                                </th>
                                                <th style={{width: '12%'}} onClick={() => handleSortChange('date')}>
                                                    <div className="d-flex align-items-center">
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-primary" />
                                                        Date signature
                                                        {filters.sortBy === 'date' && (
                                                            <FontAwesomeIcon 
                                                                icon={filters.sortDirection === 'asc' ? faSortUp : faSortDown} 
                                                                className="ms-1" 
                                                            />
                                                        )}
                                                    </div>
                                                </th>
                                                <th style={{width: '8%'}} onClick={() => handleSortChange('duree')}>
                                                    <div className="d-flex align-items-center">
                                                        <FontAwesomeIcon icon={faClock} className="me-1 text-primary" />
                                                        Durée
                                                        {filters.sortBy === 'duree' && (
                                                            <FontAwesomeIcon 
                                                                icon={filters.sortDirection === 'asc' ? faSortUp : faSortDown} 
                                                                className="ms-1" 
                                                            />
                                                        )}
                                                    </div>
                                                </th>
                                                <th style={{width: '12%'}}>
                                                    <div className="d-flex align-items-center">
                                                        <FontAwesomeIcon icon={faFileInvoice} className="me-1 text-primary" />
                                                        Devis (réf.)
                                                    </div>
                                                </th>
                                                <th style={{width: '25%'}}>
                                                    <div className="d-flex align-items-center">
                                                        <FontAwesomeIcon icon={faCalendarCheck} className="me-1 text-primary" />
                                                        1ère Mission
                                                    </div>
                                                </th>
                                                <th className="text-center" style={{width: '10%'}} onClick={() => handleSortChange('missions')}>
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <FontAwesomeIcon icon={faClipboardList} className="me-1 text-primary" />
                                                        Missions
                                                        {filters.sortBy === 'missions' && (
                                                            <FontAwesomeIcon 
                                                                icon={filters.sortDirection === 'asc' ? faSortUp : faSortDown} 
                                                                className="ms-1" 
                                                            />
                                                        )}
                                                    </div>
                                                </th>
                                                <th className="text-center" style={{width: '120px', position: 'relative', overflow: 'visible'}}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentContrats.map(c => {
                                                const devis = devisMap[c.devisId];
                                                const missions = missionsMap[c.id] || [];
                                                return (
                                                    <tr key={c.id}>
                                                        <td className="text-center">{c.id}</td>
                                                        <td>
                                                            <Link to={`/contrats/${c.id}`} className="text-decoration-none">
                                                                <strong>{c.referenceContrat}</strong>
                                                            </Link>
                                                        </td>
                                                        <td>{formatDate(c.dateSignature)}</td>
                                                        <td>{c.dureeMois || "—"} mois</td>
                                                        <td>
                                                            {devis ? (
                                                                <Link to={`/devis/${c.devisId}`}>
                                                                    {devis.referenceDevis}
                                                                </Link>
                                                            ) : "—"}
                                                        </td>
                                                        <td style={{ position: 'relative', zIndex: 1 }}>
                                                            {missions[0] ? (
                                                                <Link to={`/missions/${missions[0].id}`} className="d-flex align-items-center text-decoration-none">
                                                                    <Badge bg="light" text="dark" className="me-2 p-2 border">
                                                                        <FontAwesomeIcon icon={faTasks} className="text-primary" />
                                                                    </Badge>
                                                                    <div>
                                                                        <div className="fw-bold">{missions[0].titreMission}</div>
                                                                        <small className="text-muted">
                                                                            {missions[0].dateDebut && new Date(missions[0].dateDebut).toLocaleDateString()}
                                                                        </small>
                                                                    </div>
                                                                </Link>
                                                            ) : (
                                                                <span className="text-muted d-flex align-items-center">
                                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-secondary" />
                                                                    Aucune mission
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center" style={{ position: 'relative', zIndex: 1 }}>
                                                                {getMissionBadge(c.id)}
                                                            </div>
                                                        </td>
                                                        <td className="text-center" style={{ position: 'relative', overflow: 'visible', zIndex: 5 }}>
                                                            <div className="d-flex justify-content-center gap-2 position-relative" style={{ zIndex: 10 }}>
                                                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${c.id}`}>Voir détails</Tooltip>}>
                                                                    <Button variant="info" size="sm" className="text-white btn-action" 
                                                                        onClick={() => navigate(`/contrats/${c.id}`)}>
                                                                        <FontAwesomeIcon icon={faEye} />
                                                                    </Button>
                                                                </OverlayTrigger>
                                                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-edit-${c.id}`}>Modifier</Tooltip>}>
                                                                    <Button variant="warning" size="sm" className="btn-action"
                                                                        onClick={() => navigate(`/contrats/edit/${c.id}`)}>
                                                                        <FontAwesomeIcon icon={faPencilAlt} />
                                                                    </Button>
                                                                </OverlayTrigger>
                                                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-delete-${c.id}`}>Supprimer</Tooltip>}>
                                                                    <Button variant="danger" size="sm" className="btn-action"
                                                                        onClick={() => handleDelete(c.id)}>
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </Button>
                                                                </OverlayTrigger>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                            
                            {filteredContrats.length === 0 && (
                                <div className="text-center py-5 bg-light rounded shadow-sm">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mb-3" size="3x" />
                                    <h5 className="text-muted">
                                        {contrats.length === 0 ? 
                                            "Aucun contrat n'a été trouvé." : 
                                            "Aucun contrat ne correspond à vos critères de recherche."
                                        }
                                    </h5>
                                    {contrats.length > 0 && (
                                        <Button 
                                            variant="outline-primary" 
                                            className="mt-3" 
                                            onClick={resetFilters}
                                        >
                                            <FontAwesomeIcon icon={faFilter} className="me-2" />
                                            Réinitialiser les filtres
                                        </Button>
                                    )}
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {filteredContrats.length > 0 && (
                                <div className="pagination-container mt-4">
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
                                </div>
                            )}
                            
                            <div className="mt-3 d-flex justify-content-between align-items-center px-2">
                                <small className="text-muted">
                                    Page {currentPage} sur {totalPages || 1}
                                </small>
                                <small className="text-muted">
                                    {filteredContrats.length} contrat(s) sur {contrats.length} au total
                                </small>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
              {/* Modal pour afficher les missions d'un contrat */}
            <Modal show={showMissionsModal} onHide={() => setShowMissionsModal(false)} size="lg" dialogClassName="modal-mission">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                        Missions du contrat {selectedContrat?.referenceContrat}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedContrat && (
                        <>
                            <Card className="shadow-sm mb-4 border-0">
                                <Card.Body>
                                    <Row className="mb-3">
                                        <Col md={4} className="mb-2">
                                            <div className="contrat-detail-item">
                                                <span className="label">
                                                    <FontAwesomeIcon icon={faFileContract} className="me-2 text-primary" />
                                                    Référence:
                                                </span>
                                                <span className="value fw-bold">{selectedContrat.referenceContrat}</span>
                                            </div>
                                        </Col>
                                        <Col md={4} className="mb-2">
                                            <div className="contrat-detail-item">
                                                <span className="label">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                                                    Signature:
                                                </span>
                                                <span className="value">{formatDate(selectedContrat.dateSignature)}</span>
                                            </div>
                                        </Col>
                                        <Col md={4} className="mb-2">
                                            <div className="contrat-detail-item">
                                                <span className="label">
                                                    <FontAwesomeIcon icon={faClock} className="me-2 text-warning" />
                                                    Durée:
                                                </span>
                                                <span className="value">
                                                    {selectedContrat.dureeMois ? `${selectedContrat.dureeMois} mois` : "—"}
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                    
                                    {selectedContrat.devisId && devisMap[selectedContrat.devisId] && (
                                        <div className="bg-light rounded p-3 mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faFileInvoice} className="me-2 text-info" />
                                                <h6 className="mb-0">Devis associé: <Link to={`/devis/${selectedContrat.devisId}`}>{devisMap[selectedContrat.devisId].referenceDevis}</Link></h6>
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                            
                            <h5 className="mb-3 d-flex align-items-center">
                                <FontAwesomeIcon icon={faTasks} className="me-2 text-primary" />
                                Liste des missions 
                                <Badge bg="primary" pill className="ms-2">
                                    {missionsMap[selectedContrat.id]?.length || 0}
                                </Badge>
                            </h5>
                              
                            {missionsMap[selectedContrat.id] && missionsMap[selectedContrat.id].length > 0 ? (
                                <div className="table-responsive">
                                    <Table hover bordered striped className="align-middle shadow-sm mb-0" style={{ tableLayout: 'fixed' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-center" style={{width: '50px'}}>ID</th>
                                                <th>Titre</th>
                                                <th>Date de début</th>
                                                <th>Date de fin</th>
                                                <th className="text-center">Statut</th>
                                                <th className="text-center" style={{width: '120px'}}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {missionsMap[selectedContrat.id].map(mission => {
                                                // Calcul du statut réel basé sur les dates (en cas de données incomplètes)
                                                const today = new Date();
                                                const dateDebut = mission.dateDebut ? new Date(mission.dateDebut) : null;
                                                const dateFin = mission.dateFin ? new Date(mission.dateFin) : null;
                                                let statut = mission.statut;
                                                
                                                if (!statut) {
                                                    if (dateDebut && dateFin) {
                                                        if (today < dateDebut) {
                                                            statut = "PLANIFIEE";
                                                        } else if (today > dateFin) {
                                                            statut = "TERMINEE";
                                                        } else {
                                                            statut = "EN_COURS";
                                                        }
                                                    }
                                                }
                                                
                                                return (
                                                    <tr key={mission.id}>
                                                        <td className="text-center">{mission.id}</td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="icon-circle bg-light border" style={{ width: '36px', height: '36px' }}>
                                                                    <FontAwesomeIcon icon={faTasks} className="text-primary" />
                                                                </div>
                                                                <div className="ms-2">
                                                                    <div className="fw-bold">{mission.titreMission}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <FontAwesomeIcon icon={faCalendarCheck} className="text-success me-2" />
                                                                {mission.dateDebut ? formatDate(mission.dateDebut) : "—"}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <FontAwesomeIcon icon={faCalendarCheck} className="text-danger me-2" />
                                                                {mission.dateFin ? formatDate(mission.dateFin) : "—"}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center">
                                                                <Badge bg={statut === "EN_COURS" ? "success" : 
                                                                    statut === "PLANIFIEE" ? "info" : 
                                                                    statut === "TERMINEE" ? "secondary" : "warning"}
                                                                    className="mission-badge"
                                                                >
                                                                    <FontAwesomeIcon icon={
                                                                        statut === "EN_COURS" ? faClipboardCheck : 
                                                                        statut === "PLANIFIEE" ? faCalendarCheck : 
                                                                        statut === "TERMINEE" ? faCheckCircle : faInfoCircle
                                                                    } />
                                                                    {statut?.replace(/_/g, " ") || "Non défini"}
                                                                </Badge>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center">
                                                                <Link to={`/missions/${mission.id}`} className="me-2">
                                                                    <Button size="sm" variant="outline-primary" className="btn-action">
                                                                        <FontAwesomeIcon icon={faEye} />
                                                                    </Button>
                                                                </Link>
                                                                <Link to={`/missions/edit/${mission.id}`}>
                                                                    <Button size="sm" variant="outline-warning" className="btn-action">
                                                                        <FontAwesomeIcon icon={faPencilAlt} />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <Alert variant="warning" className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-3 fs-3" />
                                    <div>
                                        <h6 className="mb-1">Aucune mission associée</h6>
                                        <p className="mb-0">Ce contrat n'a pas encore de missions associées.</p>
                                    </div>
                                </Alert>
                            )}
                            
                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="outline-secondary" onClick={() => setShowMissionsModal(false)}>
                                    <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                                    Fermer
                                </Button>
                                <Link to={`/missions/create?contratId=${selectedContrat.id}`}>
                                    <Button variant="success" className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        <span>Ajouter une mission</span>
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
}
