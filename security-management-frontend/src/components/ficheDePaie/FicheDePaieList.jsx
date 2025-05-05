import React, { useEffect, useState } from "react";
import { useNavigate }                 from "react-router-dom";
import FicheDePaieService             from "../../services/FicheDePaieService";
import "../../styles/FicheDePaieList.css";

export default function FicheDePaieList() {
    const [list, setList]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState("");
    const nav = useNavigate();

    useEffect(() => {
        FicheDePaieService.getAll()
            .then(({ data }) => setList(data))
            .catch(() => setError("Erreur de chargement"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Supprimer cette fiche ?")) return;
        FicheDePaieService.remove(id)
            .then(() => setList(l => l.filter(f => f.id !== id)))
            .catch(() => alert("Échec de la suppression"));
    };

    if (loading) return <p>Chargement…</p>;
    if (error)   return <p className="error">{error}</p>;

    return (
        <div className="fp-list">
            <h2>Fiches de paie</h2>
            <button className="btn-add" onClick={() => nav("/fiches/create")}>
                ➕ Nouvelle fiche
            </button>
            <table className="tbl-fp">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Réf.</th>
                    <th>Période</th>
                    <th>Salaire brut</th>
                    <th>Net à payer</th>
                    <th>Agent</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {list.length === 0 ? (
                    <tr><td colSpan="7">Aucune fiche</td></tr>
                ) : list.map(fp => (
                    <tr key={fp.id}>
                        <td>{fp.id}</td>
                        <td>{fp.reference}</td>
                        <td>{fp.periodeDebut} → {fp.periodeFin}</td>
                        <td>{fp.totalBrut} €</td>
                        <td>{fp.netAPayer} €</td>
                        <td>{fp.agentDeSecuriteId ?? "-"}</td>
                        <td>
                            <button onClick={() => nav(`/fiches/${fp.id}`)}>👁</button>
                            <button onClick={() => nav(`/fiches/edit/${fp.id}`)}>✏️</button>
                            <button onClick={() => handleDelete(fp.id)}>🗑️</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
