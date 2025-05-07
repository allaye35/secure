import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DisponibiliteService from "../../services/DisponibiliteService";
import AgentService from "../../services/AgentService";
import "../../styles/AgentList.css"; // reprend styles existants

const DisponibiliteList = () => {
    const [list, setList] = useState([]);
    const [agents, setAgents] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        // Chargement des disponibilités
        DisponibiliteService.getAll()
            .then(res => setList(res.data))
            .catch(() => setError("Impossible de charger les disponibilités."));
        
        // Chargement des agents pour avoir les détails
        AgentService.getAllAgents()
            .then(res => {
                // Créer un index des agents par ID pour faciliter la recherche
                const agentsIndex = {};
                res.data.forEach(agent => {
                    agentsIndex[agent.id] = agent;
                });
                setAgents(agentsIndex);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents", err);
                setError(error => error || "Impossible de charger les informations des agents.");
            });
    }, []);

    // Fonction pour obtenir les informations d'un agent à partir de son ID
    const getAgentInfo = (agentId) => {
        const agent = agents[agentId];
        if (!agent) return `Agent #${agentId}`;
        return `${agent.nom} ${agent.prenom}${agent.email ? ` - ${agent.email}` : ""}`;
    };

    // Fonction pour calculer la durée d'une disponibilité
    const calculateDuration = (dateDebut, dateFin) => {
        const start = new Date(dateDebut);
        const end = new Date(dateFin);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        const remainingHours = diffHours % 24;
        
        if (diffDays > 0) {
            return `${diffDays} jour${diffDays > 1 ? 's' : ''} et ${remainingHours} heure${remainingHours > 1 ? 's' : ''}`;
        } else {
            return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        }
    };

    // Fonction pour déterminer le statut d'une disponibilité
    const getDisponibiliteStatus = (dateDebut, dateFin) => {
        const now = new Date();
        const start = new Date(dateDebut);
        const end = new Date(dateFin);
        
        if (now < start) {
            return { status: "future", label: "À venir", color: "#007bff" };
        } else if (now > end) {
            return { status: "past", label: "Terminée", color: "#6c757d" };
        } else {
            return { status: "active", label: "En cours", color: "#28a745" };
        }
    };

    // Fonction pour vérifier les chevauchements avec d'autres disponibilités du même agent
    const checkOverlap = (disponibilite) => {
        const overlaps = list.filter(d => 
            d.id !== disponibilite.id && 
            d.agentId === disponibilite.agentId &&
            ((new Date(d.dateDebut) < new Date(disponibilite.dateFin) && 
              new Date(d.dateFin) > new Date(disponibilite.dateDebut)))
        );
        
        return overlaps.length > 0 ? 
            { hasOverlap: true, count: overlaps.length } : 
            { hasOverlap: false };
    };

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="agent-list-container">
            <div className="controls">
                <h2>Disponibilités</h2>
                <Link to="/disponibilites/create" className="btn add-btn">
                    ➕ Nouvelle dispo
                </Link>
            </div>

            <div className="table-wrapper">
                <table className="agent-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Agent</th>
                        <th>Statut</th>
                        <th>Début</th>
                        <th>Fin</th>
                        <th>Durée</th>
                        <th>Chevauchements</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map((d,i) => {
                        const status = getDisponibiliteStatus(d.dateDebut, d.dateFin);
                        const overlap = checkOverlap(d);
                        
                        return (
                            <tr key={d.id}>
                                <td>{i+1}</td>
                                <td>{getAgentInfo(d.agentId)}</td>
                                <td>
                                    <span 
                                        style={{ 
                                            backgroundColor: status.color,
                                            color: 'white',
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.85em'
                                        }}
                                    >
                                        {status.label}
                                    </span>
                                </td>
                                <td>{new Date(d.dateDebut).toLocaleString()}</td>
                                <td>{new Date(d.dateFin).toLocaleString()}</td>
                                <td>{calculateDuration(d.dateDebut, d.dateFin)}</td>
                                <td>
                                    {overlap.hasOverlap ? (
                                        <span 
                                            style={{ 
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.85em'
                                            }}
                                        >
                                            {overlap.count} conflit{overlap.count > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span 
                                            style={{ 
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.85em'
                                            }}
                                        >
                                            OK
                                        </span>
                                    )}
                                </td>
                                <td className="actions">
                                    <Link 
                                        to={`/disponibilites/${d.id}`} 
                                        className="btn view"
                                        style={{ marginRight: '5px' }}
                                    >
                                        🔍 Détails
                                    </Link>
                                    <Link to={`/disponibilites/edit/${d.id}`} className="btn edit">
                                        ✏️ Modifier
                                    </Link>
                                    <button
                                        className="btn delete"
                                        onClick={() => {
                                            if (window.confirm("Supprimer ?"))
                                                DisponibiliteService.delete(d.id).then(() =>
                                                    setList(list.filter(x => x.id!==d.id))
                                                );
                                        }}
                                    >
                                        🗑️ Supprimer
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {list.length===0 && (
                        <tr>
                            <td colSpan="8" className="no-data">
                                Aucune disponibilité.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DisponibiliteList;
