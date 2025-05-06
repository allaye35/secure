import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CarteProService from "../../services/CarteProService";
import AgentService from "../../services/AgentService";
import "../../styles/AgentList.css"; // on réutilise le même style de tableau

const CarteProList = () => {
    const [list, setList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [agents, setAgents] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    
    // Types de cartes disponibles (extraits de l'enum TypeCarteProfessionnelle)
    const typeOptions = [
        "CQP_APS", 
        "GARDE_DU_CORPS", 
        "SECURITE_EVENEMENTIELLE", 
        "SURVEILLANCE_TECHNIQUE", 
        "RONDEUR", 
        "CONTROLEUR_ACCÈS", 
        "AGENT_SURVEILLANCE_VIDEO"
    ];

    // Fonction pour charger les données
    const loadData = () => {
        setLoading(true);
        setError(null);
        
        // Récupérer toutes les cartes professionnelles et les agents
        Promise.all([
            CarteProService.getAll(),
            AgentService.getAllAgents()
        ])
            .then(([cartesRes, agentsRes]) => {
                const cartesData = cartesRes.data;
                setList(cartesData);
                setFilteredList(cartesData);
                
                // Créer un dictionnaire d'agents pour un accès facile par ID
                const agentsMap = {};
                agentsRes.data.forEach(agent => {
                    agentsMap[agent.id] = agent;
                });
                setAgents(agentsMap);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement:", err);
                setError("Impossible de charger les données.");
                setLoading(false);
            });
    };

    // Charger les données au montage du composant
    useEffect(() => {
        loadData();
    }, []);

    // Appliquer les filtres lorsque searchTerm ou typeFilter changent
    useEffect(() => {
        applyFilters();
    }, [searchTerm, typeFilter, list]);

    // Fonction pour appliquer les filtres
    const applyFilters = () => {
        let result = [...list];
        
        // Filtre par type de carte
        if (typeFilter) {
            result = result.filter(carte => carte.typeCarte === typeFilter);
        }
        
        // Filtre par terme de recherche (nom d'agent ou numéro de carte)
        if (searchTerm.trim() !== "") {
            const searchTermLower = searchTerm.toLowerCase();
            result = result.filter(carte => {
                const agent = agents[carte.agentId];
                const agentName = agent ? `${agent.nom} ${agent.prenom}`.toLowerCase() : "";
                const numeroLower = carte.numeroCarte ? carte.numeroCarte.toLowerCase() : "";
                
                return agentName.includes(searchTermLower) || numeroLower.includes(searchTermLower);
            });
        }
        
        setFilteredList(result);
    };

    // Fonction pour obtenir les détails d'un agent par son ID
    const getAgentInfo = (agentId) => {
        if (!agentId) return "Non assigné";
        const agent = agents[agentId];
        return agent ? `${agent.nom} ${agent.prenom}` : `Agent #${agentId}`;
    };

    const handleDelete = (id, numeroCarte) => {
        if (window.confirm(`Voulez-vous vraiment supprimer la carte ${numeroCarte} ?`)) {
            CarteProService.delete(id)
                .then(() => {
                    // Mise à jour des deux listes après suppression
                    const updatedList = list.filter(carte => carte.id !== id);
                    setList(updatedList);
                    setFilteredList(updatedList.filter(carte => {
                        // Réappliquer les filtres actuels
                        if (typeFilter && carte.typeCarte !== typeFilter) return false;
                        if (searchTerm.trim() !== "") {
                            const searchTermLower = searchTerm.toLowerCase();
                            const agent = agents[carte.agentId];
                            const agentName = agent ? `${agent.nom} ${agent.prenom}`.toLowerCase() : "";
                            const numeroLower = carte.numeroCarte ? carte.numeroCarte.toLowerCase() : "";
                            return agentName.includes(searchTermLower) || numeroLower.includes(searchTermLower);
                        }
                        return true;
                    }));
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression:", err);
                    alert("Erreur lors de la suppression de la carte professionnelle");
                });
        }
    };

    // Fonction pour réinitialiser les filtres
    const resetFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="agent-list-container">
            <div className="controls">
                <h2>Cartes Professionnelles</h2>
                <Link to="/cartes-professionnelles/create" className="btn add-btn">
                    <i className="fas fa-plus-circle"></i> Nouvelle carte
                </Link>
            </div>

            {/* Section de filtres */}
            <div className="filters-container" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                    <div className="search-filter" style={{ flex: 2 }}>
                        <input
                            type="text"
                            placeholder="Rechercher par agent ou numéro..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    
                    <div className="type-filter" style={{ flex: 1 }}>
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">Tous les types</option>
                            {typeOptions.map(type => (
                                <option key={type} value={type}>
                                    {type.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className="btn btn-secondary"
                            onClick={resetFilters}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <i className="fas fa-times"></i> Réinitialiser
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={loadData}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <i className="fas fa-sync-alt"></i> Actualiser
                        </button>
                    </div>
                </div>
                
                {/* Statistiques sur les filtres */}
                <div className="filter-stats" style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                    {filteredList.length === list.length ? (
                        <span>Affichage de toutes les cartes ({list.length})</span>
                    ) : (
                        <span>Affichage de {filteredList.length} carte(s) sur {list.length}</span>
                    )}
                </div>
            </div>

            <div className="table-wrapper">
                <table className="agent-table">
                    <thead>
                    <tr>
                        <th>Agent</th>
                        <th>Type</th>
                        <th>Numéro</th>
                        <th>Début</th>
                        <th>Fin</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredList.map(c => (
                        <tr key={c.id}>
                            <td>{getAgentInfo(c.agentId)}</td>
                            <td>{c.typeCarte && c.typeCarte.replace(/_/g, " ")}</td>
                            <td>{c.numeroCarte}</td>
                            <td>{new Date(c.dateDebut).toLocaleDateString()}</td>
                            <td>{new Date(c.dateFin).toLocaleDateString()}</td>
                            <td className="actions">
                                <Link to={`/cartes-professionnelles/${c.id}`} className="btn btn-info">
                                    <i className="fas fa-id-card"></i> Détails
                                </Link>
                                <Link to={`/cartes-professionnelles/edit/${c.id}`} className="btn btn-warning">
                                    <i className="fas fa-pen-to-square"></i> Modifier
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(c.id, c.numeroCarte)}
                                >
                                    <i className="fas fa-trash"></i> Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}

                    {filteredList.length === 0 && (
                        <tr>
                            <td colSpan="6" className="no-data">
                                {list.length === 0 ? (
                                    "Aucune carte trouvée."
                                ) : (
                                    "Aucune carte ne correspond aux critères de filtrage."
                                )}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CarteProList;
