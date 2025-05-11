// src/components/zones/ZoneList.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import "../../styles/ZoneList.css";
import { Container, Row, Col, Form, Button, Table, Card, Badge, Spinner, Alert, Pagination, Toast, ToastContainer, OverlayTrigger, Tooltip, ProgressBar } from "react-bootstrap";
import { 
    FaPlus, FaSearch, FaEye, FaEdit, FaTrashAlt, FaMapMarkedAlt,
    FaFilter, FaSort, FaSortUp, FaSortDown, FaCity, FaMapPin, FaGlobeEurope, FaEnvelope, FaSyncAlt,
    FaCheckCircle, FaInfoCircle, FaRegTimesCircle, FaTimes, FaRegLightbulb, 
    FaUndo, FaTrash
} from "react-icons/fa";

const ZoneList = () => {
    const location = useLocation();
    const [zones, setZones] = useState([]);
    const [zoneAgents, setZoneAgents] = useState({});
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [agentLoadingError, setAgentLoadingError] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'ascending' });
    
    // États pour les fonctionnalités améliorées
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [typeFilter, setTypeFilter] = useState('TOUS');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showFilterMobile, setShowFilterMobile] = useState(false);
    
    // États pour la suppression progressive
    const [pendingDeleteZone, setPendingDeleteZone] = useState(null);
    const [deleteProgress, setDeleteProgress] = useState(0);
    const [deleteTimer, setDeleteTimer] = useState(null);
    const [deleteToastVisible, setDeleteToastVisible] = useState(false);
    const deleteDelay = 5000; // 5 secondes d'attente avant suppression effective
    const deleteTimeoutRef = useRef(null);

    useEffect(() => {
        // Vérifier s'il y a un message dans location.state (après redirection)
        if (location.state?.message) {
            setToastMessage(location.state.message);
            setShowToast(true);
            
            // Nettoyer le state pour éviter d'afficher le message à nouveau après un refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        loadZones();
    }, [refreshTrigger]);

    // Nettoyage des ressources lors du démontage du composant
    useEffect(() => {
        return () => {
            if (deleteTimer) {
                clearInterval(deleteTimer);
            }
            if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
            }
        };
    }, [deleteTimer]);

    const loadZones = useCallback(() => {
        setLoading(true);
        
        // Récupérer les zones
        ZoneService.getAll()
            .then(res => {
                const zonesData = res.data;
                setZones(zonesData);
                
                // Tenter de récupérer les agents pour chaque zone
                if (zonesData.length > 0) {
                    fetchAgentsForAllZones(zonesData);
                } else {
                    setLoading(false);
                    setIsRefreshing(false);
                }
            })
            .catch(err => {
                console.error("Erreur lors du chargement des zones:", err);
                setError("Impossible de charger les zones.");
                setLoading(false);
                setIsRefreshing(false);
            });
    }, []);

    // Function to refresh data
    const handleRefresh = () => {
        setIsRefreshing(true);
        setRefreshTrigger(prev => prev + 1);
    };

    // Function to fetch agents for all zones
    const fetchAgentsForAllZones = (zonesData) => {
        // Pour chaque zone, récupérer les agents associés
        const agentsPromises = zonesData.map(zone => {
            return ZoneService.getAgentsForZone(zone.id)
                .then(agentsRes => ({
                    zoneId: zone.id,
                    agents: agentsRes.data
                }))
                .catch(err => {
                    console.error(`Erreur lors de la récupération des agents pour la zone ${zone.id}:`, err);
                    setAgentLoadingError(true);
                    return {
                        zoneId: zone.id,
                        agents: []
                    };
                });
        });
        
        // Attendre que toutes les promesses soient résolues
        Promise.all(agentsPromises)
            .then(results => {
                // Transformer les résultats en un objet pour un accès facile par ID de zone
                const agentsMap = {};
                results.forEach(result => {
                    agentsMap[result.zoneId] = result.agents;
                });
                
                setZoneAgents(agentsMap);
                setLoading(false);
                setIsRefreshing(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents:", err);
                setAgentLoadingError(true);
                setLoading(false);
                setIsRefreshing(false);
            });
    };

    // Fonction pour démarrer le processus de suppression progressive
    const initiateProgressiveDelete = (zone) => {
        setPendingDeleteZone(zone);
        setDeleteProgress(0);
        setDeleteToastVisible(true);
        
        // Créer un intervalle pour mettre à jour la progression
        const startTime = Date.now();
        const intervalId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(100, (elapsed / deleteDelay) * 100);
            setDeleteProgress(progress);
            
            if (progress >= 100) {
                clearInterval(intervalId);
                finalizeDelete(zone.id);
                setPendingDeleteZone(null);
                setDeleteToastVisible(false);
            }
        }, 50);
        
        setDeleteTimer(intervalId);
    };
    
    // Fonction pour annuler la suppression en cours
    const cancelDelete = () => {
        if (deleteTimer) {
            clearInterval(deleteTimer);
            setDeleteTimer(null);
        }
        setPendingDeleteZone(null);
        setDeleteProgress(0);
        setDeleteToastVisible(false);
        setToastMessage("Suppression annulée");
        setShowToast(true);
    };
    
    // Fonction pour finaliser la suppression après le délai
    const finalizeDelete = (id) => {
        // Nettoyer le timer si existant
        if (deleteTimer) {
            clearInterval(deleteTimer);
            setDeleteTimer(null);
        }
        
        // Fermer le toast de suppression progressive
        setDeleteToastVisible(false);
        
        // Appel API pour supprimer définitivement la zone
        ZoneService.remove(id)
            .then(() => {
                setZones(zones.filter(zone => zone.id !== id));
                setToastMessage("Zone supprimée avec succès");
                setShowToast(true);
            })
            .catch(error => {
                console.error("Erreur lors de la suppression de la zone:", error);
                setError("Erreur lors de la suppression de la zone");
                setShowToast(true);
                setToastMessage("Erreur lors de la suppression de la zone");
            });
    };

    // Fonction pour trier les zones
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Fonction pour obtenir l'icône de tri appropriée
    const getSortDirectionIcon = (columnName) => {
        if (sortConfig.key !== columnName) return <FaSort className="ms-1 text-muted" size={12} />;
        return sortConfig.direction === 'ascending' ? 
            <FaSortUp className="ms-1 text-primary" /> : 
            <FaSortDown className="ms-1 text-primary" />;
    };

    // Fonction pour effacer les filtres
    const clearFilters = () => {
        setFilter("");
        setTypeFilter("TOUS");
        setCurrentPage(1);
    };

    // Fonction pour obtenir les zones filtrées et triées
    const getFilteredZones = useCallback(() => {
        return zones.filter(zone => {
            const textMatch = 
                zone.nom.toLowerCase().includes(filter.toLowerCase()) ||
                (zone.ville && zone.ville.toLowerCase().includes(filter.toLowerCase())) ||
                (zone.codePostal && zone.codePostal.includes(filter));
                
            const typeMatch = typeFilter === 'TOUS' || zone.typeZone === typeFilter;
            
            return textMatch && typeMatch;
        });
    }, [zones, filter, typeFilter]);

    // Fonction pour obtenir les zones triées après filtrage - avec mémo
    const sortedZones = useMemo(() => {
        const filteredZones = getFilteredZones();
        
        if (!sortConfig.key) return filteredZones;
        
        return [...filteredZones].sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';
            
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [getFilteredZones, sortConfig]);

    // Fonction pour obtenir les zones à afficher pour la pagination
    const paginatedZones = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedZones.slice(indexOfFirstItem, indexOfLastItem);
    }, [sortedZones, currentPage, itemsPerPage]);

    // Fonction pour afficher les agents associés à une zone
    const displayAgents = (zoneId) => {
        if (agentLoadingError) return <span className="text-danger">API indisponible</span>;
        
        const agents = zoneAgents[zoneId] || [];
        
        if (agents.length === 0) return <span className="text-muted">Non assigné</span>;
        
        // Afficher les deux premiers agents et un badge "+X" pour les autres
        const displayCount = window.innerWidth < 768 ? 1 : 2;
        const shownAgents = agents.slice(0, displayCount);
        const remainingCount = agents.length - displayCount;

        return (
            <>
                {shownAgents.map((agent) => (
                    <OverlayTrigger
                        key={agent.id}
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-agent-${agent.id}`}>
                                Voir le profil de {agent.nom} {agent.prenom}
                            </Tooltip>
                        }
                    >
                        <Badge 
                            bg="info" 
                            className="me-1 mb-1" 
                            as={Link} 
                            to={`/agents/${agent.id}`}
                        >
                            {agent.nom} {agent.prenom}
                        </Badge>
                    </OverlayTrigger>
                ))}
                
                {remainingCount > 0 && (
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-more-agents-${zoneId}`}>
                                Voir les {remainingCount} autres agents
                            </Tooltip>
                        }
                    >
                        <Badge 
                            bg="secondary"
                            className="me-1 mb-1"
                            as={Link}
                            to={`/zones/${zoneId}`}
                        >
                            +{remainingCount}
                        </Badge>
                    </OverlayTrigger>
                )}
            </>
        );
    };

    // Fonction pour obtenir la couleur du badge selon le type de zone
    const getZoneTypeBadge = (type) => {
        switch(type) {
            case "VILLE": return "success";
            case "DEPARTEMENT": return "primary";
            case "REGION": return "warning";
            case "CODE_POSTAL": return "info";
            default: return "secondary";
        }
    };

    // Fonction pour obtenir l'icône selon le type de zone
    const getZoneTypeIcon = (type) => {
        switch(type) {
            case "VILLE": return <FaCity className="me-1" />;
            case "DEPARTEMENT": return <FaMapPin className="me-1" />;
            case "REGION": return <FaGlobeEurope className="me-1" />;
            case "CODE_POSTAL": return <FaEnvelope className="me-1" />;
            default: return <FaMapMarkedAlt className="me-1" />;
        }
    };

    // Gestion de la pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        
        // Faire défiler vers le haut de la liste
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Pagination
    const totalPages = Math.ceil(sortedZones.length / itemsPerPage);
    
    // Créer les éléments de pagination de manière réactive en fonction de la taille d'écran
    const renderPaginationItems = () => {
        const isMobile = window.innerWidth < 576;
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
        
        // Pour les mobiles, montrer moins d'éléments
        if (isMobile) {
            // Si la page courante est > 2, montrer ellipsis
            if (currentPage > 2) {
                items.push(<Pagination.Ellipsis key="ellipsis1" />);
            }
            
            // Page courante (si différente de 1 et totalPages)
            if (currentPage !== 1 && currentPage !== totalPages) {
                items.push(
                    <Pagination.Item 
                        key={currentPage} 
                        active={true}
                    >
                        {currentPage}
                    </Pagination.Item>
                );
            }
            
            // Si la page courante est < totalPages-1, montrer ellipsis
            if (currentPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="ellipsis2" />);
            }
        } else {
            // Version desktop avec plus d'éléments
            if (currentPage > 3) {
                items.push(<Pagination.Ellipsis key="ellipsis1" />);
            }
            
            // Pages autour de la page courante
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
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
            
            if (currentPage < totalPages - 2) {
                items.push(<Pagination.Ellipsis key="ellipsis2" />);
            }
        }
        
        // Dernier élément toujours visible si > 1
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
                disabled={currentPage === totalPages}
            />
        );
        
        return items;
    };

    // Affichage du chargement
    if (loading && !isRefreshing) {
        return (
            <Container className="text-center my-5">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement des zones de travail...</p>
                </div>
            </Container>
        );
    }

    // Affichage de l'erreur
    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    <Alert.Heading>
                        <FaRegTimesCircle className="me-2" />
                        Erreur
                    </Alert.Heading>
                    <p>{error}</p>
                    <div className="d-flex justify-content-end">
                        <Button variant="outline-danger" onClick={handleRefresh}>
                            <FaSyncAlt className="me-1" /> Réessayer
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="zone-list-container py-4 px-4">
            {/* Toast pour les notifications */}
            <ToastContainer 
                className="p-3" 
                position="top-end"
                style={{ zIndex: 1060 }}
            >
                {/* Toast pour les messages de succès */}
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)}
                    delay={5000}
                    autohide
                    bg="success"
                    text="white"
                >
                    <Toast.Header closeButton>
                        <FaCheckCircle className="me-2" />
                        <strong className="me-auto">Notification</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
                
                {/* Toast pour la suppression progressive avec barre de progression */}
                <Toast 
                    show={deleteToastVisible} 
                    onClose={cancelDelete}
                    className="delete-progress-toast"
                >
                    <Toast.Header closeButton>
                        <FaTrash className="me-2 text-danger" />
                        <strong className="me-auto">
                            Suppression en cours
                        </strong>
                    </Toast.Header>
                    <Toast.Body>
                        {pendingDeleteZone && (
                            <>
                                <p>
                                    Suppression de la zone <strong>{pendingDeleteZone.nom}</strong> dans 
                                    <strong> {Math.ceil((100 - deleteProgress) / 20)} </strong> 
                                    secondes
                                </p>
                                <ProgressBar 
                                    now={deleteProgress} 
                                    variant="danger" 
                                    animated 
                                />
                                <div className="d-flex justify-content-between mt-2">
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={cancelDelete}
                                    >
                                        <FaUndo className="me-1" /> Annuler
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => finalizeDelete(pendingDeleteZone.id)}
                                    >
                                        <FaTrashAlt className="me-1" /> Supprimer maintenant
                                    </Button>
                                </div>
                            </>
                        )}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white py-3">
                    <Row className="align-items-center">
                        <Col xs={12} md={6} className="mb-3 mb-md-0">
                            <h2 className="mb-0 d-flex align-items-center">
                                <FaMapMarkedAlt className="me-2 text-primary" />
                                Zones de travail
                                {isRefreshing && (
                                    <Spinner 
                                        animation="border" 
                                        variant="primary" 
                                        size="sm" 
                                        className="ms-2"
                                    />
                                )}
                            </h2>
                        </Col>
                        <Col xs={12} md={6}>
                            <Row className="align-items-center">
                                <Col>
                                    <div className="search-container">
                                        <Form.Control
                                            type="text"
                                            className="search-input"
                                            placeholder="Rechercher par nom, ville ou code postal..."
                                            value={filter}
                                            onChange={e => {
                                                setFilter(e.target.value);
                                                setCurrentPage(1); // Reset pagination on search
                                            }}
                                            aria-label="Rechercher des zones"
                                        />
                                        <FaSearch className="search-icon" />
                                    </div>
                                </Col>
                                <Col xs="auto" className="ms-auto">
                                    <Button 
                                        variant="outline-secondary"
                                        className="me-2"
                                        onClick={handleRefresh}
                                        title="Rafraîchir la liste"
                                        disabled={isRefreshing}
                                        aria-label="Rafraîchir la liste"
                                    >
                                        <FaSyncAlt className={isRefreshing ? "fa-spin" : ""} />
                                    </Button>
                                    <Button 
                                        as={Link}
                                        to="/zones/create"
                                        variant="primary"
                                        aria-label="Ajouter une nouvelle zone"
                                    >
                                        <FaPlus className="me-1 d-md-inline d-none" /> 
                                        <span className="d-md-inline d-none">Ajouter</span>
                                        <FaPlus className="d-md-none" />
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body>
                    {/* Bouton pour afficher/masquer les filtres sur mobile */}
                    <div className="d-md-none mb-3">
                        <Button 
                            variant="outline-secondary" 
                            className="w-100"
                            onClick={() => setShowFilterMobile(!showFilterMobile)}
                        >
                            <FaFilter className="me-2" />
                            {showFilterMobile ? "Masquer les filtres" : "Afficher les filtres"}
                        </Button>
                    </div>

                    {/* Filtres par type de zone - visible sur desktop ou quand activé sur mobile */}
                    <div className={`filter-buttons mb-4 ${showFilterMobile ? 'd-block' : 'd-none d-md-flex'}`}>
                        <Button 
                            variant={typeFilter === 'TOUS' ? 'primary' : 'outline-primary'}
                            className="filter-btn"
                            onClick={() => {
                                setTypeFilter('TOUS');
                                setCurrentPage(1);
                            }}
                            aria-pressed={typeFilter === 'TOUS'}
                        >
                            <FaFilter className="me-1" /> Tous types
                        </Button>
                        <Button 
                            variant={typeFilter === 'VILLE' ? 'success' : 'outline-success'}
                            className="filter-btn"
                            onClick={() => {
                                setTypeFilter('VILLE');
                                setCurrentPage(1);
                            }}
                            aria-pressed={typeFilter === 'VILLE'}
                        >
                            <FaCity className="me-1" /> Ville
                        </Button>
                        <Button 
                            variant={typeFilter === 'DEPARTEMENT' ? 'info' : 'outline-info'}
                            className="filter-btn"
                            onClick={() => {
                                setTypeFilter('DEPARTEMENT');
                                setCurrentPage(1);
                            }}
                            aria-pressed={typeFilter === 'DEPARTEMENT'}
                        >
                            <FaMapPin className="me-1" /> Département
                        </Button>
                        <Button 
                            variant={typeFilter === 'REGION' ? 'warning' : 'outline-warning'}
                            className="filter-btn"
                            onClick={() => {
                                setTypeFilter('REGION');
                                setCurrentPage(1);
                            }}
                            aria-pressed={typeFilter === 'REGION'}
                        >
                            <FaGlobeEurope className="me-1" /> Région
                        </Button>
                        <Button 
                            variant={typeFilter === 'CODE_POSTAL' ? 'secondary' : 'outline-secondary'}
                            className="filter-btn"
                            onClick={() => {
                                setTypeFilter('CODE_POSTAL');
                                setCurrentPage(1);
                            }}
                            aria-pressed={typeFilter === 'CODE_POSTAL'}
                        >
                            <FaEnvelope className="me-1" /> Code Postal
                        </Button>
                    </div>

                    {/* Indicateur de filtres actifs */}
                    {(filter || typeFilter !== 'TOUS') && (
                        <div className="d-flex align-items-center mb-3 flex-wrap filter-indicators">
                            <span className="me-2 text-muted">Filtres actifs:</span>
                            {filter && (
                                <Badge bg="light" text="dark" className="me-2 mb-1 p-2">
                                    Recherche: {filter}
                                    <Button 
                                        variant="link" 
                                        className="p-0 ms-2" 
                                        onClick={() => {
                                            setFilter("");
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Effacer le filtre de recherche"
                                    >
                                        <FaTimes size={10} />
                                    </Button>
                                </Badge>
                            )}
                            {typeFilter !== 'TOUS' && (
                                <Badge bg="light" text="dark" className="me-2 mb-1 p-2">
                                    Type: {typeFilter}
                                    <Button 
                                        variant="link" 
                                        className="p-0 ms-2" 
                                        onClick={() => {
                                            setTypeFilter('TOUS');
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Effacer le filtre de type"
                                    >
                                        <FaTimes size={10} />
                                    </Button>
                                </Badge>
                            )}
                            <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                className="ms-auto mb-1"
                                onClick={clearFilters}
                                aria-label="Effacer tous les filtres"
                            >
                                <FaTimes className="me-1" /> Effacer tous les filtres
                            </Button>
                        </div>
                    )}

                    {agentLoadingError && (
                        <Alert variant="warning" className="mb-3">
                            <FaMapMarkedAlt className="me-2" />
                            L'API pour récupérer les agents par zone n'est pas disponible. L'information des agents associés ne sera pas affichée correctement.
                        </Alert>
                    )}

                    {sortedZones.length === 0 ? (
                        <div className="text-center p-5 empty-state">
                            <img 
                                src="/logo192.png" 
                                alt="Aucune zone" 
                                style={{ opacity: 0.5, width: '100px', height: 'auto' }} 
                                className="mb-4"
                            />
                            <h4 className="text-muted">Aucune zone trouvée</h4>
                            <p className="text-muted">
                                {filter || typeFilter !== 'TOUS' ? 
                                    `Aucun résultat pour vos critères de recherche actuels` : 
                                    "Ajoutez une zone pour commencer"
                                }
                            </p>
                            {filter || typeFilter !== 'TOUS' ? (
                                <Button 
                                    variant="outline-secondary"
                                    className="mt-2 me-2"
                                    onClick={clearFilters}
                                    aria-label="Effacer les filtres"
                                >
                                    Effacer les filtres
                                </Button>
                            ) : null}
                            <Button 
                                as={Link}
                                to="/zones/create"
                                variant="outline-primary"
                                className="mt-2"
                                aria-label="Créer une nouvelle zone"
                            >
                                <FaPlus className="me-1" /> Créer une zone
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Astuce pour les utilisateurs */}
                            <div className="d-flex align-items-center mb-3 bg-light p-2 rounded">
                                <FaRegLightbulb className="text-warning me-2" />
                                <small className="text-muted">
                                    <span className="d-none d-md-inline">Astuce : Cliquez sur les en-têtes de colonnes pour trier les données. Utilisez les filtres pour affiner votre recherche.</span>
                                    <span className="d-md-none">Faites défiler horizontalement pour voir toutes les données.</span>
                                </small>
                            </div>
                            
                            <div className="table-responsive">
                                <Table hover responsive className="align-middle zone-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th onClick={() => requestSort('id')} className="sortable-header">
                                                #
                                                {getSortDirectionIcon('id')}
                                            </th>
                                            <th onClick={() => requestSort('nom')} className="sortable-header">
                                                Nom
                                                {getSortDirectionIcon('nom')}
                                            </th>
                                            <th onClick={() => requestSort('typeZone')} className="sortable-header">
                                                Type
                                                {getSortDirectionIcon('typeZone')}
                                            </th>
                                            <th onClick={() => requestSort('ville')} className="sortable-header">
                                                Ville
                                                {getSortDirectionIcon('ville')}
                                            </th>
                                            <th onClick={() => requestSort('codePostal')} className="sortable-header">
                                                Code postal
                                                {getSortDirectionIcon('codePostal')}
                                            </th>
                                            <th>Agents rattachés</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedZones.map((zone, index) => (
                                            <tr key={zone.id} className="zone-row">
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="fw-medium">
                                                    <Link 
                                                        to={`/zones/${zone.id}`}
                                                        className="text-decoration-none text-dark stretched-link-wrapper"
                                                    >
                                                        {zone.nom}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Badge 
                                                        bg={getZoneTypeBadge(zone.typeZone)} 
                                                        pill
                                                        className="d-flex align-items-center"
                                                        style={{ width: 'fit-content' }}
                                                    >
                                                        {getZoneTypeIcon(zone.typeZone)} 
                                                        <span className="d-none d-sm-inline">{zone.typeZone}</span>
                                                    </Badge>
                                                </td>
                                                <td>{zone.ville || <span className="text-muted">—</span>}</td>
                                                <td>{zone.codePostal || <span className="text-muted">—</span>}</td>
                                                <td className="agents-cell">
                                                    {displayAgents(zone.id)}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>Voir les détails</Tooltip>}
                                                        >
                                                            <Button 
                                                                as={Link}
                                                                to={`/zones/${zone.id}`}
                                                                variant="outline-info"
                                                                size="sm"
                                                                className="btn-action"
                                                                aria-label={`Voir les détails de la zone ${zone.nom}`}
                                                            >
                                                                <FaEye />
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>Modifier</Tooltip>}
                                                        >
                                                            <Button 
                                                                as={Link}
                                                                to={`/zones/edit/${zone.id}`}
                                                                variant="outline-warning"
                                                                size="sm"
                                                                className="btn-action"
                                                                aria-label={`Modifier la zone ${zone.nom}`}
                                                            >
                                                                <FaEdit />
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>Supprimer</Tooltip>}
                                                        >
                                                            <Button 
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="btn-action"
                                                                onClick={() => initiateProgressiveDelete(zone)}
                                                                aria-label={`Supprimer la zone ${zone.nom}`}
                                                            >
                                                                <FaTrashAlt />
                                                            </Button>
                                                        </OverlayTrigger>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            
                            {/* Affichage de la pagination si nécessaire */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination>{renderPaginationItems()}</Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
                
                <Card.Footer className="bg-white d-flex justify-content-between align-items-center flex-wrap">
                    <div className="mb-2 mb-md-0">
                        <small className="text-muted">
                            Total: {sortedZones.length} {sortedZones.length > 1 ? 'zones' : 'zone'}
                            {sortedZones.length !== zones.length && (
                                <> (filtré de {zones.length})</>
                            )}
                        </small>
                    </div>
                    {totalPages > 1 && (
                        <div className="d-flex align-items-center">
                            <small className="text-muted me-2">Zones par page:</small>
                            <Form.Select 
                                size="sm" 
                                style={{ width: 'auto' }}
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Retour à la première page
                                }}
                                aria-label="Nombre de zones par page"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </Form.Select>
                        </div>
                    )}
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default ZoneList;
