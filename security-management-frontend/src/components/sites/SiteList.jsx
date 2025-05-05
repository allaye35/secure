// src/components/sites/SiteList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SiteService from "../../services/SiteService";

export default function SiteList() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Chargement des sites lors du montage du composant
    useEffect(() => {
        loadSites();
    }, []);

    // Fonction pour charger la liste des sites
    const loadSites = () => {
        setLoading(true);
        SiteService.getAllSites()
            .then(response => {
                console.log("Sites chargés :", response.data);
                setSites(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des sites:", err);
                setError("Erreur lors du chargement des sites. Veuillez réessayer.");
                setLoading(false);
            });
    };

    // Fonction pour supprimer un site
    const handleDelete = (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce site ?")) {
            SiteService.deleteSite(id)
                .then(() => {
                    console.log("Site supprimé avec succès");
                    // Rafraîchir la liste des sites
                    loadSites();
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression du site:", err);
                    setError("Erreur lors de la suppression du site. Veuillez réessayer.");
                });
        }
    };

    if (loading) {
        return (
            <div className="container mt-3">
                <p>Chargement des sites...</p>
            </div>
        );
    }

    return (
        <div className="container mt-3">
            <h2 className="mb-3">Liste des sites</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="mb-3">
                <Link to="/sites/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Ajouter un site
                </Link>
            </div>

            {sites.length === 0 ? (
                <div className="alert alert-info">
                    Aucun site n'a été trouvé. Cliquez sur "Ajouter un site" pour en créer un.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Adresse</th>
                                <th>Ville</th>
                                <th>Code Postal</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sites.map(site => (
                                <tr key={site.id}>
                                    <td>{site.id}</td>
                                    <td>{site.nom}</td>
                                    <td>{site.numero} {site.rue}</td>
                                    <td>{site.ville}</td>
                                    <td>{site.codePostal}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Link to={`/sites/${site.id}`} className="btn btn-info btn-sm">
                                                <i className="bi bi-eye"></i> Voir
                                            </Link>
                                            <Link to={`/sites/edit/${site.id}`} className="btn btn-warning btn-sm">
                                                <i className="bi bi-pencil"></i> Modifier
                                            </Link>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(site.id)}
                                            >
                                                <i className="bi bi-trash"></i> Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}