import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FactureService from "../../services/FactureService";
import "../../styles/FactureList.css";

export default function FactureList() {
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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

    const handlePrint = (id) => {
        navigate(`/factures/print/${id}`);
    };

    const handleCreateFromDevis = (devisId) => {
        setLoading(true);
        FactureService.createFromDevis(devisId)
            .then(({ data }) => {
                navigate(`/factures/${data.id}`);
            })
            .catch((err) => {
                setError("Erreur lors de la création de la facture : " + 
                    (err.response?.data?.message || err.message));
                setLoading(false);
            });
    };

    if (loading) return <div className="loader">Chargement…</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="facture-list">
            <h2>Factures</h2>
            
            <div className="facture-actions">
                <button 
                    className="btn-add" 
                    onClick={() => navigate("/factures/create")}
                >
                    ➕ Nouvelle facture
                </button>
                
                <button 
                    className="btn-periode" 
                    onClick={() => navigate("/factures/periode")}
                >
                    📅 Facturer une période
                </button>
                
                <button 
                    className="btn-from-devis"
                    onClick={() => {
                        const devisId = prompt("Entrez l'ID du devis à facturer :");
                        if (devisId) handleCreateFromDevis(devisId);
                    }}
                >
                    📋 Facturer un devis
                </button>
            </div>

            <table className="tbl-factures">
                <thead>
                    <tr>
                        <th>Réf. facture</th>
                        <th>Date émission</th>
                        <th>Statut</th>
                        <th>HT (€)</th>
                        <th>TVA (€)</th>
                        <th>TTC (€)</th>
                        <th>Client</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {factures.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="no-data">
                                Aucune facture
                            </td>
                        </tr>
                    ) : (
                        factures.map(f => (
                            <tr key={f.id}>
                                <td>{f.referenceFacture}</td>
                                <td>{new Date(f.dateEmission).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    <span className={`statut-badge ${f.statut.toLowerCase()}`}>
                                        {f.statut}
                                    </span>
                                </td>
                                <td>{f.montantHT.toFixed(2)}</td>
                                <td>{f.montantTVA.toFixed(2)}</td>
                                <td>{f.montantTTC.toFixed(2)}</td>
                                <td>{f.clientId}</td>
                                <td className="actions">
                                    <button 
                                        className="btn-view" 
                                        onClick={() => navigate(`/factures/${f.id}`)} 
                                        title="Voir les détails"
                                    >
                                        👁️
                                    </button>
                                    <button 
                                        className="btn-print" 
                                        onClick={() => handlePrint(f.id)}
                                        title="Imprimer la facture"
                                    >
                                        🖨️
                                    </button>
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => navigate(`/factures/edit/${f.id}`)}
                                        title="Modifier la facture"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDelete(f.id)}
                                        title="Supprimer la facture"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
