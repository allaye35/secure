import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import "../../styles/TarifMissionList.css";


export default function TarifMissionList() {
    const [tarifs, setTarifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        TarifMissionService.getAll()
            .then(({ data }) => setTarifs(data))
            .catch(() => setError("Erreur de chargement des tarifs"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = (id) => {
        if (!window.confirm("Confirmer la suppression ?")) return;
        TarifMissionService.delete(id)
            .then(() => setTarifs(t => t.filter(x => x.id !== id)))
            .catch(() => alert("Échec de la suppression"));
    };

    if (loading) return <p>Chargement…</p>;
    if (error)   return <p className="error">{error}</p>;

    return (
        <div className="tarif-list">
            <h2>Tarifs Missions</h2>
            <button className="btn-add" onClick={() => navigate("/tarifs/create")}>
                ➕ Nouveau tarif
            </button>

            <table className="tbl-tarifs">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Type mission</th>
                    <th>Prix HT</th>
                    <th>Nuit (%)</th>
                    <th>Weekend (%)</th>
                    <th>Dimanche (%)</th>
                    <th>Férié (%)</th>
                    <th>TVA (%)</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {tarifs.length === 0 ? (
                    <tr>
                        <td colSpan="9" className="no-data">Aucun tarif</td>
                    </tr>
                ) : tarifs.map(t => (
                    <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.typeMission}</td>
                        <td>{t.prixUnitaireHT}</td>
                        <td>{t.majorationNuit}</td>
                        <td>{t.majorationWeekend}</td>
                        <td>{t.majorationDimanche}</td>
                        <td>{t.majorationFerie}</td>
                        <td>{t.tauxTVA}</td>
                        <td className="actions">
                            <button onClick={() => navigate(`/tarifs/${t.id}`)}>👁</button>
                            <button onClick={() => navigate(`/tarifs/edit/${t.id}`)}>✏️</button>
                            <button onClick={() => handleDelete(t.id)}>🗑️</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
