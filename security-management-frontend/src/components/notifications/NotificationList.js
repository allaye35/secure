import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NotificationService from "../../services/NotificationService";
import "../../styles/AgentList.css"; // réutilise le style de tableau

const NotificationList = () => {
    const [list, setList]   = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        NotificationService.getAll()
            .then(res => setList(res.data))
            .catch(() => setError("Impossible de charger les notifications."));
    }, []);

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="agent-list-container">
            <div className="controls">
                <h2>Notifications</h2>
                <Link to="/notifications/create" className="btn add-btn">
                    ➕ Nouvelle notif.
                </Link>
            </div>

            <div className="table-wrapper">
                <table className="agent-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Titre</th>
                        <th>Destinataire</th>
                        <th>Type</th>
                        <th>Lu</th>
                        <th>Date d’envoi</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map((n,i) => (
                        <tr key={n.id}>
                            <td>{i+1}</td>
                            <td>{n.titre}</td>
                            <td>{n.destinataire}</td>
                            <td>{n.typeNotification}</td>
                            <td>{n.lu ? "✅" : "❌"}</td>
                            <td>{n.dateEnvoi.replace("T"," ").slice(0,19)}</td>
                            <td className="actions">
                                <Link to={`/notifications/edit/${n.id}`} className="btn edit">
                                    ✏️ Modifier
                                </Link>
                                <button
                                    className="btn delete"
                                    onClick={() => {
                                        if (window.confirm("Supprimer cette notification ?"))
                                            NotificationService.delete(n.id).then(() =>
                                                setList(list.filter(x => x.id !== n.id))
                                            );
                                    }}
                                >
                                    🗑️ Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {list.length === 0 && (
                        <tr>
                            <td colSpan="7" className="no-data">
                                Aucune notification.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NotificationList;
