import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  Container, Row, Col, Card, Form, Button, Spinner, 
  Alert, InputGroup, Badge 
} from "react-bootstrap";
import { 
  FaMapMarkedAlt, FaSatelliteDish, FaCrosshairs,
  FaArrowLeft, FaTimes, FaSave, FaExclamationTriangle
} from "react-icons/fa";

// Composants React-Leaflet + L pour corriger l'icône par défaut
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Services & styles
import GeolocalisationService from "../../services/GeolocalisationService";
import "../../styles/GeolocalisationForm.css";
import "leaflet/dist/leaflet.css";

// ─── Fix des icônes Leaflet pour Webpack / CRA ───────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const EditGeolocalisation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [geolocalisation, setGeolocalisation] = useState({
    gpsPrecision: "",
    position: { latitude: 48.8566, longitude: 2.3522 },
    missions: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Chargement de la géolocalisation à partir de l'API
  useEffect(() => {
    setLoading(true);
    GeolocalisationService.getGeolocalisationById(id)
      .then((response) => {
        setGeolocalisation(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur de chargement", error);
        setError("Impossible de charger les données de cette géolocalisation.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "latitude" || name === "longitude") {
      setGeolocalisation({
        ...geolocalisation,
        position: {
          ...geolocalisation.position,
          [name]: parseFloat(value) || value,
        },
      });
    } else {
      setGeolocalisation({ 
        ...geolocalisation, 
        [name]: name === "gpsPrecision" ? parseFloat(value) || value : value 
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    GeolocalisationService.updateGeolocalisation(id, geolocalisation)
      .then(() => {
        navigate("/geolocalisations");
      })
      .catch((error) => {
        console.error("Erreur de modification", error);
        setError("Échec de la mise à jour. Vérifiez les champs et réessayez.");
        setSaving(false);
      });
  };

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm border-0 rounded-lg">
        <Card.Header className="bg-gradient bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaMapMarkedAlt className="me-2" /> Modification de la géolocalisation #{id}
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
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Chargement des données...</p>
            </div>
          ) : (
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
                        value={geolocalisation.gpsPrecision || ""}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        required
                        className="shadow-sm"
                      />
                      <InputGroup.Text>mètres</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  {geolocalisation.missions && geolocalisation.missions.length > 0 && (
                    <div className="mb-4 p-3 bg-light rounded">
                      <h6 className="mb-2">Missions associées</h6>
                      {geolocalisation.missions.map(mission => (
                        <Badge key={mission.id} bg="info" className="me-2 mb-2 p-2">
                          Mission #{mission.id}: {mission.titre}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="d-flex align-items-center fw-bold">
                          <FaCrosshairs className="me-2 text-danger" /> Latitude
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="latitude"
                          value={geolocalisation.position?.latitude || ""}
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
                          value={geolocalisation.position?.longitude || ""}
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
                    {geolocalisation.position && (
                      <div className="text-muted small">
                        <strong>Lat:</strong> {geolocalisation.position.latitude?.toFixed(6) || "-"} | <strong>Long:</strong> {geolocalisation.position.longitude?.toFixed(6) || "-"}
                      </div>
                    )}
                  </div>
                </Col>

                <Col md={6}>
                  {geolocalisation.position && (
                    <div className="shadow-sm rounded overflow-hidden border mb-3" style={{ height: "350px" }}>
                      <MapContainer
                        center={[geolocalisation.position.latitude || 48.8566, geolocalisation.position.longitude || 2.3522]}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[geolocalisation.position.latitude || 48.8566, geolocalisation.position.longitude || 2.3522]} />
                      </MapContainer>
                    </div>
                  )}
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0 small text-muted">
                      <strong>Note :</strong> La carte affiche la position actuellement enregistrée.
                    </p>
                  </div>
                </Col>
              </Row>

              <hr className="my-4" />

              <div className="d-flex justify-content-between gap-3">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate("/geolocalisations")}
                  disabled={saving}
                  className="d-flex align-items-center"
                >
                  <FaArrowLeft className="me-1" /> Annuler
                </Button>
                <Button 
                  variant="success" 
                  type="submit" 
                  disabled={saving}
                  className="d-flex align-items-center"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-1" /> Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditGeolocalisation;
