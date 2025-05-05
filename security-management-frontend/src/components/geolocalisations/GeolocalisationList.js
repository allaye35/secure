import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GeolocalisationService from "../../services/GeolocalisationService";
import "../../styles/GeolocalisationList.css";

export default function GeolocalisationList() {
    const [geolocs, setGeolocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        GeolocalisationService.getAllGeolocalisations()
            .then(({ data }) => setGeolocs(data))
            .catch(() => setError("Impossible de charger les géolocalisations."))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette géolocalisation ?")) return;
        GeolocalisationService.deleteGeolocalisation(id)
            .then(() => setGeolocs(g => g.filter(x => x.id !== id)))
            .catch(() => alert("Échec de la suppression."));
    };

    if (loading) return <div className="spinner" />;
    if (error)   return <p className="error">{error}</p>;

    if (!geolocs.length) {
        return (
            <div className="geo-empty">
                <p>Aucune géolocalisation n’a été trouvée.</p>
                <Link to="/geolocalisations/create" className="btn-add">
                    ➕ Ajouter une géolocalisation
                </Link>
            </div>
        );
    }

    return (
        <div className="geo-container">
            <div className="geo-header">
                <h2>📍 Mes Géolocalisations GPS</h2>
                <Link to="/geolocalisations/create" className="btn-add">
                    ➕ Nouvelle géolocalisation
                </Link>
            </div>

            <div className="geo-grid">
                {geolocs.map(g => (
                    <div key={g.id} className="geo-card">
                        <div className="geo-card-header">
                            <h3>Géo #{g.id}</h3>
                            <span className="precision">{g.gpsPrecision} m</span>
                        </div>

                        <p className="coords">
                            📌 <strong>Latitude</strong> : {g.position.latitude.toFixed(5)} <br/>
                            📌 <strong>Longitude</strong> : {g.position.longitude.toFixed(5)}
                        </p>

                        <div className="missions">
                            <strong>Missions rattachées :</strong>
                            {g.missions?.length ? (
                                <ul>
                                    {g.missions.map(m => (
                                        <li key={m.id}>
                                            <strong>{m.titre}</strong>
                                            <em>
                                                Du {m.dateDebut} au {m.dateFin} — Statut : {m.statutMission}
                                            </em>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <em>— Aucune mission assignée —</em>
                            )}
                        </div>

                        <div className="geo-actions">
                            <Link to={`/geolocalisations/${g.id}`} className="btn" title="Voir détails">
                                🔍 Voir
                            </Link>
                            <Link to={`/geolocalisations/edit/${g.id}`} className="btn" title="Modifier">
                                ✏️ Modifier
                            </Link>
                            <button
                                onClick={() => handleDelete(g.id)}
                                className="btn btn-delete"
                                title="Supprimer"
                            >
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
