import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import TarifMissionService from "../../services/TarifMissionService";
import DevisService from "../../services/DevisService";
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import TarifMissionService from "../../services/TarifMissionService";
import DevisService from "../../services/DevisService";

export default function CreateMission() {
  const navigate = useNavigate();

  // 1) On charge d'abord les listes TarifMission et Devis pour les <select>
  const [tarifs, setTarifs] = useState([]);
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(""); // Réinitialiser l'erreur
        
        const [tarifsResponse, devisResponse] = await Promise.all([
          TarifMissionService.getAll(),
<<<<<<< Updated upstream
          DevisService && DevisService.getDisponibles ? DevisService.getDisponibles() : Promise.resolve({ data: [] })
        ]);
        setTarifs(tarifsResponse.data);
        setDevisList(devisResponse.data);
=======
          DevisService.getDisponibles()  // Utiliser les devis disponibles uniquement
        ]);
        
        // Vérifier que les réponses sont des tableaux
        const tarifsData = Array.isArray(tarifsResponse.data) ? tarifsResponse.data : [];
        const devisData = Array.isArray(devisResponse.data) ? devisResponse.data : [];
        
        console.log("Tarifs chargés:", tarifsData);
        console.log("Devis chargés:", devisData);
        console.log("Nombre de devis disponibles:", devisData.length);
        
        setTarifs(tarifsData);
        setDevisList(devisData);
>>>>>>> Stashed changes
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Impossible de charger les données nécessaires. Vérifiez votre connexion.");
        // Initialiser avec des tableaux vides en cas d'erreur
        setTarifs([]);
        setDevisList([]);
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

<<<<<<< Updated upstream
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3) Mise à jour des champs (gère aussi tarifMissionId et devisId)
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "tarif") {
      // On ne stocke que l'id du tarif sélectionné (string ou number)
      setMission(m => ({ ...m, tarifMissionId: value }));
    } else if (name === "devis") {
      setMission(m => ({ ...m, devisId: value }));
=======
  // 3) Mise à jour des champs (gère aussi tarif.id et devis.id)
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "tarif") {
      console.log("Tarif sélectionné:", value);
      setMission(m => ({ ...m, tarif: { id: value } }));
    } else if (name === "devis") {
      console.log("Devis sélectionné:", value);
      console.log("Type de la valeur:", typeof value);
      setMission(m => ({ ...m, devis: { id: value } }));
>>>>>>> Stashed changes
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
      // Messages d'erreur plus spécifiques
      if (!mission.titre) {
        setError("Le titre est obligatoire.");
      } else if (!mission.description) {
        setError("La description est obligatoire.");
      } else if (!mission.dateDebut) {
        setError("La date de début est obligatoire.");
      } else if (!mission.dateFin) {
        setError("La date de fin est obligatoire.");
      } else if (!mission.tarif.id) {
        setError("Veuillez sélectionner un tarif.");
      } else if (!mission.devis.id) {
        setError("Veuillez sélectionner un devis dans la liste déroulante.");
      }
      setIsSubmitting(false);
      return;
    }

    try {
      // Préparer les données pour l'envoi
      const missionData = {
        ...mission,
        // Convertir les nombres en entiers
        nombreAgents: parseInt(mission.nombreAgents),
        quantite: parseInt(mission.quantite),
        // S'assurer que les IDs sont des nombres si nécessaire
        tarif: { id: parseInt(mission.tarif.id) },
        devis: { id: parseInt(mission.devis.id) }
      };

      console.log("Données de mission à envoyer:", missionData);
      console.log("Devis ID sélectionné:", mission.devis.id);
      console.log("Type de devis ID:", typeof mission.devis.id);
      
      // Vérification supplémentaire avant envoi
      if (!mission.devis.id || mission.devis.id === "") {
        setError("Erreur: Aucun devis sélectionné. Veuillez sélectionner un devis.");
        setIsSubmitting(false);
        return;
      }
      
      await MissionService.createMission(missionData);
      navigate("/missions");
    } catch (err) {
      console.error("Erreur complète:", err);
      console.error("Réponse du serveur:", err.response?.data);
      
      // Afficher une erreur plus détaillée
      if (err.response?.data?.message) {
        setError(`Erreur: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setError(`Erreur: ${err.response.data.error}`);
      } else if (err.response?.status) {
        setError(`Erreur ${err.response.status}: ${err.response.statusText}`);
      } else {
        setError("Erreur côté serveur, impossible de créer la mission.");
      }
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
                    <option value="SSIAP_1">SSIAP 1</option>
                    <option value="SSIAP_2">SSIAP 2</option>
                    <option value="SSIAP_3">SSIAP 3</option>
                    <option value="TELESURVEILLANCE">Télésurveillance</option>
                    <option value="SECURITE_EVENEMENTIELLE">Sécurité événementielle</option>
                    <option value="RONDIER">Rondier</option>
                    <option value="CQP_APS">CQP APS</option>
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
                    <option value="EN_ATTENTE_DE_VALIDATION_DEVIS">En attente de validation devis</option>
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
                    {Array.isArray(tarifs) && tarifs.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.typeMission ? t.typeMission + ' - ' : ''}{t.libelle} ({t.prixUnitaireHT} € HT)
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
<<<<<<< Updated upstream
                <option value="">— Aucun devis associé —</option>
                {devisList.map(d => (
                  <option key={d.id} value={d.id}>
                    #{d.id} – {d.referenceDevis || 'Pas de référence'} - {d.description || 'Sans description'}
=======
                <option value="">— Sélectionner un devis disponible —</option>
                {Array.isArray(devisList) && devisList.map(d => (
                  <option key={d.id} value={d.id}>
                    #{d.id} – {d.referenceDevis} - {d.description || 'Sans description'}
>>>>>>> Stashed changes
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Seuls les devis non rattachés à d'autres missions sont affichés.
                {devisList.length === 0 && " Aucun devis disponible - créez d'abord un devis."}
              </Form.Text>
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
