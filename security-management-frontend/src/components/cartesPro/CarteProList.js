import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CarteProService from "../../services/CarteProService";
import "../../styles/AgentList.css"; // on réutilise le même style de tableau

const CarteProList = () => {
    const [list, setList]   = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        CarteProService.getAll()
            .then(res => setList(res.data))
            .catch(() => setError("Impossible de charger les cartes."));
    }, []);

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="agent-list-container">
            <div className="controls">
                <h2>Cartes Professionnelles</h2>
                <Link to="/cartes-professionnelles/create" className="btn add-btn">
                    ➕ Nouvelle carte
                </Link>
            </div>

            <div className="table-wrapper">
                <table className="agent-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Agent ID</th>
                        <th>Type</th>
                        <th>Numéro</th>
                        <th>Début</th>
                        <th>Fin</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map((c,i) => (
                        <tr key={c.id}>
                            <td>{i+1}</td>
                            <td>{c.agentId}</td>
                            <td>{c.typeCarte}</td>
                            <td>{c.numeroCarte}</td>
                            <td>{new Date(c.dateDebut).toLocaleDateString()}</td>
                            <td>{new Date(c.dateFin).toLocaleDateString()}</td>
                            <td className="actions">
                                <Link to={`/cartes-professionnelles/edit/${c.id}`} className="btn edit">
                                    ✏️ Modifier
                                </Link>
                                <button
                                    className="btn delete"
                                    onClick={() => {
                                        if (window.confirm("Supprimer cette carte ?"))
                                            CarteProService.delete(c.id).then(() =>
                                                setList(list.filter(x=>x.id!==c.id))
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
                            <td colSpan="7" className="no-data">
                                Aucune carte trouvée.
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
