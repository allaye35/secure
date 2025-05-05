// src/components/geolocalisations/CreateGeolocalisation.jsx

import React, { useState, useEffect } from "react";
import { useNavigate }                from "react-router-dom";

// 1) CSS Leaflet (à importer *une fois* dans ton app, idéalement dans index.js ou App.js)
//    import "leaflet/dist/leaflet.css";

// 2) Composants React-Leaflet + L pour corriger l'icône par défaut
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L                                   from "leaflet";

// 3) Tes services & ton style local
import GeolocalisationService from "../../services/GeolocalisationService";
import MissionService        from "../../services/MissionService";
import "../../styles/GeolocalisationForm.css";

// ─── Fix des icônes Leaflet pour Webpack / CRA ───────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:       require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:     require("leaflet/dist/images/marker-shadow.png"),
});

export default function CreateGeolocalisation() {
  const navigate = useNavigate();

  // État du formulaire
  const [form, setForm] = useState({
    gpsPrecision: 5,
    latitude:     48.8566, // Paris par défaut
    longitude:    2.3522,
    missionId:    "",      // optionnel
  });
  const [missions, setMissions] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);

  // 1) Chargement des missions pour le select
  useEffect(() => {
    MissionService.getAllMissions()
        .then(({ data }) => setMissions(data))
        .catch(() => setError("Impossible de charger la liste des missions."));
  }, []);

  // 2) Lorsque l’on choisit une mission, on géocode automatiquement son adresse de site
  useEffect(() => {
    if (!form.missionId) return;
    (async () => {
      try {
        setLoading(true);
        const { data: mission } = await MissionService.getMissionById(form.missionId);
        const address = mission.site?.adresse;
        if (!address) throw new Error();

        const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        const results = await resp.json();
        if (!results.length) throw new Error();

        setForm(f => ({
          ...f,
          latitude:  parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon),
        }));
      } catch {
        setError("Impossible de géocoder l’adresse du site.");
      } finally {
        setLoading(false);
      }
    })();
  }, [form.missionId]);

  // Handle input change
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f =>
        name === "missionId"
            ? { ...f, [name]: value }
            : { ...f, [name]: parseFloat(value) || value }
    );
  };

  // Submit création + association
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data: created } = await GeolocalisationService.createGeolocalisation({
        gpsPrecision: form.gpsPrecision,
        latitude:     form.latitude,
        longitude:    form.longitude,
      });
      if (form.missionId) {
        await GeolocalisationService.addMission(created.id, form.missionId);
      }
      navigate("/geolocalisations");
    } catch {
      setError("Échec de la création. Vérifiez les champs et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="form-container">
        <h2>➕ Créer une Géolocalisation</h2>
        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="geo-form">
          {/* Précision */}
          <div className="form-group">
            <label>📡 Précision GPS (mètres)</label>
            <input
                type="number"
                name="gpsPrecision"
                value={form.gpsPrecision}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
            />
          </div>

          {/* Sélection de la mission */}
          <div className="form-group">
            <label>🎯 Associer à une mission (facultatif)</label>
            <select name="missionId" value={form.missionId} onChange={handleChange}>
              <option value="">— Aucune —</option>
              {missions.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.titre} ({m.dateDebut} → {m.dateFin})
                  </option>
              ))}
            </select>
          </div>

          {/* Coordonnées */}
          <div className="form-group coords-group">
            <div>
              <label>📍 Latitude</label>
              <input
                  type="number"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  step="0.000001"
                  required
              />
            </div>
            <div>
              <label>📍 Longitude</label>
              <input
                  type="number"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  step="0.000001"
                  required
              />
            </div>
          </div>

          {/* Carte Leaflet */}
          <div className="map-preview-large">
            <MapContainer
                center={[form.latitude, form.longitude]}
                zoom={15}
                style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[form.latitude, form.longitude]} />
            </MapContainer>
          </div>

          {/* Boutons */}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "⏳ Patientez…" : "Créer et revenir à la liste"}
            </button>
            <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(-1)}
                disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
  );
}
