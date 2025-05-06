import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import "../../styles/ZoneList.css";

const ZoneList = () => {
    const [zones, setZones] = useState([]);
    const [zoneAgents, setZoneAgents] = useState({});
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [agentLoadingError, setAgentLoadingError] = useState(false);

    useEffect(() => {
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
                }
            })
            .catch(err => {
                console.error("Erreur lors du chargement des zones:", err);
                setError("Impossible de charger les zones.");
                setLoading(false);
            });
    }, []);

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
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents:", err);
                setAgentLoadingError(true);
                setLoading(false);
            });
    };

    const filtered = zones.filter(z =>
        z.nom.toLowerCase().includes(filter.toLowerCase())
    );

    if (error) return <p className="error">{error}</p>;
    if (loading) return <p>Chargement des zones de travail...</p>;

    // Fonction pour afficher les agents associés à une zone
    const displayAgents = (zoneId) => {
        if (agentLoadingError) return "API indisponible";
        
        const agents = zoneAgents[zoneId] || [];
        
        if (agents.length === 0) return "Non assigné";
        
        return agents.map(agent => `${agent.nom || ''} ${agent.prenom || ''}`).join(", ");
    };

    return (
        <div className="zone-list-container">
            <div className="controls">
                <h2>Zones de travail</h2>
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Recherche nom..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <Link to="/zones/create" className="btn add-btn">
                    ➕ Nouvelle zone
                </Link>
            </div>

            {agentLoadingError && (
                <div className="warning-message">
                    ⚠️ L'API pour récupérer les agents par zone n'est pas disponible. L'information des agents associés ne sera pas affichée.
                </div>
            )}

            <div className="table-wrapper">
                <table className="zone-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Ville</th>
                        <th>Code postal</th>
                        <th>Agent rattaché</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((z, i) => (
                        <tr key={z.id}>
                            <td>{i + 1}</td>
                            <td>{z.nom}</td>
                            <td>{z.typeZone}</td>
                            <td>{z.ville || "–"}</td>
                            <td>{z.codePostal || "–"}</td>
                            <td>{displayAgents(z.id)}</td>
                            <td className="actions">
                                <Link to={`/zones/${z.id}`} className="btn view">Voir</Link>
                                <Link to={`/zones/edit/${z.id}`} className="btn edit">Modifier</Link>
                                <button
                                    className="btn delete"
                                    onClick={() => {
                                        if (window.confirm(`Supprimer la zone « ${z.nom} » ?`)) {
                                            ZoneService.remove(z.id)
                                                .then(() => setZones(zones.filter(x => x.id !== z.id)));
                                        }
                                    }}
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr><td colSpan="7" className="no-data">Aucune zone trouvée</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ZoneList;