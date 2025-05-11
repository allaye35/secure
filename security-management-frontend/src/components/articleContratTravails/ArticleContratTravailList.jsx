// src/components/articleContratTravails/ArticleContratTravailList.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import { Container, Card, Button, Table, Form, Row, Col, Spinner, Alert, Badge, 
         OverlayTrigger, Tooltip, Modal, Pagination, Toast, ToastContainer, ProgressBar } from "react-bootstrap";
import { 
    FaPlus, FaTrash, FaEdit, FaEye, FaSearch, FaSyncAlt, FaFilter, 
    FaTimes, FaSort, FaSortUp, FaSortDown, FaFileAlt, FaRegLightbulb,
    FaTrashAlt, FaUndo, FaExclamationTriangle, FaCheckCircle, FaRegTimesCircle,
    FaFileContract, FaClipboardList
} from "react-icons/fa";
import "../../styles/ArticleContratTravailList.css";

export default function ArticleContratTravailList() {
    const location = useLocation();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // État pour la recherche et le filtrage
    const [filter, setFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showFilterMobile, setShowFilterMobile] = useState(false);
    
    // État pour le tri
    const [sortConfig, setSortConfig] = useState({
        key: "id",
        direction: "ascending"
    });
    
    // États pour les notifications
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    
    // États pour la suppression progressive
    const [deleteToastVisible, setDeleteToastVisible] = useState(false);
    const [pendingDeleteArticle, setPendingDeleteArticle] = useState(null);
    const [deleteProgress, setDeleteProgress] = useState(0);
    const [deleteTimer, setDeleteTimer] = useState(null);
    const deleteDelay = 5000; // 5 secondes d'attente avant suppression effective
    const deleteTimeoutRef = useRef(null);

    // Vérifier les messages de notification après redirection
    useEffect(() => {
        if (location.state?.message) {
            setToastMessage(location.state.message);
            setShowToast(true);
            
            // Nettoyer le state pour éviter d'afficher le message à nouveau après un refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Chargement initial des données
    useEffect(() => {
        loadArticles();
    }, []);
    
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
    
    // Fonction pour charger ou rafraîchir les articles
    const loadArticles = () => {
        setLoading(true);
        setError(null);
        ArticleContratTravailService.getAll()
            .then(res => {
                setArticles(res.data);
                setLoading(false);
                setIsRefreshing(false);
            })
            .catch(err => {
                console.error(err);
                setError("Erreur lors du chargement des articles de contrat de travail. Veuillez réessayer.");
                setLoading(false);
                setIsRefreshing(false);
            });
    };
    
    // Fonction pour rafraîchir la liste
    const handleRefresh = () => {
        setIsRefreshing(true);
        loadArticles();
    };
    
    // Fonctions pour la gestion des suppressions
    const initiateProgressiveDelete = (article) => {
        setPendingDeleteArticle(article);
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
                finalizeDelete(article.id);
                setPendingDeleteArticle(null);
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
        setPendingDeleteArticle(null);
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
        
        // Appel API pour supprimer définitivement l'article
        ArticleContratTravailService.remove(id)
            .then(() => {
                setArticles(articles.filter(article => article.id !== id));
                setToastMessage("Article supprimé avec succès");
                setShowToast(true);
            })
            .catch(error => {
                console.error("Erreur lors de la suppression de l'article:", error);
                setError("Erreur lors de la suppression de l'article");
                setShowToast(true);
                setToastMessage("Erreur lors de la suppression de l'article");
            });
    };
    
    // Fonction pour gérer la sélection d'un article
    const handleArticleSelection = (articleId) => {
        setSelectedArticles(prevSelected => {
            if (prevSelected.includes(articleId)) {
                return prevSelected.filter(id => id !== articleId);
            } else {
                return [...prevSelected, articleId];
            }
        });
    };
    
    // Fonction pour gérer la sélection/désélection de tous les articles
    const handleSelectAllArticles = (checked) => {
        if (checked) {
            const allArticleIds = paginatedArticles.map(article => article.id);
            setSelectedArticles(allArticleIds);
        } else {
            setSelectedArticles([]);
        }
    };
    
    // Fonction pour supprimer plusieurs articles à la fois
    const bulkDeleteArticles = () => {
        setLoading(true);
        
        const deletePromises = selectedArticles.map(id => ArticleContratTravailService.remove(id));
        
        Promise.all(deletePromises)
            .then(() => {
                setArticles(articles.filter(article => !selectedArticles.includes(article.id)));
                setToastMessage(`${selectedArticles.length} article(s) supprimé(s) avec succès`);
                setShowToast(true);
                setSelectedArticles([]);
                setShowBulkDeleteModal(false);
            })
            .catch(error => {
                console.error("Erreur lors de la suppression des articles:", error);
                setError("Erreur lors de la suppression des articles");
                setShowToast(true);
                setToastMessage("Erreur lors de la suppression des articles");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Fonction pour trier les articles
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
        setCurrentPage(1);
    };

    // Fonction pour obtenir les articles filtrés
    const getFilteredArticles = useCallback(() => {
        return articles.filter(article => {
            const textMatch = 
                (article.libelle && article.libelle.toLowerCase().includes(filter.toLowerCase())) ||
                (article.contenu && article.contenu.toLowerCase().includes(filter.toLowerCase())) ||
                (article.id && article.id.toString().includes(filter));
                
            return textMatch;
        });
    }, [articles, filter]);

    // Fonction pour obtenir les articles triés après filtrage
    const sortedArticles = useMemo(() => {
        const filteredArticles = getFilteredArticles();
        
        if (!sortConfig.key) return filteredArticles;
        
        return [...filteredArticles].sort((a, b) => {
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
    }, [getFilteredArticles, sortConfig]);

    // Fonction pour obtenir les articles à afficher pour la pagination
    const paginatedArticles = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedArticles.slice(indexOfFirstItem, indexOfLastItem);
    }, [sortedArticles, currentPage, itemsPerPage]);
    
    // Gestion de la pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        
        // Faire défiler vers le haut de la liste
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Pagination
    const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
    
    // Créer les éléments de pagination de manière réactive en fonction de la taille d'écran
    const renderPaginationItems = () => {
        const isMobile = window.innerWidth < 576;
        const items = [];
        
        // Si pas de pages, ne rien afficher
        if (totalPages === 0) return items;
        
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
                    <p className="mt-3">Chargement des articles de contrat de travail...</p>
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
        <Container fluid className="article-contrat-list-container py-4 px-4">
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
                        {pendingDeleteArticle && (
                            <>
                                <p>
                                    Suppression de l'article <strong>"{pendingDeleteArticle.libelle}"</strong> dans 
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
                                        aria-label={`Annuler la suppression de l'article ${pendingDeleteArticle.libelle}`}
                                    >
                                        <FaUndo className="me-1" /> Annuler
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => finalizeDelete(pendingDeleteArticle.id)}
                                        aria-label={`Confirmer la suppression immédiate de l'article ${pendingDeleteArticle.libelle}`}
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
                                <FaFileContract className="me-2 text-primary" />
                                Articles de contrat de travail
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
                                            placeholder="Rechercher par libellé ou contenu..."
                                            value={filter}
                                            onChange={e => {
                                                setFilter(e.target.value);
                                                setCurrentPage(1); // Reset pagination on search
                                            }}
                                            aria-label="Rechercher des articles"
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
                                        to="/article-contrat-travail/create"
                                        variant="primary"
                                        className="me-2"
                                        aria-label="Ajouter un nouvel article"
                                    >
                                        <FaPlus className="me-1 d-md-inline d-none" /> 
                                        <span className="d-md-inline d-none">Ajouter</span>
                                        <FaPlus className="d-md-none" />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        aria-label="Supprimer les articles sélectionnés"
                                        onClick={() => setShowBulkDeleteModal(true)}
                                        disabled={selectedArticles.length === 0}
                                    >
                                        <FaTrash className="me-1 d-md-inline d-none" />
                                        <span className="d-md-inline d-none">Supprimer</span>
                                        <FaTrash className="d-md-none" />
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

                    {/* Indicateur de filtres actifs */}
                    {filter && (
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
                            <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                className="ms-auto mb-1"
                                onClick={clearFilters}
                                aria-label="Effacer tous les filtres"
                            >
                                <FaTimes className="me-1" /> Effacer les filtres
                            </Button>
                        </div>
                    )}

                    {sortedArticles.length === 0 ? (
                        <div className="text-center p-5 empty-state">
                            <FaFileAlt 
                                size={50}
                                style={{ opacity: 0.5 }}
                                className="mb-4 text-muted"
                            />
                            <h4 className="text-muted">Aucun article trouvé</h4>
                            <p className="text-muted">
                                {filter ? 
                                    `Aucun résultat pour vos critères de recherche actuels` : 
                                    "Ajoutez un article pour commencer"
                                }
                            </p>
                            {filter ? (
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
                                to="/article-contrat-travail/create"
                                variant="outline-primary"
                                className="mt-2"
                                aria-label="Créer un nouvel article"
                            >
                                <FaPlus className="me-1" /> Créer un article
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Astuce pour les utilisateurs */}
                            <div className="d-flex align-items-center mb-3 bg-light p-2 rounded">
                                <FaRegLightbulb className="text-warning me-2" />
                                <small className="text-muted">
                                    <span className="d-none d-md-inline">Astuce : Cliquez sur les en-têtes de colonnes pour trier les données. Utilisez la recherche pour filtrer les articles.</span>
                                    <span className="d-md-none">Faites défiler horizontalement pour voir toutes les données.</span>
                                </small>
                            </div>
                            
                            <div className="table-responsive">
                                <Table hover responsive className="align-middle article-contrat-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>
                                                <Form.Check
                                                    type="checkbox"
                                                    onChange={(e) => handleSelectAllArticles(e.target.checked)}
                                                    checked={selectedArticles.length === paginatedArticles.length && paginatedArticles.length > 0}
                                                    aria-label="Sélectionner tous les articles"
                                                />
                                            </th>
                                            <th onClick={() => requestSort('id')} className="sortable-header">
                                                #
                                                {getSortDirectionIcon('id')}
                                            </th>
                                            <th onClick={() => requestSort('libelle')} className="sortable-header">
                                                Libellé
                                                {getSortDirectionIcon('libelle')}
                                            </th>
                                            <th style={{ minWidth: '200px' }}>
                                                Contenu
                                            </th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedArticles.map((article, index) => (
                                            <tr key={article.id} className="article-row">
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        onChange={() => handleArticleSelection(article.id)}
                                                        checked={selectedArticles.includes(article.id)}
                                                        aria-label={`Sélectionner l'article ${article.libelle}`}
                                                    />
                                                </td>
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="fw-medium">
                                                    <Link 
                                                        to={`/article-contrat-travail/${article.id}`}
                                                        className="text-decoration-none text-dark stretched-link-wrapper"
                                                    >
                                                        {article.libelle || "Sans titre"}
                                                    </Link>
                                                </td>
                                                <td>
                                                    {article.contenu 
                                                        ? article.contenu.length > 100 
                                                            ? article.contenu.substr(0, 100) + "..." 
                                                            : article.contenu
                                                        : <span className="text-muted">Pas de contenu</span>
                                                    }
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>Voir les détails</Tooltip>}
                                                        >
                                                            <Button 
                                                                as={Link}
                                                                to={`/article-contrat-travail/${article.id}`}
                                                                variant="outline-info"
                                                                size="sm"
                                                                className="btn-action"
                                                                aria-label={`Voir les détails de l'article ${article.libelle}`}
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
                                                                to={`/article-contrat-travail/edit/${article.id}`}
                                                                variant="outline-warning"
                                                                size="sm"
                                                                className="btn-action"
                                                                aria-label={`Modifier l'article ${article.libelle}`}
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
                                                                onClick={() => initiateProgressiveDelete(article)}
                                                                aria-label={`Supprimer l'article ${article.libelle}`}
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
                            Total: {sortedArticles.length} {sortedArticles.length > 1 ? 'articles' : 'article'}
                            {sortedArticles.length !== articles.length && (
                                <> (filtré de {articles.length})</>
                            )}
                        </small>
                    </div>
                    {totalPages > 1 && (
                        <div className="d-flex align-items-center">
                            <small className="text-muted me-2">Articles par page:</small>
                            <Form.Select 
                                size="sm" 
                                style={{ width: 'auto' }}
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Retour à la première page
                                }}
                                aria-label="Nombre d'articles par page"
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
            
            {/* Modal de confirmation pour la suppression en lot */}
            <Modal show={showBulkDeleteModal} onHide={() => setShowBulkDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaExclamationTriangle className="text-danger me-2" />
                        Confirmation de suppression
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Êtes-vous sûr de vouloir supprimer les {selectedArticles.length} articles sélectionnés ? </p>
                    <p className="text-danger fw-bold">Cette action est irréversible.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBulkDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={bulkDeleteArticles} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Suppression...
                            </>
                        ) : (
                            <>
                                <FaTrash className="me-2" />
                                Supprimer définitivement
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
