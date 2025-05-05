import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DisponibiliteService from "../../services/DisponibiliteService";
import "../../styles/AgentList.css"; // reprend styles existants

const DisponibiliteList = () => {
    const [list, setList]   = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        DisponibiliteService.getAll()
            .then(res => setList(res.data))
            .catch(() => setError("Impossible de charger les disponibilités."));
    }, []);

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
                        <th>Agent ID</th>
                        <th>Début</th>
                        <th>Fin</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map((d,i) => (
                        <tr key={d.id}>
                            <td>{i+1}</td>
                            <td>{d.agentId}</td>
                            <td>{new Date(d.dateDebut).toLocaleString()}</td>
                            <td>{new Date(d.dateFin).toLocaleString()}</td>
                            <td className="actions">
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
                    ))}
                    {list.length===0 && (
                        <tr>
                            <td colSpan="5" className="no-data">
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
