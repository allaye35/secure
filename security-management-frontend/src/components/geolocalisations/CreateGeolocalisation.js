// src/components/geolocalisations/CreateGeolocalisation.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Container, Row, Col, Card, Form, Button, Spinner, 
  Alert, InputGroup, Badge
} from "react-bootstrap";
import { 
  FaMapMarkedAlt, FaPlus, FaSatelliteDish, FaCrosshairs,
  FaBuilding, FaArrowLeft, FaTimes, FaCheck 
} from "react-icons/fa";

// Composants React-Leaflet + L pour corriger l'icône par défaut
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Services & styles
import GeolocalisationService from "../../services/GeolocalisationService";
import MissionService from "../../services/MissionService";
import "../../styles/GeolocalisationForm.css";
import "leaflet/dist/leaflet.css";

// ─── Fix des icônes Leaflet pour Webpack / CRA ───────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function CreateGeolocalisation() {
  const navigate = useNavigate();

  // État du formulaire
  const [form, setForm] = useState({
    gpsPrecision: 5,
    latitude: 48.8566, // Paris par défaut
    longitude: 2.3522,
    missionId: "", // optionnel
  });
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1) Chargement des missions pour le select
  useEffect(() => {
    MissionService.getAllMissions()
      .then(({ data }) => setMissions(data))
      .catch(() => setError("Impossible de charger la liste des missions."));
  }, []);

  // 2) Lorsque l'on choisit une mission, on géocode automatiquement son adresse de site
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
          latitude: parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon),
        }));
      } catch {
        setError("Impossible de géocoder l'adresse du site.");
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
        latitude: form.latitude,
        longitude: form.longitude,
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
    <Container fluid className="py-4">
      <Card className="shadow-sm border-0 rounded-lg">
        <Card.Header className="bg-gradient bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaMapMarkedAlt className="me-2" /> Création d'une nouvelle géolocalisation
              </h5>
            </Col>
            <Col xs="auto">
              <Link 
                to="/geolocalisations" 
                className="btn btn-light btn-sm d-flex align-items-center shadow-sm"
              >
                <FaArrowLeft className="me-1" /> Retour
              </Link>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" className="d-flex align-items-center mb-4">
              <FaTimes className="me-2" />
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="d-flex align-items-center fw-bold">
                    <FaSatelliteDish className="me-2 text-primary" /> Précision GPS (mètres)
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="gpsPrecision"
                      value={form.gpsPrecision}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      required
                      className="shadow-sm"
                    />
                    <InputGroup.Text>mètres</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label className="d-flex align-items-center fw-bold">
                    <FaBuilding className="me-2 text-primary" /> Associer à une mission (facultatif)
                  </Form.Label>
                  <Form.Select 
                    name="missionId" 
                    value={form.missionId} 
                    onChange={handleChange}
                    className="shadow-sm"
                  >
                    <option value="">— Aucune —</option>
                    {missions.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.titre} ({m.dateDebut} → {m.dateFin})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    La sélection d'une mission géocodera automatiquement son site.
                  </Form.Text>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center fw-bold">
                        <FaCrosshairs className="me-2 text-danger" /> Latitude
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        step="0.000001"
                        required
                        className="shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center fw-bold">
                        <FaCrosshairs className="me-2 text-danger" /> Longitude
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        step="0.000001"
                        required
                        className="shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="mt-4 mb-3 d-flex justify-content-between align-items-center">
                  <Badge bg="info" className="py-2 px-3 d-flex align-items-center">
                    <FaMapMarkedAlt className="me-1" /> Coordonnées actuelles
                  </Badge>
                  <div className="text-muted small">
                    <strong>Lat:</strong> {form.latitude.toFixed(6)} | <strong>Long:</strong> {form.longitude.toFixed(6)}
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="shadow-sm rounded overflow-hidden border mb-3" style={{ height: "350px" }}>
                  <MapContainer
                    center={[form.latitude, form.longitude]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[form.latitude, form.longitude]} />
                  </MapContainer>
                </div>
                <div className="bg-light p-3 rounded">
                  <p className="mb-0 small text-muted">
                    <strong>Note :</strong> La position sur la carte est mise à jour selon les coordonnées saisies.
                  </p>
                </div>
              </Col>
            </Row>

            <hr className="my-4" />

            <div className="d-flex justify-content-between gap-3">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(-1)}
                disabled={loading}
                className="d-flex align-items-center"
              >
                <FaArrowLeft className="me-1" /> Annuler
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="d-flex align-items-center"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" /> Création en cours...
                  </>
                ) : (
                  <>
                    <FaCheck className="me-1" /> Créer la géolocalisation
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
