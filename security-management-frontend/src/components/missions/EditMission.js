import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import TarifMissionService from "../../services/TarifMissionService";
import DevisService from "../../services/DevisService";
import GeolocalisationService from "../../services/GeolocalisationService";
import AgentService from "../../services/AgentService";
import SiteService from "../../services/SiteService";
import PlanningService from "../../services/PlanningService";
import ContratService from "../../services/ContratService";
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
    montantHT: "",
    montantTVA: "",
    montantTTC: "",
    agentIds: [],
    siteId: "",
    planningId: "",
    geolocalisationGpsId: "",
    contratId: "",
    tarifMissionId: "",
    devisId: "",
    rapportIds: [],
    pointageIds: [],
    contratTravailIds: [],
    factureIds: []
  });

  const [sites, setSites] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [tarifs, setTarifs] = useState([]);
  const [devis, setDevis] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [geolocalisations, setGeolocalisations] = useState([]);  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        
        // Charger les données existantes de la mission
        console.log(`Chargement de la mission avec l'ID: ${id}`);
        const missionData = await MissionService.getMissionById(id);
        console.log("Mission data loaded:", missionData);
        
        if (!missionData) {
          throw new Error(`Mission avec ID ${id} non trouvée`);
        }

        // Charger toutes les données nécessaires pour les relations - une par une pour mieux détecter les erreurs
        console.log("Chargement des données de relation...");
        
        // Sites
        const sitesData = await SiteService.getAllSites();
        console.log("Sites chargés:", sitesData);
        setSites(Array.isArray(sitesData) ? sitesData : []);
        
        // Plannings
        const planningsData = await PlanningService.getAllPlannings();
        console.log("Plannings chargés:", planningsData);
        setPlannings(Array.isArray(planningsData) ? planningsData : []);
        
        // Agents
        const agentsData = await AgentService.getAllAgents();
        console.log("Agents chargés:", agentsData);
        setAgents(Array.isArray(agentsData) ? agentsData : []);
        
        // Tarifs
        const tarifsData = await TarifMissionService.getAll();
        console.log("Tarifs chargés:", tarifsData);
        setTarifs(Array.isArray(tarifsData) ? tarifsData : []);
        
        // Devis
        const devisData = await DevisService.getAll();
        console.log("Devis chargés:", devisData);
        setDevis(Array.isArray(devisData) ? devisData : []);
        
        // Contrats
        const contratsData = await ContratService.getAll();
        console.log("Contrats chargés:", contratsData);
        setContrats(Array.isArray(contratsData) ? contratsData : []);
          // Geolocalisations
        try {
          console.log("Tentative de récupération des géolocalisations...");
          // Utiliser getAllGeolocalisations qui est disponible
          const response = await GeolocalisationService.getAllGeolocalisations();
          const geolocalisationsData = response.data;
          console.log("Géolocalisations chargées:", geolocalisationsData);
          setGeolocalisations(Array.isArray(geolocalisationsData) ? geolocalisationsData : []);
        } catch (geoError) {
          console.error("Erreur lors du chargement des géolocalisations:", geoError);
          // Continuer même en cas d'échec des géolocalisations
          setGeolocalisations([]);
        }

        // Pas besoin de réassigner les états car ils ont déjà été définis ci-dessus// Traitement des données de la mission
        console.log("Traitement des données de la mission...");
        
        try {
          // Extraire les listes d'IDs pour les relations many-to-many avec vérifications de sécurité
          const agentIds = Array.isArray(missionData.agents) 
            ? missionData.agents.map(agent => agent?.id).filter(id => id) 
            : [];
            
          const rapportIds = Array.isArray(missionData.rapports) 
            ? missionData.rapports.map(rapport => rapport?.id).filter(id => id) 
            : [];
            
          const pointageIds = Array.isArray(missionData.pointages) 
            ? missionData.pointages.map(pointage => pointage?.id).filter(id => id) 
            : [];
            
          const contratTravailIds = Array.isArray(missionData.contratsDeTravail) 
            ? missionData.contratsDeTravail.map(contrat => contrat?.id).filter(id => id) 
            : [];
            
          const factureIds = Array.isArray(missionData.factures) 
            ? missionData.factures.map(facture => facture?.id).filter(id => id) 
            : [];

          console.log("Identifiants extraits:", {
            agentIds,
            rapportIds,
            pointageIds,
            contratTravailIds,
            factureIds
          });

          // Formater les données pour le formulaire
          const formattedMission = {
            // ID de la mission
            id: missionData.id || "",
            
            // Informations de base
            titre: missionData.titre || "",
            description: missionData.description || "",
            
            // Dates et heures (formatage pour input type="date" et type="time")
            dateDebut: missionData.dateDebut ? missionData.dateDebut.split("T")[0] : "",
            dateFin: missionData.dateFin ? missionData.dateFin.split("T")[0] : "",
            heureDebut: missionData.heureDebut || "",
            heureFin: missionData.heureFin || "",
            
            // Statut et type
            statutMission: missionData.statutMission || "PLANIFIEE",
            typeMission: missionData.typeMission || "SURVEILLANCE",
            
            // Nombre d'agents et quantité
            nombreAgents: missionData.nombreAgents || 1,
            quantite: missionData.quantite || 1,
            
            // Relations many-to-one (avec des vérifications de sécurité)
            siteId: missionData.site?.id || "",
            planningId: missionData.planning?.id || "",
            geolocalisationGpsId: missionData.geolocalisationGPS?.id || "",
            contratId: missionData.contrat?.id || "",
            tarifMissionId: missionData.tarif?.id || "",
            devisId: missionData.devis?.id || "",
            
            // Relations many-to-many
            agentIds,
            rapportIds,
            pointageIds,
            contratTravailIds,
            factureIds,
            
            // Valeurs monétaires (avec conversion en chaîne vide si null/undefined)
            montantHT: missionData.montantHT !== null && missionData.montantHT !== undefined ? missionData.montantHT : "",
            montantTVA: missionData.montantTVA !== null && missionData.montantTVA !== undefined ? missionData.montantTVA : "",
            montantTTC: missionData.montantTTC !== null && missionData.montantTTC !== undefined ? missionData.montantTTC : ""
          };
          
          console.log("Données formatées pour le formulaire:", formattedMission);
          setMission(formattedMission);
          setIsDataLoaded(true);
          setSuccessMessage("Données de la mission chargées avec succès");
          setTimeout(() => setSuccessMessage(""), 3000); // Masquer après 3 secondes
        } catch (formattingError) {
          console.error("Erreur lors du formatage des données de la mission", formattingError);
          throw new Error("Erreur lors du traitement des données de la mission");
        }
      } catch (error) {
        console.error("Erreur détaillée lors du chargement des données:", error);
        setErrorMessage("Impossible de charger les données de la mission. Erreur: " + (error.message || "Erreur inconnue"));
        setIsDataLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Effet pour calculer automatiquement les montants lorsque le tarif ou la quantité changent
  useEffect(() => {
    if (mission.tarifMissionId && mission.quantite) {
      const calculerMontants = async () => {        try {
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
            console.log("Calcul automatique des montants effectué avec succès");
          }
        } catch (err) {
          console.warn("Impossible de calculer automatiquement les montants", err);
          // On continue sans l'affichage des montants calculés automatiquement
        }
      };
      
      calculerMontants();
    }
  }, [mission.tarifMissionId, mission.quantite]);  const handleChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Champ modifié: ${name}, Valeur: ${value}`);
    
    try {
      // Traitement spécifique pour certains types de champs
      if (name === 'agentIds') {
        // Gestion des sélections multiples (pour les agents)
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10))
          .filter(id => !isNaN(id)); // Filtrer les valeurs non numériques
        console.log(`Agents sélectionnés: ${selectedOptions.join(', ')}`);
        setMission(prev => ({ ...prev, [name]: selectedOptions }));
      }
      else if (['montantHT', 'montantTVA', 'montantTTC'].includes(name)) {
        // Gestion des montants (accepte les valeurs vides)
        const parsedValue = value === '' ? '' : parseFloat(value);
        console.log(`Montant ${name} modifié: ${parsedValue}`);
        setMission(prev => ({ ...prev, [name]: parsedValue }));
      }
      else if (['nombreAgents', 'quantite'].includes(name)) {
        // Gestion des nombres entiers
        const parsedValue = value === '' ? '' : parseInt(value, 10);
        console.log(`Nombre ${name} modifié: ${parsedValue}`);
        setMission(prev => ({ ...prev, [name]: parsedValue }));
      }
      else if (['siteId', 'planningId', 'geolocalisationGpsId', 'contratId', 'tarifMissionId', 'devisId'].includes(name)) {
        // Gestion des IDs de référence
        const parsedValue = value === '' ? '' : parseInt(value, 10);
        console.log(`Référence ${name} modifiée: ${parsedValue}`);
        setMission(prev => ({ ...prev, [name]: parsedValue }));
      }
      // Gestion standard pour les autres champs
      else {
        console.log(`Champ standard ${name} modifié: ${value}`);
        setMission(prev => ({ ...prev, [name]: value }));
      }
    } catch (err) {
      console.error(`Erreur lors du traitement du champ ${name}:`, err);
      // Continuer sans planter en cas d'erreur de traitement
      setMission(prev => ({ ...prev, [name]: value }));
    }
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

    try {
      // Construire le payload avec des vérifications de sécurité
      const payload = {
        id: parseInt(id), // Important pour la mise à jour
        titre: mission.titre || "",
        description: mission.description || "",
        dateDebut: mission.dateDebut || "",
        dateFin: mission.dateFin || "",
        heureDebut: mission.heureDebut || "",
        heureFin: mission.heureFin || "",
        statutMission: mission.statutMission || "PLANIFIEE",
        typeMission: mission.typeMission || "SURVEILLANCE",
        nombreAgents: mission.nombreAgents || 1,
        quantite: mission.quantite || 1,
        montantHT: mission.montantHT === "" ? null : mission.montantHT,
        montantTVA: mission.montantTVA === "" ? null : mission.montantTVA,
        montantTTC: mission.montantTTC === "" ? null : mission.montantTTC,
        agentIds: Array.isArray(mission.agentIds) ? mission.agentIds : [],
        tarifMissionId: mission.tarifMissionId || null,
        devisId: mission.devisId || null,
        siteId: mission.siteId || null,
        planningId: mission.planningId || null,
        geolocalisationGpsId: mission.geolocalisationGpsId || null,
        contratId: mission.contratId || null
      };      console.log("Payload d'envoi:", payload);
      const response = await MissionService.updateMission(id, payload);
      setSuccessMessage("Mission mise à jour avec succès");
      setTimeout(() => {
        navigate("/missions");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la mission :", error);
      let errorMsg = "Erreur lors de la mise à jour de la mission.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage("Erreur : " + errorMsg);
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
        </Card.Header>        <Card.Body>
          {errorMessage && (
            <Alert variant="danger">
              {errorMessage}
              <div className="mt-2">
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => {
                    setIsLoading(true);
                    setErrorMessage("");
                    setIsDataLoaded(false);
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i> Réessayer
                </Button>
              </div>
            </Alert>
          )}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {isDataLoaded ? (
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
                    <option value="EVENEMENTIEL">Evénementiel</option>
                    <option value="RONDE">Ronde</option>
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
                  <Form.Label>Tarif</Form.Label>
                  <Form.Select 
                    name="tarifMissionId" 
                    value={mission.tarifMissionId} 
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un tarif</option>
                    {Array.isArray(tarifs) && tarifs.map((tarif) => (
                      <option key={tarif.id} value={tarif.id}>
                        {tarif.libelle} - {tarif.prixUnitaireHT}€ HT
                      </option>
                    ))}
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
                  <Form.Label>Devis</Form.Label>
                  <Form.Select 
                    name="devisId" 
                    value={mission.devisId} 
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un devis</option>
                    {Array.isArray(devis) && devis.map((d) => (
                      <option key={d.id} value={d.id}>
                        #{d.id} - {d.referenceDevis || 'Sans référence'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contrat</Form.Label>
                  <Form.Select 
                    name="contratId" 
                    value={mission.contratId} 
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un contrat</option>
                    {Array.isArray(contrats) && contrats.map((contrat) => (
                      <option key={contrat.id} value={contrat.id}>
                        #{contrat.id} - {contrat.referenceContrat || 'Sans référence'}
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
                    {Array.isArray(sites) && sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.nom} ({site.adresse || 'Adresse non spécifiée'})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Géolocalisation</Form.Label>
                  {geolocalisations.length > 0 ? (
                    <Form.Select 
                      name="geolocalisationGpsId" 
                      value={mission.geolocalisationGpsId} 
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner une géolocalisation</option>
                      {geolocalisations.map((geo) => (
                        <option key={geo.id} value={geo.id}>
                          {geo.latitude}, {geo.longitude} - {geo.description || 'Sans description'}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <>
                      <Form.Control
                        type="text"
                        value="Chargement des géolocalisations impossible"
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Vous pourrez associer une géolocalisation plus tard depuis la liste des missions
                      </Form.Text>
                    </>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Planning</Form.Label>
                  <Form.Select 
                    name="planningId" 
                    value={mission.planningId} 
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un planning</option>
                    {Array.isArray(plannings) && plannings.map((planning) => (
                      <option key={planning.id} value={planning.id}>
                        Planning #{planning.id} - {planning.titre || planning.dateDebut ? new Date(planning.dateDebut).toLocaleDateString() : 'Sans date'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">                  <Form.Label>Agents</Form.Label>
                  <Form.Select 
                    name="agentIds" 
                    value={mission.agentIds || []}
                    onChange={handleChange}
                    multiple
                    style={{ height: '120px' }}
                  >
                    {Array.isArray(agents) && agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.nom} {agent.prenom} - {agent.numCarteProf || 'Sans carte'}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Utilisez Ctrl+clic pour sélectionner plusieurs agents
                  </Form.Text>
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
            </div>          </Form>
          ) : !errorMessage && (
            <Alert variant="info">
              <div className="text-center py-3">
                <Spinner animation="border" role="status" className="mb-2">
                  <span className="visually-hidden">Chargement...</span>
                </Spinner>
                <div>Chargement des données de la mission #{id}...</div>
                <div className="small text-muted mt-2">Veuillez patienter pendant que nous récupérons toutes les informations nécessaires.</div>
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditMission;
