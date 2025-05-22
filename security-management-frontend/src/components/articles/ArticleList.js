// src/components/articles/ArticleList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticleService from "../../services/ArticleService";
import ContratService from "../../services/ContratService";
import "../../styles/ArticleList.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, faPencilAlt, faTrash, faPlus, faSearch, 
    faListUl, faTh, faFilter, faSortAmountDown, faSortAmountUp,
    faFileContract, faSort, faDownload, faSync
} from '@fortawesome/free-solid-svg-icons';
import { Dropdown, Badge, Button, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap';

export default function ArticleList() {
    const [articles, setArticles] = useState([]);
    const [contrats, setContrats] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("list"); // "list" ou "card"
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const [filteredContratId, setFilteredContratId] = useState(null);
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const nav = useNavigate();
    
    useEffect(() => {
        setLoading(true);
        ArticleService.getAll()
            .then(res => {
                const arr = res.data;
                setArticles(arr);

                // charger tous les contrats liés
                const ids = Array.from(
                    new Set(arr.map(a => a.contratId).filter(Boolean))
                );
                return Promise.all(
                    ids.map(id =>
                        ContratService.getById(id)
                            .then(r => ({ id, data: r.data }))
                            .catch(() => null)
                    )
                );
            })
            .then(results => {
                const map = {};
                results.forEach(r => {
                    if (r) map[r.id] = r.data;
                });
                setContrats(map);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [refreshTrigger]);

    const handleDelete = id => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
            ArticleService.remove(id)
                .then(() => setArticles(a => a.filter(x => x.id !== id)))
                .catch(err => {
                    console.error(err);
                    alert("Une erreur est survenue lors de la suppression");
                });
        }
    };
    
    const handleBulkDelete = () => {
        if (selectedArticles.length === 0) return;
        
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedArticles.length} articles sélectionnés ?`)) {
            Promise.all(
                selectedArticles.map(id => ArticleService.remove(id))
            )
            .then(() => {
                setArticles(a => a.filter(x => !selectedArticles.includes(x.id)));
                setSelectedArticles([]);
                setSelectAll(false);
            })
            .catch(err => {
                console.error(err);
                alert("Une erreur est survenue lors de la suppression en masse");
            });
        }
    };
    
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        
        if (newSelectAll) {
            setSelectedArticles(filteredArticles.map(a => a.id));
        } else {
            setSelectedArticles([]);
        }
    };
    
    const handleSelectArticle = (id) => {
        if (selectedArticles.includes(id)) {
            setSelectedArticles(prev => prev.filter(articleId => articleId !== id));
        } else {
            setSelectedArticles(prev => [...prev, id]);
        }
    };
    
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };
      // Filtrer les articles par recherche et contrat
    const filteredArticles = articles.filter(article => {
        const matchesSearch = 
            article.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (article.numero?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contrats[article.contratId]?.referenceContrat || "")?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesContratFilter = filteredContratId === null || article.contratId === filteredContratId;
        
        return matchesSearch && matchesContratFilter;
    });
    
    // Trier les articles
    const sortedArticles = [...filteredArticles].sort((a, b) => {
        let valA, valB;
        
        switch(sortField) {
            case 'id':
                valA = a.id;
                valB = b.id;
                break;
            case 'numero':
                valA = a.numero || 0;
                valB = b.numero || 0;
                break;
            case 'titre':
                valA = a.titre || '';
                valB = b.titre || '';
                break;            case 'contrat':
                valA = (contrats[a.contratId]?.referenceContrat || '') || '';
                valB = (contrats[b.contratId]?.referenceContrat || '') || '';
                break;
            default:
                valA = a.id;
                valB = b.id;
        }
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
      // Générer la liste des contrats pour le filtre
    const contratOptions = Object.entries(contrats).map(([id, c]) => ({
        id: id,
        label: c?.referenceContrat || `Contrat #${id}`
    }));
    
    // Générer un rapport CSV exportable
    const generateCsv = () => {
        const headers = ["ID", "Numéro", "Titre", "Contrat (réf.)"];
        
        const csvRows = [
            headers.join(','),
            ...sortedArticles.map(a => {
                const c = contrats[a.contratId];                return [
                    a.id,
                    a.numero || '',
                    `"${(a.titre || '').replace(/"/g, '""')}"`,
                    `"${((c?.referenceContrat || a.contratId || '').toString()).replace(/"/g, '""')}"`
                ].join(',');
            })
        ];
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `articles_contrat_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Rendu des tooltips
    const renderTooltip = (props, content) => (
        <Tooltip id="button-tooltip" {...props}>
            {content}
        </Tooltip>
    );

    return (
        <div className="article-list-container container-fluid py-4">
            <div className="article-header-section">
                <div className="article-title-section">
                    <h2>
                        <FontAwesomeIcon icon={faFileContract} className="me-2" /> 
                        Articles de contrat
                        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                    </h2>
                    <div className="d-flex">
                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Rafraîchir la liste")}>
                            <Button 
                                variant="outline-secondary" 
                                className="me-2" 
                                onClick={handleRefresh}
                            >
                                <FontAwesomeIcon icon={faSync} />
                            </Button>
                        </OverlayTrigger>
                        <button 
                            className="btn btn-primary btn-add-article" 
                            onClick={() => nav("/articles/create")}
                        >
                            <FontAwesomeIcon icon={faPlus} className="me-1" /> Créer un Article
                        </button>
                    </div>
                </div>
                
                <div className="article-tools-row">
                    {/* Barre de recherche */}
                    <div className="article-search-container">
                        <div className="search-wrapper">
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="Rechercher un article..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        </div>
                    </div>
                    
                    {/* Actions groupées */}
                    <div className="article-filters-actions">
                        {/* Filtre contrats */}
                        <Dropdown className="me-2">
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-contrat">
                                <FontAwesomeIcon icon={faFilter} className="me-2" />                                {filteredContratId ? 
                                    `Contrat: ${(contrats[filteredContratId]?.referenceContrat || filteredContratId)}` : 
                                    'Tous les contrats'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item 
                                    active={filteredContratId === null}
                                    onClick={() => setFilteredContratId(null)}
                                >
                                    Tous les contrats
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                {contratOptions.map(option => (
                                    <Dropdown.Item 
                                        key={option.id}
                                        active={filteredContratId === option.id}
                                        onClick={() => setFilteredContratId(option.id)}
                                    >
                                        {option.label}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        
                        {/* Actions pour les éléments sélectionnés */}
                        <div className="d-flex align-items-center">
                            {selectedArticles.length > 0 && (
                                <>
                                    <Badge bg="primary" className="me-2">
                                        {selectedArticles.length} sélectionné(s)
                                    </Badge>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        className="me-2"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="me-1" /> Supprimer
                                    </Button>
                                </>
                            )}
                            
                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Exporter en CSV")}>
                                <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    onClick={generateCsv}
                                    className="me-2"
                                >
                                    <FontAwesomeIcon icon={faDownload} />
                                </Button>
                            </OverlayTrigger>
                        </div>
                        
                        {/* Boutons de basculement de vue */}
                        <div className="view-toggle ms-2">
                            <button 
                                className={`btn btn-sm ${viewMode === 'list' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <FontAwesomeIcon icon={faListUl} />
                            </button>
                            <button 
                                className={`btn btn-sm ${viewMode === 'card' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                onClick={() => setViewMode('card')}
                            >
                                <FontAwesomeIcon icon={faTh} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2 text-muted">Chargement des articles de contrat...</p>
                </div>
            ) : sortedArticles.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FontAwesomeIcon icon={faFileContract} size="4x" />
                    </div>
                    <h4>Aucun article trouvé</h4>
                    <p className="text-muted">
                        {searchTerm || filteredContratId !== null ? 
                            'Aucun résultat pour votre recherche. Ajustez vos critères de recherche.' : 
                            'Aucun article de contrat n\'a été créé. Commencez par en créer un nouveau.'}
                    </p>
                    <button className="btn btn-outline-primary mt-3" onClick={() => nav('/articles/create')}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Créer un article
                    </button>
                </div>
            ) : viewMode === 'list' ? (
                <div className="table-responsive article-table animate__animated animate__fadeIn">
                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <th width="40">
                                <div className="form-check">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </div>
                            </th>
                            <th onClick={() => handleSort('id')} className="sortable-header">
                                ID
                                {sortField === 'id' && (
                                    <FontAwesomeIcon 
                                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                                        className="ms-2"
                                    />
                                )}
                                {sortField !== 'id' && <FontAwesomeIcon icon={faSort} className="ms-2 text-muted" />}
                            </th>
                            <th onClick={() => handleSort('numero')} className="sortable-header">
                                Numéro
                                {sortField === 'numero' && (
                                    <FontAwesomeIcon 
                                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                                        className="ms-2"
                                    />
                                )}
                                {sortField !== 'numero' && <FontAwesomeIcon icon={faSort} className="ms-2 text-muted" />}
                            </th>
                            <th onClick={() => handleSort('titre')} className="sortable-header">
                                Titre
                                {sortField === 'titre' && (
                                    <FontAwesomeIcon 
                                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                                        className="ms-2"
                                    />
                                )}
                                {sortField !== 'titre' && <FontAwesomeIcon icon={faSort} className="ms-2 text-muted" />}
                            </th>
                            <th onClick={() => handleSort('contrat')} className="sortable-header">
                                Contrat (réf.)
                                {sortField === 'contrat' && (
                                    <FontAwesomeIcon 
                                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                                        className="ms-2"
                                    />
                                )}
                                {sortField !== 'contrat' && <FontAwesomeIcon icon={faSort} className="ms-2 text-muted" />}
                            </th>
                            <th className="text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedArticles.map((a, index) => {
                            const c = contrats[a.contratId];
                            const isSelected = selectedArticles.includes(a.id);
                            const animationDelay = index * 50; // ms
                            
                            return (
                                <tr 
                                    key={a.id} 
                                    className={`article-item ${isSelected ? 'selected-row' : ''}`}
                                    style={{ animationDelay: `${animationDelay}ms` }}
                                >
                                    <td>
                                        <div className="form-check">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => handleSelectArticle(a.id)}
                                            />
                                        </div>
                                    </td>
                                    <td>{a.id}</td>
                                    <td className="article-numero">{a.numero || '—'}</td>
                                    <td className="article-title">{a.titre || '<Sans titre>'}</td>
                                    <td>
                                        {c ? (
                                            <span 
                                                className="contrat-badge"
                                                onClick={() => setFilteredContratId(a.contratId)}
                                                title="Filtrer par ce contrat"
                                            >
                                                {c.referenceContrat}
                                            </span>
                                        ) : (
                                            a.contratId ? (
                                                <span className="text-muted">ID: {a.contratId}</span>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Voir les détails")}>
                                                <button 
                                                    className="btn btn-action btn-view" 
                                                    onClick={() => nav(`/articles/${a.id}`)}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Modifier l'article")}>
                                                <button 
                                                    className="btn btn-action btn-edit" 
                                                    onClick={() => nav(`/articles/edit/${a.id}`)}
                                                >
                                                    <FontAwesomeIcon icon={faPencilAlt} />
                                                </button>
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Supprimer l'article")}>
                                                <button 
                                                    className="btn btn-action btn-delete" 
                                                    onClick={() => handleDelete(a.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="article-cards">
                    {sortedArticles.map((a, index) => {
                        const c = contrats[a.contratId];
                        const isSelected = selectedArticles.includes(a.id);
                        const animationDelay = index * 50; // ms
                        
                        return (
                            <div 
                                key={a.id} 
                                className={`card article-card ${isSelected ? 'selected-card' : ''}`}
                                style={{ animationDelay: `${animationDelay}ms` }}
                            >
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="form-check">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => handleSelectArticle(a.id)}
                                            />
                                        </div>
                                        <h5 className="card-title mb-0">{a.titre || "<Sans titre>"}</h5>
                                        <span className="badge bg-light text-dark">N° {a.numero || '—'}</span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <p className="mb-0"><strong>Contrat:</strong> {c ? (
                                                <span 
                                                    className="contrat-badge"
                                                    onClick={() => setFilteredContratId(a.contratId)}
                                                    title="Filtrer par ce contrat"
                                                >
                                                    {c.referenceContrat}
                                                </span>
                                            ) : (
                                                a.contratId ? (
                                                    <span className="text-muted">ID: {a.contratId}</span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )
                                            )}</p>
                                        </div>
                                        <span className="badge bg-info text-dark article-id">ID: {a.id}</span>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="action-buttons">
                                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Voir les détails")}>
                                                <button 
                                                    className="btn btn-sm btn-outline-info me-2" 
                                                    onClick={() => nav(`/articles/${a.id}`)}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Modifier l'article")}>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary me-2" 
                                                    onClick={() => nav(`/articles/edit/${a.id}`)}
                                                >
                                                    <FontAwesomeIcon icon={faPencilAlt} />
                                                </button>
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Supprimer l'article")}>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger" 
                                                    onClick={() => handleDelete(a.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Pagination peut être ajoutée ici si nécessaire */}
            {sortedArticles.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                        <small className="text-muted">
                            Affichage de {sortedArticles.length} article{sortedArticles.length > 1 ? 's' : ''} 
                            {articles.length !== sortedArticles.length ? ` sur ${articles.length}` : ''}
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
}
