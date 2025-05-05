// src/components/sites/SiteDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SiteService from "../../services/SiteService";
import MissionService from "../../services/MissionService";

export default function SiteDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [site, setSite] = useState(null);
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Chargement du site au montage du composant
    useEffect(() => {
        // Chargement des détails du site
        SiteService.getSiteById(id)
            .then(response => {
                console.log("Site chargé:", response.data);
                setSite(response.data);
                
                // Si le site a des missions associées, on les charge
                if (response.data.missionsIds && response.data.missionsIds.length > 0) {
                    const missionPromises = response.data.missionsIds.map(
                        missionId => MissionService.getMissionById(missionId)
                    );
                    
                    Promise.all(missionPromises)
                        .then(missionsResponses => {
                            const missionsData = missionsResponses.map(res => res.data);
                            setMissions(missionsData);
                            setLoading(false);
                        })
                        .catch(err => {
                            console.error("Erreur lors du chargement des missions:", err);
                            setLoading(false);
                        });
                } else {
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Erreur lors du chargement du site:", err);
                setError("Erreur lors du chargement du site");
                setLoading(false);
            });
    }, [id]);

    const handleDelete = () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce site ?")) {
            SiteService.deleteSite(id)
                .then(() => {
                    console.log("Site supprimé avec succès");
                    navigate("/sites");
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression du site:", err);
                    setError("Erreur lors de la suppression");
                });
        }
    };

    if (loading) {
        return <div className="container mt-3"><p>Chargement des détails du site...</p></div>;
    }

    if (!site) {
        return (
            <div className="container mt-3">
                <div className="alert alert-danger">
                    Site non trouvé ou erreur de chargement.
                </div>
                <Link to="/sites" className="btn btn-primary">
                    Retour à la liste des sites
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-3">
            <h2>Détails du site: {site.nom}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Informations du site</h5>
                    <div>
                        <Link to={`/sites/edit/${id}`} className="btn btn-warning me-2">
                            <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        <button onClick={handleDelete} className="btn btn-danger">
                            <i className="bi bi-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <p><strong>ID:</strong> {site.id}</p>
                            <p><strong>Nom:</strong> {site.nom}</p>
                            <p><strong>Adresse:</strong> {site.numero} {site.rue}</p>
                            <p><strong>Code postal:</strong> {site.codePostal}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Ville:</strong> {site.ville}</p>
                            <p><strong>Département:</strong> {site.departement || "Non spécifié"}</p>
                            <p><strong>Région:</strong> {site.region || "Non spécifiée"}</p>
                            <p><strong>Pays:</strong> {site.pays || "Non spécifié"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Missions associées</h5>
                </div>
                <div className="card-body">
                    {missions.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Titre</th>
                                        <th>Date de début</th>
                                        <th>Date de fin</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {missions.map(mission => (
                                        <tr key={mission.id}>
                                            <td>{mission.id}</td>
                                            <td>{mission.titreMission || mission.titre || `Mission #${mission.id}`}</td>
                                            <td>
                                                {mission.dateDebutMission ? 
                                                    new Date(mission.dateDebutMission).toLocaleDateString() : 
                                                    "Non spécifiée"}
                                            </td>
                                            <td>
                                                {mission.dateFinMission ? 
                                                    new Date(mission.dateFinMission).toLocaleDateString() : 
                                                    "Non spécifiée"}
                                            </td>
                                            <td>
                                                <Link to={`/missions/${mission.id}`} className="btn btn-info btn-sm">
                                                    <i className="bi bi-eye"></i> Voir
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>Aucune mission associée à ce site.</p>
                    )}
                </div>
            </div>

            <div className="mt-3">
                <Link to="/sites" className="btn btn-secondary">
                    Retour à la liste des sites
                </Link>
            </div>
        </div>
    );
}