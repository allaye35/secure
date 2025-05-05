// src/components/sites/SiteList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate }           from "react-router-dom";
import SiteService                     from "../../services/SiteService";

export default function SiteList() {
    const [sites, setSites] = useState([]);
    const nav = useNavigate();

    useEffect(() => {
        SiteService.getAllSites()
            .then(({ data }) => setSites(data))
            .catch(console.error);
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Supprimer ce site ?")) return;
        SiteService.deleteSite(id)
            .then(() => setSites(sites.filter(s => s.id !== id)))
            .catch(console.error);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>📍 Liste des sites</h2>
            <Link to="/sites/create" style={{ marginBottom: 12, display: "inline-block" }}>
                ➕ Nouveau site
            </Link>

            <table border="1" cellPadding="6" cellSpacing="0">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Numéro</th>
                    <th>Rue</th>
                    <th>Code postal</th>
                    <th>Ville</th>
                    <th>Département</th>
                    <th>Région</th>
                    <th>Pays</th>
                    <th># Missions</th>
                    <th>Actions</th>
                </tr>
                </thead>

                <tbody>
                {sites.length === 0 ? (
                    <tr>
                        <td colSpan="11" style={{ textAlign: "center" }}>
                            Aucun site
                        </td>
                    </tr>
                ) : sites.map(s => (
                    <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.nom}</td>
                        <td>{s.numero || "-"}</td>
                        <td>{s.rue || "-"}</td>
                        <td>{s.codePostal || "-"}</td>
                        <td>{s.ville || "-"}</td>
                        <td>{s.departement || "-"}</td>
                        <td>{s.region || "-"}</td>
                        <td>{s.pays || "-"}</td>
                        <td>{Array.isArray(s.missionsIds) ? s.missionsIds.length : 0}</td>
                        <td>
                            <button onClick={() => nav(`/sites/${s.id}`)}>Voir</button>{" "}
                            <button onClick={() => nav(`/sites/edit/${s.id}`)}>Modifier</button>{" "}
                            <button onClick={() => handleDelete(s.id)}>Supprimer</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
