// src/components/geolocalisations/GeolocalisationDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import GeolocalisationService from "../../services/GeolocalisationService";
import "../../styles/GeolocalisationDetail.css";

export default function GeolocalisationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [geo, setGeo]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        GeolocalisationService.getGeolocalisationById(id)
            .then(({ data }) => setGeo(data))
            .catch(() => setError("❌ Impossible de récupérer cette géolocalisation."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loader">⏳ Chargement des détails…</div>;
    if (error)   return <div className="error">{error}</div>;

    return (
        <div className="detail-container">
            <h2>📍 Détails de la Géolocalisation #{geo.id}</h2>

            {/* Carte Leaflet */}
            <MapContainer
                center={[geo.position.latitude, geo.position.longitude]}
                zoom={13}
                className="map-preview"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[geo.position.latitude, geo.position.longitude]} />
            </MapContainer>

            {/* Infos */}
            <div className="info-group">
                <label>📡 Précision GPS :</label>
                <p>{geo.gpsPrecision} mètre{geo.gpsPrecision > 1 ? "s" : ""}</p>
            </div>
            <div className="info-group">
                <label>🗺️ Position :</label>
                <p><strong>Lat :</strong> {geo.position.latitude.toFixed(6)}</p>
                <p><strong>Lng :</strong> {geo.position.longitude.toFixed(6)}</p>
            </div>

            {/* Missions */}
            <div className="missions-detail">
                <h3>🎯 Missions rattachées</h3>
                {geo.missions.length > 0 ? (
                    <ul>
                        {geo.missions.map(m => (
                            <li key={m.id}>
                                <span className="mission-title">{m.titre}</span>
                                <span className={`status-badge ${m.statutMission.toLowerCase()}`}>
                  {m.statutMission}
                </span>
                                <div className="mission-meta">
                                    Du {m.dateDebut} au {m.dateFin}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p><em>Aucune mission assignée.</em></p>
                )}
            </div>

            {/* Actions */}
            <div>
                <button
                    className="btn-action"
                    onClick={() => navigate(`/geolocalisations/edit/${geo.id}`)}
                >
                    ✏️ Modifier
                </button>
                <button
                    className="btn-action delete"
                    onClick={() => {
                        if (window.confirm("Supprimer cette géoloc ?")) {
                            GeolocalisationService.deleteGeolocalisation(geo.id)
                                .then(() => navigate("/geolocalisations"))
                                .catch(() => alert("Erreur lors de la suppression."));
                        }
                    }}
                >
                    🗑️ Supprimer
                </button>
            </div>

            <button className="btn-back" onClick={() => navigate(-1)}>
                ← Retour à la liste
            </button>
        </div>
    );
}
