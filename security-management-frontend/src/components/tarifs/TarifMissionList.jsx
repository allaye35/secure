import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Form, InputGroup, Modal, Pagination, OverlayTrigger, Tooltip, Accordion, Offcanvas, Dropdown, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faPlus, faSearch, faEuroSign, faMoon, faCalendarWeek, faCalendarDay, faCalendarCheck, faPercent, faSort, faSortUp, faSortDown, faChevronLeft, faChevronRight, faFileExport, faFilter, faSync, faCog, faColumns, faInfoCircle, faArrowUp, faSliders, faQuestion, faBars } from "@fortawesome/free-solid-svg-icons";
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
    // Nouveaux états pour les filtres avancés
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
    const [typeFilter, setTypeFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({
        id: true,
        typeMission: true,
        prixUnitaireHT: true,
        majorationNuit: true,
        majorationWeekend: true,
        majorationDimanche: true,
        majorationFerie: true,
        tauxTVA: true
    });
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    // Nouveaux états pour les améliorations
    const [darkMode, setDarkMode] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [autoCompleteVisible, setAutoCompleteVisible] = useState(false);
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

    // Filtrage des tarifs en fonction du terme de recherche et des filtres avancés
    useEffect(() => {
        let results = tarifs.filter(tarif => 
            (tarif.typeMission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tarif.id?.toString().includes(searchTerm))
        );
        
        // Appliquer les filtres avancés si nécessaire
        if (typeFilter) {
            results = results.filter(tarif => 
                tarif.typeMission?.toLowerCase().includes(typeFilter.toLowerCase())
            );
        }
        
        if (priceFilter.min !== '') {
            const minPrice = parseFloat(priceFilter.min);
            if (!isNaN(minPrice)) {
                results = results.filter(tarif => tarif.prixUnitaireHT >= minPrice);
            }
        }
        
        if (priceFilter.max !== '') {
            const maxPrice = parseFloat(priceFilter.max);
            if (!isNaN(maxPrice)) {
                results = results.filter(tarif => tarif.prixUnitaireHT <= maxPrice);
            }
        }
        
        setFilteredTarifs(results);
        setCurrentPage(1); // Réinitialiser à la première page lors du filtrage
    }, [searchTerm, tarifs, typeFilter, priceFilter.min, priceFilter.max]);

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
    
    // Exporter les données en CSV
    const exportToCSV = () => {
        const headers = [
            'ID',
            'Type de mission',
            'Prix unitaire HT',
            'Majoration nuit',
            'Majoration weekend',
            'Majoration dimanche',
            'Majoration férié',
            'Taux TVA'
        ];
        
        // Préparer les données
        const csvData = filteredTarifs.map(t => [
            t.id,
            t.typeMission,
            t.prixUnitaireHT,
            t.majorationNuit + '%',
            t.majorationWeekend + '%',
            t.majorationDimanche + '%',
            t.majorationFerie + '%',
            t.tauxTVA + '%'
        ]);
        
        // Ajouter les en-têtes
        csvData.unshift(headers);
        
        // Convertir en CSV
        const csvString = csvData.map(row => row.join(',')).join('\n');
        
        // Créer un élément de téléchargement
        const downloadLink = document.createElement('a');
        const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        downloadLink.href = url;
        downloadLink.setAttribute('download', `tarifs_missions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(downloadLink);
        
        // Télécharger le fichier
        downloadLink.click();
        
        // Nettoyer
        document.body.removeChild(downloadLink);
        
        setSuccess("Export CSV effectué avec succès");
        setTimeout(() => setSuccess(""), 3000);
    };

    // Fonction pour rafraîchir les données
    const refreshData = () => {
        setLoading(true);
        TarifMissionService.getAll()
            .then(({ data }) => {
                setTarifs(data);
                setFilteredTarifs(data);
                setSuccess("Données rafraîchies avec succès");
                setTimeout(() => setSuccess(""), 3000);
            })
            .catch(() => {
                setError("Erreur de chargement des tarifs");
                setTimeout(() => setError(""), 3000);
            })
            .finally(() => setLoading(false));
    };

    // Fonction pour réinitialiser tous les filtres
    const resetFilters = () => {
        setSearchTerm('');
        setPriceFilter({ min: '', max: '' });
        setTypeFilter('');
        setShowAdvancedFilters(false);
        setSortConfig({ key: 'id', direction: 'ascending' });
    };

    // Calculer les statistiques
    const calculateStats = useCallback(() => {
        if (tarifs.length === 0) return null;
        
        let totalPrix = 0;
        let maxPrix = -Infinity;
        let minPrix = Infinity;
        let typeCount = {};
        
        tarifs.forEach(tarif => {
            totalPrix += tarif.prixUnitaireHT || 0;
            if (tarif.prixUnitaireHT > maxPrix) maxPrix = tarif.prixUnitaireHT;
            if (tarif.prixUnitaireHT < minPrix) minPrix = tarif.prixUnitaireHT;
            
            if (tarif.typeMission) {
                typeCount[tarif.typeMission] = (typeCount[tarif.typeMission] || 0) + 1;
            }
        });
        
        return {
            count: tarifs.length,
            averagePrice: totalPrix / tarifs.length,
            maxPrice: maxPrix,
            minPrice: minPrix,
            typeDistribution: typeCount
        };
    }, [tarifs]);
    
    // Gérer l'auto-complétion
    const updateSuggestions = useCallback((term) => {
        if (!term || term.length < 2) {
            setSuggestions([]);
            setAutoCompleteVisible(false);
            return;
        }
        
        const termLower = term.toLowerCase();
        const typeSuggestions = [...new Set(
            tarifs
                .filter(t => t.typeMission && t.typeMission.toLowerCase().includes(termLower))
                .map(t => t.typeMission)
                .slice(0, 5)
        )];
        
        setSuggestions(typeSuggestions);
        setAutoCompleteVisible(typeSuggestions.length > 0);
    }, [tarifs]);
    
    // Basculer entre mode clair et sombre
    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
        // Appliquer les classes aux éléments principaux
        document.body.classList.toggle('bg-dark');
        document.body.classList.toggle('text-light');
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
                </Card.Header>                <Card.Body className={darkMode ? 'bg-dark text-light' : ''}>
                    {error && (
                        <Alert variant="danger" onClose={() => setError("")} dismissible>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
                            {success}
                        </Alert>
                    )}
                    {/* Carte de statistiques */}
                    {showStats && (
                        <Card className={`mb-4 shadow-sm ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                            <Card.Header className={darkMode ? 'bg-dark text-light border-secondary' : 'bg-light'}>
                                <h5 className="mb-0">Statistiques des tarifs</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={3} className="mb-3 mb-md-0">
                                        <Card className={`text-center h-100 ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                                            <Card.Body>
                                                <h2 className="mb-0 text-primary">{tarifs.length}</h2>
                                                <p className="text-muted mb-0">Tarifs au total</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3} className="mb-3 mb-md-0">
                                        <Card className={`text-center h-100 ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                                            <Card.Body>
                                                <h2 className="mb-0 text-success">
                                                    {formatCurrency(calculateStats()?.averagePrice || 0)}
                                                </h2>
                                                <p className="text-muted mb-0">Prix moyen</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3} className="mb-3 mb-md-0">
                                        <Card className={`text-center h-100 ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                                            <Card.Body>
                                                <h2 className="mb-0 text-info">
                                                    {formatCurrency(calculateStats()?.minPrice || 0)}
                                                </h2>
                                                <p className="text-muted mb-0">Prix minimum</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3} className="mb-3 mb-md-0">
                                        <Card className={`text-center h-100 ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                                            <Card.Body>
                                                <h2 className="mb-0 text-warning">
                                                    {formatCurrency(calculateStats()?.maxPrice || 0)}
                                                </h2>
                                                <p className="text-muted mb-0">Prix maximum</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                    <Row className="mb-3 align-items-end">
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
                                    }}
                                />
                                <Button 
                                    variant="outline-secondary"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    title={showAdvancedFilters ? "Masquer les filtres avancés" : "Afficher les filtres avancés"}
                                >
                                    <FontAwesomeIcon icon={faFilter} />
                                </Button>
                                <Button 
                                    variant="outline-secondary"
                                    onClick={resetFilters}
                                    title="Réinitialiser les filtres"
                                >
                                    <FontAwesomeIcon icon={faSync} />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2} className="mt-2 mt-md-0">
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
                        <Col xs="auto" className="ms-auto mt-2 mt-lg-0">                            <ButtonGroup>
                                <Button 
                                    variant="outline-primary" 
                                    className="me-2" 
                                    onClick={refreshData}
                                    title="Rafraîchir les données"
                                >
                                    <FontAwesomeIcon icon={faSync} /> Actualiser
                                </Button>
                                <Button 
                                    variant="outline-info" 
                                    onClick={() => setShowStats(!showStats)}
                                    title="Afficher/Masquer les statistiques"
                                    className="me-2"
                                >
                                    <FontAwesomeIcon icon={faInfoCircle} /> Stats
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={toggleDarkMode}
                                    title={darkMode ? "Mode clair" : "Mode sombre"}
                                    className="me-2"
                                >
                                    <FontAwesomeIcon icon={darkMode ? faCalendarDay : faMoon} />
                                </Button>
                                <Button 
                                    variant="outline-success" 
                                    onClick={exportToCSV}
                                    title="Exporter les données en CSV"
                                >
                                    <FontAwesomeIcon icon={faFileExport} /> Exporter
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                    
                    {/* Filtres avancés */}
                    {showAdvancedFilters && (
                        <div className="advanced-filters mb-3 p-3 bg-light rounded border">
                            <Row className="mb-3">
                                <Col xs={12}>
                                    <h5 className="mb-3">Filtres avancés</h5>
                                </Col>
                                <Col sm={6} md={4} xl={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Type de mission</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Filtrer par type de mission"
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={6} md={4} xl={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Prix min (HT)</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>€</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="Min"
                                                value={priceFilter.min}
                                                onChange={(e) => setPriceFilter({...priceFilter, min: e.target.value})}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col sm={6} md={4} xl={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Prix max (HT)</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>€</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="Max"
                                                value={priceFilter.max}
                                                onChange={(e) => setPriceFilter({...priceFilter, max: e.target.value})}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col sm={6} md={4} xl={3}>
                                    <Form.Group className="mb-0">
                                        <Form.Label>Affichage des colonnes</Form.Label>
                                        <div className="d-flex flex-wrap">
                                            <Form.Check
                                                type="switch"
                                                id="col-typeMission"
                                                label="Type"
                                                className="me-2"
                                                checked={columnVisibility.typeMission}
                                                onChange={() => setColumnVisibility({...columnVisibility, typeMission: !columnVisibility.typeMission})}
                                            />
                                            <Form.Check
                                                type="switch"
                                                id="col-majNuit"
                                                label="Nuit"
                                                className="me-2"
                                                checked={columnVisibility.majorationNuit}
                                                onChange={() => setColumnVisibility({...columnVisibility, majorationNuit: !columnVisibility.majorationNuit})}
                                            />
                                            <Form.Check
                                                type="switch"
                                                id="col-majWeekend"
                                                label="Weekend"
                                                checked={columnVisibility.majorationWeekend}
                                                onChange={() => setColumnVisibility({...columnVisibility, majorationWeekend: !columnVisibility.majorationWeekend})}
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end">
                                <Button variant="secondary" size="sm" onClick={resetFilters}>
                                    Réinitialiser les filtres
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="table-responsive">                        <Table hover className="align-middle table-sm table-striped">
                            <thead className="table-light">
                                <tr>
                                    {columnVisibility.id && (
                                        <th onClick={() => requestSort('id')} className="sortable-header">
                                            ID {getSortIcon('id')}
                                        </th>
                                    )}
                                    {columnVisibility.typeMission && (
                                        <th onClick={() => requestSort('typeMission')} className="sortable-header">
                                            Type mission {getSortIcon('typeMission')}
                                        </th>
                                    )}
                                    {columnVisibility.prixUnitaireHT && (
                                        <th onClick={() => requestSort('prixUnitaireHT')} className="sortable-header">
                                            Prix HT {getSortIcon('prixUnitaireHT')}
                                        </th>
                                    )}
                                    {columnVisibility.majorationNuit && (
                                        <th onClick={() => requestSort('majorationNuit')} className="sortable-header">
                                            <FontAwesomeIcon icon={faMoon} className="me-1" /> Nuit (%) {getSortIcon('majorationNuit')}
                                        </th>
                                    )}
                                    {columnVisibility.majorationWeekend && (
                                        <th onClick={() => requestSort('majorationWeekend')} className="sortable-header">
                                            <FontAwesomeIcon icon={faCalendarWeek} className="me-1" /> Weekend (%) {getSortIcon('majorationWeekend')}
                                        </th>
                                    )}
                                    {columnVisibility.majorationDimanche && (
                                        <th onClick={() => requestSort('majorationDimanche')} className="sortable-header">
                                            <FontAwesomeIcon icon={faCalendarDay} className="me-1" /> Dimanche (%) {getSortIcon('majorationDimanche')}
                                        </th>
                                    )}
                                    {columnVisibility.majorationFerie && (
                                        <th onClick={() => requestSort('majorationFerie')} className="sortable-header">
                                            <FontAwesomeIcon icon={faCalendarCheck} className="me-1" /> Férié (%) {getSortIcon('majorationFerie')}
                                        </th>
                                    )}
                                    {columnVisibility.tauxTVA && (
                                        <th onClick={() => requestSort('tauxTVA')} className="sortable-header">
                                            <FontAwesomeIcon icon={faPercent} className="me-1" /> TVA {getSortIcon('tauxTVA')}
                                        </th>
                                    )}
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
                                ) : currentItems.map(t => (                                    <tr key={t.id} className="tarif-row">
                                        {columnVisibility.id && (
                                            <td>
                                                <Badge bg="secondary">{t.id}</Badge>
                                            </td>
                                        )}
                                        {columnVisibility.typeMission && (
                                            <td>{t.typeMission}</td>
                                        )}
                                        {columnVisibility.prixUnitaireHT && (
                                            <td>
                                                <span className="text-success fw-bold">
                                                    <FontAwesomeIcon icon={faEuroSign} className="me-1" />
                                                    {formatCurrency(t.prixUnitaireHT)}
                                                </span>
                                            </td>
                                        )}
                                        {columnVisibility.majorationNuit && (
                                            <td>{formatPercent(t.majorationNuit)}</td>
                                        )}
                                        {columnVisibility.majorationWeekend && (
                                            <td>{formatPercent(t.majorationWeekend)}</td>
                                        )}
                                        {columnVisibility.majorationDimanche && (
                                            <td>{formatPercent(t.majorationDimanche)}</td>
                                        )}
                                        {columnVisibility.majorationFerie && (
                                            <td>{formatPercent(t.majorationFerie)}</td>
                                        )}
                                        {columnVisibility.tauxTVA && (
                                            <td>{formatPercent(t.tauxTVA)}</td>
                                        )}
                                        <td>
                                            <div className="action-buttons d-flex flex-wrap">
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Voir les détails</Tooltip>}>
                                                    <Button variant="outline-primary" size="sm" className="me-1 mb-1 action-btn" 
                                                        onClick={() => navigate(`/tarifs/${t.id}`)}>
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Modifier</Tooltip>}>
                                                    <Button variant="outline-success" size="sm" className="me-1 mb-1 action-btn" 
                                                        onClick={() => navigate(`/tarifs/edit/${t.id}`)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Supprimer</Tooltip>}>
                                                    <Button variant="outline-danger" size="sm" className="mb-1 action-btn"
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
