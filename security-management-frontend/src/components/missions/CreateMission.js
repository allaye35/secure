import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

export default function CreateMission() {
  const navigate = useNavigate();

  // 1) On charge d'abord les listes TarifMission et Devis pour les <select>
  const [tarifs, setTarifs] = useState([]);
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tarifsResponse, devisResponse] = await Promise.all([
          fetch("http://localhost:8080/api/tarifs"),
          fetch("http://localhost:8080/api/devis/disponibles")
        ]);
        
        const tarifsData = await tarifsResponse.json();
        const devisData = await devisResponse.json();
        
        setTarifs(tarifsData);
        setDevisList(devisData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Impossible de charger les données nécessaires.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2) État local de la nouvelle mission (tous les champs obligatoires + optionnels)
  const [mission, setMission] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    heureDebut: "",
    dateFin: "",
    heureFin: "",
    statutMission: "PLANIFIEE",
    typeMission: "SURVEILLANCE",
    nombreAgents: 1,
    quantite: 1,
    tarifMissionId: "",
    devisId: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3) Mise à jour des champs (gère aussi tarifMissionId et devisId)
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "tarif") {
      setMission(m => ({ ...m, tarifMissionId: value }));
    } else if (name === "devis") {
      setMission(m => ({ ...m, devisId: value }));
    } else {
      setMission(m => ({ ...m, [name]: value }));
    }
  };

  // 4) Soumission
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Vérif rapide
    if (
      !mission.titre ||
      !mission.description ||
      !mission.dateDebut ||
      !mission.dateFin ||
      !mission.tarifMissionId
    ) {
      setError("Tous les champs marqués * sont obligatoires.");
      setIsSubmitting(false);
      return;
    }

    try {
      await MissionService.createMission(mission);
      navigate("/missions");
    } catch (err) {
      console.error(err);
      setError("Erreur côté serveur, impossible de créer la mission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
            <i className="bi bi-plus-circle"></i> Créer une Mission
          </h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Titre <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
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
                  <Form.Label>Tarif <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="tarif" 
                    value={mission.tarifMissionId} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">— Sélectionner un tarif —</option>
                    {tarifs.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.libelle} ({t.prixUnitaireHT} € HT)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Devis <span className="text-muted">(optionnel)</span></Form.Label>
              <Form.Select 
                name="devis" 
                value={mission.devisId} 
                onChange={handleChange}
              >
                <option value="">— Aucun devis associé —</option>
                {devisList.map(d => (
                  <option key={d.id} value={d.id}>
                    #{d.id} – {d.referenceDevis || 'Pas de référence'} - {d.description || 'Sans description'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i> 
                    Créer la mission
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
}
