// src/components/agents/AgentList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AgentService from "../../services/AgentService";
import "../../styles/AgentList.css";

const AgentList = () => {
    const [agents, setAgents] = useState([]);
    const [filter, setFilter] = useState("");
    const [error, setError]   = useState(null);

    useEffect(() => {
        AgentService.getAllAgents()
            .then(res => setAgents(res.data))
            .catch(err => {
                console.error(err);
                setError("Impossible de charger la liste des agents.");
            });
    }, []);

    const filtered = agents.filter(a => {
        const term = filter.toLowerCase();
        return (
            a.nom.toLowerCase().includes(term) ||
            a.prenom.toLowerCase().includes(term) ||
            a.email.toLowerCase().includes(term)
        );
    });

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="agent-list-container">
            <div className="controls">
                <h2>Agents de sécurité</h2>
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Recherche nom, email…"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <Link to="/agents/create" className="btn add-btn">
                    ➕ Nouvel agent
                </Link>
            </div>

            <div className="table-wrapper">
                <table className="agent-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Nom / Prénom</th>
                        <th>Email</th>
                        <th>Tél.</th>
                        <th>Adresse</th>
                        <th>Né(e) le</th>
                        <th>Statut</th>
                        <th>Rôle</th>
                        <th>Zones</th>
                        <th>Missions</th>
                        <th>Diplômes</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((a, i) => (
                        <tr key={a.id}>
                            <td>{i + 1}</td>
                            <td>{a.nom} {a.prenom}</td>
                            <td>{a.email}</td>
                            <td>{a.telephone || "–"}</td>
                            <td className="address-cell">{a.adresse || "–"}</td>
                            <td>{a.dateNaissance || "–"}</td>
                            <td>{a.statut}</td>
                            <td>{a.role}</td>
                            <td>{a.zonesDeTravailIds?.length || 0}</td>
                            <td>{a.missionsIds?.length || 0}</td>
                            <td>{a.diplomesSSIAPIds?.length || 0}</td>
                            <td className="actions">
                                <Link to={`/agents/${a.id}`} className="btn view">Voir</Link>
                                <Link to={`/agents/edit/${a.id}`} className="btn edit">Modifier</Link>
                                <button
                                    className="btn delete"
                                    onClick={() => {
                                        if (window.confirm(`Supprimer ${a.nom} ${a.prenom} ?`)) {
                                            AgentService.deleteAgent(a.id).then(() =>
                                                setAgents(agents.filter(x => x.id !== a.id))
                                            );
                                        }
                                    }}
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr><td colSpan="12" className="no-data">Aucun agent trouvé.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentList;
