import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

export default function CreateMission() {
  const navigate = useNavigate();  // 1) On charge d'abord les listes de données pour les <select>
  const [tarifs, setTarifs] = useState([]);
  const [devisList, setDevisList] = useState([]);
  const [agents, setAgents] = useState([]);
  const [sites, setSites] = useState([]);
  const [geolocalisations, setGeolocalisations] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fonction pour récupérer les données avec gestion des erreurs
        const fetchSafely = async (url, setter) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              console.error(`Erreur lors de la récupération de ${url}: ${response.status} ${response.statusText}`);
              return [];
            }
            const data = await response.json();
            // Vérifier que les données sont un tableau
            if (Array.isArray(data)) {
              setter(data);
              return data;
            } else {
              console.error(`Les données reçues de ${url} ne sont pas un tableau:`, data);
              setter([]);
              return [];
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération de ${url}:`, error);
            setter([]);
            return [];
          }
        };

        // Récupérer toutes les données en parallèle avec gestion des erreurs
        await Promise.all([
          fetchSafely("http://localhost:8080/api/tarifs", setTarifs),
          fetchSafely("http://localhost:8080/api/devis", setDevisList),
          fetchSafely("http://localhost:8080/api/agents", setAgents),
          fetchSafely("http://localhost:8080/api/sites", setSites),
          fetchSafely("http://localhost:8080/api/geolocalisations", setGeolocalisations),
          fetchSafely("http://localhost:8080/api/plannings", setPlannings),
          fetchSafely("http://localhost:8080/api/contrats", setContrats)
        ]);
        
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
    montantHT: "",
    montantTVA: "",
    montantTTC: "",
    agentIds: [],
    planningId: "",
    siteId: "",
    geolocalisationGpsId: "",
    contratId: "",
    tarifMissionId: "",
    devisId: "",
    rapportIds: [],
    pointageIds: [],
    contratTravailIds: [],
    factureIds: []
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effet pour calculer automatiquement les montants lorsque le tarif ou la quantité changent
  useEffect(() => {
    if (mission.tarifMissionId && mission.quantite) {
      const calculerMontants = async () => {
        try {
          const calculation = await MissionService.simulateCalculation({
            tarifMissionId: mission.tarifMissionId,
            quantite: mission.quantite
          });
          
          if (calculation) {
            setMission(prev => ({
              ...prev,
              montantHT: calculation.montantHT,
              montantTVA: calculation.montantTVA,
              montantTTC: calculation.montantTTC
            }));
          }
        } catch (err) {
          console.warn("Impossible de calculer automatiquement les montants", err);
        }
      };
      
      calculerMontants();
    }
  }, [mission.tarifMissionId, mission.quantite]);
  // 3) Mise à jour des champs
  const handleChange = e => {
    const { name, value } = e.target;
    
    // Gestion des champs numériques
    if (name === 'montantHT' || name === 'montantTVA' || name === 'montantTTC') {
      setMission(m => ({ ...m, [name]: value === '' ? '' : parseFloat(value) }));
    }
    // Gestion de la sélection multiple pour les agents
    else if (name === 'agentIds') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setMission(m => ({ ...m, agentIds: selectedOptions }));
    }
    // Gestion des champs ID simples
    else if (['tarifMissionId', 'devisId', 'planningId', 'siteId', 'geolocalisationGpsId', 'contratId'].includes(name)) {
      setMission(m => ({ ...m, [name]: value === '' ? '' : parseInt(value) }));
    }
    // Gestion des autres champs
    else {
      setMission(m => ({ ...m, [name]: value }));
    }
  };
  // 4) Soumission
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Vérification des champs obligatoires
    if (
      !mission.titre ||
      !mission.description ||
      !mission.dateDebut ||
      !mission.dateFin ||
      !mission.tarifMissionId ||
      !mission.devisId
    ) {
      setError("Tous les champs marqués * sont obligatoires.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculer les montants si nécessaire
      if (!mission.montantHT || !mission.montantTVA || !mission.montantTTC) {
        try {
          const calculation = await MissionService.simulateCalculation({
            tarifMissionId: mission.tarifMissionId,
            quantite: mission.quantite
          });
          
          if (calculation) {
            mission.montantHT = calculation.montantHT;
            mission.montantTVA = calculation.montantTVA;
            mission.montantTTC = calculation.montantTTC;
          }
        } catch (err) {
          console.warn("Impossible de calculer automatiquement les montants", err);
        }
      }
      
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
            </Row>            <Row>
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
                    name="tarifMissionId" 
                    value={mission.tarifMissionId} 
                    onChange={handleChange} 
                    required
                  >                    <option value="">— Sélectionner un tarif —</option>
                    {Array.isArray(tarifs) ? tarifs.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.libelle} ({t.prixUnitaireHT} € HT)
                      </option>
                    )) : <option value="">Chargement des tarifs...</option>}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Montant HT</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.01" 
                    name="montantHT" 
                    value={mission.montantHT} 
                    onChange={handleChange} 
                    placeholder="Calculé automatiquement"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Montant TVA</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.01" 
                    name="montantTVA" 
                    value={mission.montantTVA} 
                    onChange={handleChange} 
                    placeholder="Calculé automatiquement"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Montant TTC</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.01" 
                    name="montantTTC" 
                    value={mission.montantTTC} 
                    onChange={handleChange} 
                    placeholder="Calculé automatiquement"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Devis <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="devisId" 
                    value={mission.devisId} 
                    onChange={handleChange} 
                    required
                  >                    <option value="">— Sélectionner un devis —</option>
                    {Array.isArray(devisList) ? devisList.map(d => (
                      <option key={d.id} value={d.id}>
                        #{d.id} – {d.reference}
                      </option>
                    )) : <option value="">Chargement des devis...</option>}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contrat (optionnel)</Form.Label>
                  <Form.Select 
                    name="contratId" 
                    value={mission.contratId} 
                    onChange={handleChange}
                  >                    <option value="">— Sélectionner un contrat —</option>
                    {Array.isArray(contrats) ? contrats.map(c => (
                      <option key={c.id} value={c.id}>
                        #{c.id} – {c.referenceContrat}
                      </option>
                    )) : <option value="">Chargement des contrats...</option>}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Site (optionnel)</Form.Label>
                  <Form.Select 
                    name="siteId" 
                    value={mission.siteId} 
                    onChange={handleChange}
                  >                    <option value="">— Sélectionner un site —</option>
                    {Array.isArray(sites) ? sites.map(site => (
                      <option key={site.id} value={site.id}>
                        {site.nom} ({site.adresse})
                      </option>
                    )) : <option value="">Chargement des sites...</option>}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Géolocalisation (optionnel)</Form.Label>                  <Form.Select 
                    name="geolocalisationGpsId" 
                    value={mission.geolocalisationGpsId} 
                    onChange={handleChange}
                  >
                    <option value="">— Sélectionner une géolocalisation —</option>
                    {Array.isArray(geolocalisations) ? geolocalisations.map(geo => (
                      <option key={geo.id} value={geo.id}>
                        {geo.latitude}, {geo.longitude} - {geo.description || 'Sans description'}
                      </option>
                    )) : <option value="">Chargement des géolocalisations...</option>}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Planning (optionnel)</Form.Label>
                  <Form.Select 
                    name="planningId" 
                    value={mission.planningId} 
                    onChange={handleChange}
                  >                    <option value="">— Sélectionner un planning —</option>
                    {Array.isArray(plannings) ? plannings.map(planning => (
                      <option key={planning.id} value={planning.id}>
                        Planning #{planning.id} - {planning.titre || 'Sans titre'}
                      </option>
                    )) : <option value="">Chargement des plannings...</option>}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Agents (optionnel)</Form.Label>
                  <Form.Select 
                    name="agentIds" 
                    value={mission.agentIds} 
                    onChange={handleChange}
                    multiple
                    style={{ height: '120px' }}
                  >                    {Array.isArray(agents) ? agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.nom} {agent.prenom} - {agent.numCarteProf || 'Sans carte'}
                      </option>
                    )) : <option value="">Chargement des agents...</option>}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Utilisez Ctrl+clic pour sélectionner plusieurs agents
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

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
