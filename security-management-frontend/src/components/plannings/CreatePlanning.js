import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PlanningService from "../../services/PlanningService";
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarPlus, faSave, faTimes, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import MissionService from "../../services/MissionService";
import { useEffect } from "react";

export default function CreatePlanning() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [missions, setMissions] = useState([]);
  const [selectedMissions, setSelectedMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  // Charger les missions disponibles
  useEffect(() => {
    setLoading(true);
    MissionService.getAllMissions()
      .then(res => {
        if (Array.isArray(res.data)) {
          setMissions(res.data);
        } else {
          console.error("Missions non reçues sous forme de tableau:", res.data);
        }
      })
      .catch(err => {
        console.error("Erreur lors du chargement des missions:", err);
        setErr("Impossible de charger les missions disponibles");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleMissionChange = (e) => {
    const missionId = e.target.value;
    if (e.target.checked) {
      setSelectedMissions([...selectedMissions, missionId]);
    } else {
      setSelectedMissions(selectedMissions.filter(id => id !== missionId));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    try {
      // Créer le planning
      const planningData = { 
        dateCreation: `${date}T00:00:00`,
        description: description
      };

      const response = await PlanningService.createPlanning(planningData);
      const newPlanningId = response.data.id;

      // Si des missions sont sélectionnées, les ajouter au planning
      if (selectedMissions.length > 0) {
        await Promise.all(
          selectedMissions.map(missionId => 
            PlanningService.addMissionToPlanning(newPlanningId, missionId)
          )
        );
      }

      setSuccess(true);
      
      // Rediriger après 1.5 secondes pour montrer le message de succès
      setTimeout(() => {
        nav("/plannings");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la création du planning:", error);
      setErr("La création du planning a échoué. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0 d-flex align-items-center">
            <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
            Créer un nouveau planning
          </h2>
        </Card.Header>
        
        <Card.Body>
          {success ? (
            <Alert variant="success">
              Planning créé avec succès ! Redirection en cours...
              <div className="mt-3 d-flex justify-content-center">
                <Spinner animation="border" variant="success" />
              </div>
            </Alert>
          ) : (
            <Form onSubmit={submit}>
              {err && (
                <Alert variant="danger" dismissible onClose={() => setErr("")}>
                  {err}
                </Alert>
              )}

              <Row className="mb-4">
                <Col md={6}>
                  <Card>
                    <Card.Header className="bg-light">Informations du planning</Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Date de création</Form.Label>
                        <Form.Control 
                          type="date" 
                          value={date} 
                          onChange={e => setDate(e.target.value)}
                          required 
                        />
                        <Form.Text className="text-muted">
                          Date à partir de laquelle le planning sera actif
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Description (optionnelle)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="Description du planning (objectifs, contexte, etc.)"
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">Missions associées (optionnel)</Card.Header>
                    <Card.Body className="overflow-auto" style={{maxHeight: "300px"}}>
                      {loading ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" variant="primary" size="sm" />
                          <p className="mt-2">Chargement des missions...</p>
                        </div>
                      ) : missions.length === 0 ? (
                        <Alert variant="info">
                          Aucune mission disponible. Vous pourrez en ajouter plus tard.
                        </Alert>
                      ) : (
                        <Form.Group>
                          <Form.Label>Sélectionnez les missions à inclure dans ce planning</Form.Label>
                          {missions.map(mission => (
                            <Form.Check
                              key={mission.id}
                              type="checkbox"
                              id={`mission-${mission.id}`}
                              label={`${mission.titre} ${mission.dateDebut ? `(${new Date(mission.dateDebut).toLocaleDateString()})` : ''}`}
                              value={mission.id}
                              onChange={handleMissionChange}
                              className="mb-2"
                            />
                          ))}
                        </Form.Group>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-between">
                <Link to="/plannings">
                  <Button variant="outline-secondary">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Annuler
                  </Button>
                </Link>
                
                <Button 
                  type="submit" 
                  variant="success" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      Créer le planning
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
}
