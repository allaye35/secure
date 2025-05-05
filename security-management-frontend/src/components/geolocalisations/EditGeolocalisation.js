import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GeolocalisationService from "../../services/GeolocalisationService";

const EditGeolocalisation = () => {
  const { id } = useParams();
  const [geolocalisation, setGeolocalisation] = useState({
    gps_precision: "",
    position: { latitude: "", longitude: "" },
  });
  const navigate = useNavigate();

  useEffect(() => {
    GeolocalisationService.getGeolocalisationById(id)
      .then((response) => setGeolocalisation(response.data))
      .catch((error) => console.error("Erreur de chargement", error));
  }, [id]);

  const handleChange = (e) => {
    if (e.target.name === "latitude" || e.target.name === "longitude") {
      setGeolocalisation({
        ...geolocalisation,
        position: {
          ...geolocalisation.position,
          [e.target.name]: e.target.value,
        },
      });
    } else {
      setGeolocalisation({ ...geolocalisation, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    GeolocalisationService.updateGeolocalisation(id, geolocalisation)
      .then(() => navigate("/geolocalisations"))
      .catch((error) => console.error("Erreur de modification", error));
  };

  return (
    <div>
      <h2>Modifier une Géolocalisation</h2>
      <form onSubmit={handleSubmit}>
        <label>Précision GPS:</label>
        <input
          type="number"
          name="gps_precision"
          value={geolocalisation.gps_precision || ""}
          onChange={handleChange}
          required
        />

        <label>Latitude:</label>
        <input
          type="number"
          name="latitude"
          value={geolocalisation.position.latitude || ""}
          onChange={handleChange}
          required
        />

        <label>Longitude:</label>
        <input
          type="number"
          name="longitude"
          value={geolocalisation.position.longitude || ""}
          onChange={handleChange}
          required
        />

        <button type="submit">Modifier</button>
      </form>
    </div>
  );
};

export default EditGeolocalisation;
