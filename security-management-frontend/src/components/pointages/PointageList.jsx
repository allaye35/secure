import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PointageService from "../../services/PointageService";
import "../../styles/PointageList.css";

export default function PointageList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        PointageService.getAll()
            .then(({ data }) => setItems(data))
            .catch(() => setError("Erreur de chargement des pointages"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = (id) => {
        if (!window.confirm("Confirmer la suppression ?")) return;
        PointageService.delete(id)
            .then(() => setItems(prev => prev.filter(x => x.id !== id)))
            .catch(() => alert("Échec de la suppression"));
    };

    if (loading) return <p>Chargement…</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="pointage-list">
            <h2>Pointages</h2>
            <button onClick={() => navigate("/pointages/create")}>➕ Nouveau pointage</button>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Date & Heure</th>
                    <th>Présent</th>
                    <th>Retard</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Mission ID</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {items.length === 0 ? (
                    <tr><td colSpan="8">Aucun pointage</td></tr>
                ) : items.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{new Date(p.datePointage).toLocaleString()}</td>
                        <td>{p.estPresent ? "✔️" : "❌"}</td>
                        <td>{p.estRetard ? "⌛" : "—"}</td>
                        <td>{p.positionActuelle?.latitude ?? "-"}</td>
                        <td>{p.positionActuelle?.longitude ?? "-"}</td>
                        <td>{p.mission?.id ?? "-"}</td>
                        <td>
                            <button onClick={() => navigate(`/pointages/${p.id}`)}>👁️</button>
                            <button onClick={() => navigate(`/pointages/edit/${p.id}`)}>✏️</button>
                            <button onClick={() => handleDelete(p.id)}>🗑️</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}