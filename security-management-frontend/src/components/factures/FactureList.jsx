import React, { useEffect, useState } from "react";
import { useNavigate }       from "react-router-dom";
import FactureService       from "../../services/FactureService";
import "../../services/FactureService";
import "../../styles/FactureList.css";


export default function FactureList() {
    const [factures, setFactures] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        FactureService.getAll()
            .then(({ data }) => setFactures(data))
            .catch(() => setError("Erreur de chargement des factures."))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Voulez-vous supprimer cette facture ?")) return;
        FactureService.delete(id)
            .then(() => setFactures(f => f.filter(x => x.id !== id)))
            .catch(() => alert("Échec de la suppression."));
    };

    if (loading) return <p>Chargement…</p>;
    if (error)   return <p className="error">{error}</p>;

    return (
        <div className="facture-list">
            <h2>Factures</h2>
            <button className="btn-add" onClick={() => navigate("/factures/create")}>
                ➕ Nouvelle facture
            </button>

            <table className="tbl-factures">
                <thead>
                <tr>
                    <th>Réf. facture</th>
                    <th>Date émission</th>
                    <th>Statut</th>
                    <th>HT (€)</th>
                    <th>TVA (€)</th>
                    <th>TTC (€)</th>
                    <th>Devis</th>
                    <th>Contrat</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {factures.length === 0
                    ? (
                        <tr>
                            <td colSpan="9" className="no-data">
                                Aucune facture
                            </td>
                        </tr>
                    )
                    : factures.map(f => (
                        <tr key={f.id}>
                            <td>{f.referenceFacture}</td>
                            <td>{f.dateEmission}</td>
                            <td>{f.statut}</td>
                            <td>{f.montantHT}</td>
                            <td>{f.montantTVA}</td>
                            <td>{f.montantTTC}</td>
                            <td>{f.devisId}</td>
                            <td>{f.contratId ?? "-"}</td>
                            <td className="actions">
                                <button onClick={() => navigate(`/factures/edit/${f.id}`)}>✏️</button>
                                <button onClick={() => handleDelete(f.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </div>
    );
}
