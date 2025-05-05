import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DiplomeService from "../../services/DiplomeService";
import "../../styles/AgentList.css"; // réutilise le style de tableau

const DiplomeList = () => {
    const [list, setList]   = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        DiplomeService.getAll()
            .then(res => setList(res.data))
            .catch(() => setError("Impossible de charger les diplômes."));
    }, []);

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="agent-list-container">
            <div className="controls">
                <h2>Diplômes SSIAP</h2>
                <Link to="/diplomes-ssiap/create" className="btn add-btn">
                    ➕ Nouveau diplôme
                </Link>
            </div>

            <div className="table-wrapper">
                <table className="agent-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Agent ID</th>
                        <th>Niveau</th>
                        <th>Obtention</th>
                        <th>Expiration</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map((d,i) => (
                        <tr key={d.id}>
                            <td>{i+1}</td>
                            <td>{d.agentId}</td>
                            <td>{d.niveau}</td>
                            <td>{d.dateObtention?.slice(0,10) || "–"}</td>
                            <td>{d.dateExpiration?.slice(0,10) || "–"}</td>
                            <td className="actions">
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
                    {list.length===0 && (
                        <tr>
                            <td colSpan="6" className="no-data">
                                Aucun diplôme trouvé.
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
