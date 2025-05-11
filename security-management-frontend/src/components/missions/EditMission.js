import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import EntrepriseService from "../../services/EntrepriseService";
import SiteService from "../../services/SiteService";
import PlanningService from "../../services/PlanningService";
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

const EditMission = () => {
  const { id } = useParams();
  const [mission, setMission] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    heureDebut: "",
    heureFin: "",
    statutMission: "PLANIFIEE",
    typeMission: "SURVEILLANCE",
    nombreAgents: 1,
    quantite: 1,
    siteId: "",
    planningId: "",
    entrepriseId: "",
  });

  const [entreprises, setEntreprises] = useState([]);
  const [sites, setSites] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Charger les données existantes de la mission
        const missionResponse = await MissionService.getMissionById(id);
        const missionData = missionResponse.data;

        // Charger les entreprises, sites et plannings
        const [entreprisesData, sitesData, planningsData] = await Promise.all([
          EntrepriseService.getAllEntreprises(),
          SiteService.getAllSites(),
          PlanningService.getAllPlannings()
        ]);

        setEntreprises(entreprisesData.data);
        setSites(sitesData.data);
        setPlannings(planningsData.data);

        setMission({
          ...missionData,
          dateDebut: missionData.dateDebut ? missionData.dateDebut.split("T")[0] : "",
          dateFin: missionData.dateFin ? missionData.dateFin.split("T")[0] : "",
          heureDebut: missionData.heureDebut || "",
          heureFin: missionData.heureFin || "",
          entrepriseId: missionData.entreprise ? missionData.entreprise.id : "",
          siteId: missionData.site ? missionData.site.id : "",
          planningId: missionData.planning ? missionData.planning.id : "",
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
        setErrorMessage("Impossible de charger les données. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMission({ ...mission, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!mission.titre || !mission.description || !mission.dateDebut || !mission.dateFin) {
      setErrorMessage("Tous les champs obligatoires doivent être remplis !");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      titre: mission.titre,
      description: mission.description,
      dateDebut: mission.dateDebut,
      dateFin: mission.dateFin,
      heureDebut: mission.heureDebut,
      heureFin: mission.heureFin,
      statutMission: mission.statutMission,
      typeMission: mission.typeMission,
      nombreAgents: mission.nombreAgents,
      quantite: mission.quantite,
      entreprise: mission.entrepriseId ? { id: Number(mission.entrepriseId) } : null,
      site: mission.siteId ? { id: Number(mission.siteId) } : null,
      planning: mission.planningId ? { id: Number(mission.planningId) } : null,
    };

    try {
      await MissionService.updateMission(id, payload);
      navigate("/missions");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la mission :", error.response?.data || error.message);
      setErrorMessage("Erreur : " + (error.response?.data?.message || "Erreur inconnue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">
            <i className="bi bi-pencil"></i> Modifier la Mission #{id}
          </h2>
        </Card.Header>
        <Card.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Titre <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="titre" 
                    value={mission.titre} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de mission</Form.Label>
                  <Form.Select 
                    name="typeMission" 
                    value={mission.typeMission} 
                    onChange={handleChange}
                  >
                    <option value="SURVEILLANCE">Surveillance</option>
                    <option value="GARDE_DU_CORPS">Garde du corps</option>
                    <option value="SECURITE_INCENDIE">Sécurité incendie</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={mission.description} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de début <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="date" 
                    name="dateDebut" 
                    value={mission.dateDebut} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure de début</Form.Label>
                  <Form.Control 
                    type="time" 
                    name="heureDebut" 
                    value={mission.heureDebut} 
                    onChange={handleChange} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de fin <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="date" 
                    name="dateFin" 
                    value={mission.dateFin} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure de fin</Form.Label>
                  <Form.Control 
                    type="time" 
                    name="heureFin" 
                    value={mission.heureFin} 
                    onChange={handleChange} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select 
                    name="statutMission" 
                    value={mission.statutMission} 
                    onChange={handleChange}
                  >
                    <option value="PLANIFIEE">Planifiée</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINEE">Terminée</option>
                    <option value="ANNULEE">Annulée</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre d'agents prévu</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1" 
                    name="nombreAgents" 
                    value={mission.nombreAgents} 
                    onChange={handleChange} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantité</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1" 
                    name="quantite" 
                    value={mission.quantite} 
                    onChange={handleChange} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Entreprise</Form.Label>
                  <Form.Select 
                    name="entrepriseId" 
                    value={mission.entrepriseId} 
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {entreprises.map((entreprise) => (
                      <option key={entreprise.id} value={entreprise.id}>
                        {entreprise.nom}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Site</Form.Label>
                  <Form.Select 
                    name="siteId" 
                    value={mission.siteId} 
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un site</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.nom}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Planning</Form.Label>
                  <Form.Select 
                    name="planningId" 
                    value={mission.planningId} 
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un planning</option>
                    {plannings.map((planning) => (
                      <option key={planning.id} value={planning.id}>
                        {planning.dateDebut ? new Date(planning.dateDebut).toLocaleDateString() : "Planning " + planning.id}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-3">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i> 
                    Mettre à jour la mission
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={() => navigate("/missions")}>
                <i className="bi bi-x-circle me-1"></i> 
                Annuler
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditMission;
