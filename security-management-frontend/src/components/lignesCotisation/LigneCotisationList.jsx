import React, { useEffect, useState } from "react";
import { useNavigate }                 from "react-router-dom";
import LigneCotisationService          from "../../services/LigneCotisationService";
import "../../styles/LigneCotisationList.css";

export default function LigneCotisationList() {
    const [list, setList]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        LigneCotisationService.getAll()
            .then(({ data }) => setList(data))
            .catch(() => setError("Erreur de chargement"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Supprimer cette ligne ?")) return;
        LigneCotisationService.delete(id)
            .then(() => setList(l => l.filter(x => x.id !== id)))
            .catch(() => alert("Échec de la suppression"));
    };

    if (loading) return <p>Chargement…</p>;
    if (error)   return <p className="error">{error}</p>;

    return (
        <div className="ligne-list">
            <h2>Lignes de cotisation</h2>
            <button className="btn-add" onClick={() => navigate("/lignes/create")}>
                ➕ Nouvelle ligne
            </button>
            <table className="tbl-lignes">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Libellé</th>
                    <th>Taux salarié</th>
                    <th>Montant salarié</th>
                    <th>Taux employeur</th>
                    <th>Montant employeur</th>
                    <th>Fiche ID</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {list.length === 0 ? (
                    <tr>
                        <td colSpan="8" className="no-data">Aucune ligne</td>
                    </tr>
                ) : list.map(item => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td title={item.libelle}>{item.libelle}</td>
                        <td>{item.tauxSalarial}%</td>
                        <td>{item.montantSalarial.toFixed(2)} €</td>
                        <td>{item.tauxEmployeur}%</td>
                        <td>{item.montantEmployeur.toFixed(2)} €</td>
                        <td>{item.ficheDePaieId}</td>
                        <td className="actions">
                            <button onClick={() => navigate(`/lignes/${item.id}`)}>👁️</button>
                            <button onClick={() => navigate(`/lignes/edit/${item.id}`)}>✏️</button>
                            <button onClick={() => handleDelete(item.id)}>🗑️</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
