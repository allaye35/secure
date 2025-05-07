import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DiplomeService from "../../services/DiplomeService";
import AgentService from "../../services/AgentService";
import "../../styles/AgentList.css"; // réutilise le style de tableau

const DiplomeList = () => {
    const [list, setList] = useState([]);
    const [agents, setAgents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour le filtrage
    const [searchTerm, setSearchTerm] = useState("");
    const [filterNiveau, setFilterNiveau] = useState("");
    const [filterDateType, setFilterDateType] = useState("all");
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Charger tous les diplômes
                const diplomesRes = await DiplomeService.getAll();
                const diplomes = diplomesRes.data;
                setList(diplomes);
                
                // Extraire les IDs uniques des agents pour éviter les doublons
                const agentIds = [...new Set(diplomes.map(diplome => diplome.agentId))];
                
                // Récupérer les informations pour chaque agent
                const agentsData = {};
                for (const agentId of agentIds) {
                    try {
                        const agentRes = await AgentService.getAgentById(agentId);
                        agentsData[agentId] = agentRes.data;
                    } catch (err) {
                        console.error(`Erreur lors du chargement de l'agent ${agentId}:`, err);
                        agentsData[agentId] = { nom: "Inconnu", prenom: "", email: "Agent non trouvé" };
                    }
                }
                
                setAgents(agentsData);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des diplômes:", err);
                setError("Impossible de charger les diplômes.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Fonction pour afficher les informations de l'agent
    const renderAgentInfo = (agentId) => {
        const agent = agents[agentId];
        if (!agent) return `Agent #${agentId}`;
        
        return (
            <div className="agent-info">
                <div><strong>{agent.nom} {agent.prenom}</strong></div>
                <div className="agent-email">{agent.email}</div>
            </div>
        );
    };

    // Fonction de filtrage des diplômes
    const filteredDiplomes = list.filter(diplome => {
        const agent = agents[diplome.agentId];
        const nomComplet = agent ? `${agent.nom} ${agent.prenom}`.toLowerCase() : "";
        const email = agent?.email?.toLowerCase() || "";
        const niveau = diplome.niveau?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        
        // Filtre par terme de recherche (nom, prénom, email ou niveau)
        const matchesSearch = !searchTerm || 
            nomComplet.includes(search) || 
            email.includes(search) ||
            niveau.includes(search);
        
        // Filtre par niveau
        const matchesNiveau = !filterNiveau || diplome.niveau === filterNiveau;
        
        // Filtre par type de date
        let matchesDateType = true;
        const currentDate = new Date();
        
        if (filterDateType === "expired") {
            // Diplômes expirés
            matchesDateType = diplome.dateExpiration && new Date(diplome.dateExpiration) < currentDate;
        } else if (filterDateType === "expiringSoon") {
            // Diplômes qui expirent dans moins de 3 mois
            if (diplome.dateExpiration) {
                const expirationDate = new Date(diplome.dateExpiration);
                const threeMonthsLater = new Date(currentDate);
                threeMonthsLater.setMonth(currentDate.getMonth() + 3);
                matchesDateType = expirationDate > currentDate && expirationDate <= threeMonthsLater;
            } else {
                matchesDateType = false;
            }
        } else if (filterDateType === "valid") {
            // Diplômes valides
            matchesDateType = !diplome.dateExpiration || new Date(diplome.dateExpiration) >= currentDate;
        }
        
        return matchesSearch && matchesNiveau && matchesDateType;
    });

    if (loading) return <div className="loading">Chargement des données...</div>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="agent-list-container">
            <div className="controls">
                <h2>Diplômes SSIAP</h2>
                <Link to="/diplomes-ssiap/create" className="btn add-btn">
                    ➕ Nouveau diplôme
                </Link>
            </div>
            
            {/* Filtres de recherche */}
            <div className="search-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, prénom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filter-group">
                    <label>Niveau SSIAP:</label>
                    <select 
                        value={filterNiveau} 
                        onChange={(e) => setFilterNiveau(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Tous</option>
                        <option value="SSIAP_1">SSIAP 1</option>
                        <option value="SSIAP_2">SSIAP 2</option>
                        <option value="SSIAP_3">SSIAP 3</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Date d'expiration:</label>
                    <select 
                        value={filterDateType} 
                        onChange={(e) => setFilterDateType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Tous</option>
                        <option value="valid">Valides</option>
                        <option value="expiringSoon">Expirent bientôt (3 mois)</option>
                        <option value="expired">Expirés</option>
                    </select>
                </div>
            </div>
            
            <div className="filter-info">
                {filteredDiplomes.length} diplôme(s) trouvé(s)
            </div>

            <div className="table-wrapper">
                <table className="agent-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Agent</th>
                        <th>Niveau</th>
                        <th>Obtention</th>
                        <th>Expiration</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredDiplomes.map((d,i) => (
                        <tr key={d.id}>
                            <td>{i+1}</td>
                            <td>{renderAgentInfo(d.agentId)}</td>
                            <td>{d.niveau}</td>
                            <td>{d.dateObtention?.slice(0,10) || "–"}</td>
                            <td>{d.dateExpiration?.slice(0,10) || "–"}</td>
                            <td className="actions">
                                <Link to={`/diplomes-ssiap/${d.id}`} className="btn view">
                                    👁️ Détails
                                </Link>
                                <Link to={`/diplomes-ssiap/edit/${d.id}`} className="btn edit">
                                    ✏️ Modifier
                                </Link>
                                <button
                                    className="btn delete"
                                    onClick={() => {
                                        if (window.confirm("Supprimer ce diplôme ?"))
                                            DiplomeService.delete(d.id).then(() =>
                                                setList(list.filter(x=>x.id!==d.id))
                                            );
                                    }}
                                >
                                    🗑️ Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredDiplomes.length===0 && (
                        <tr>
                            <td colSpan="6" className="no-data">
                                Aucun diplôme trouvé avec les critères de recherche actuels.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DiplomeList;
