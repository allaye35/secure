/* src/components/agents/EditAgent.jsx */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select/creatable";
import { Card, Row, Col, Form, Button, Alert, Container, Spinner, Nav, Tab, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserEdit, faSave, faTimes, faIdCard, faGraduationCap, 
  faCalendarAlt, faFileContract, faBell, faMapMarkerAlt, faTasks
} from '@fortawesome/free-solid-svg-icons';

/* ─── services REST ───────────────────────────────────────────────────── */
import AgentService            from "../../services/AgentService";
import ZoneService             from "../../services/ZoneService";
import MissionService          from "../../services/MissionService";          // ⇦ getAllMissions()
import DisponibiliteService    from "../../services/DisponibiliteService";
import DiplomeService          from "../../services/DiplomeService";
import CarteProService         from "../../services/CarteProService";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import NotificationService     from "../../services/NotificationService";

import "../../styles/AgentForm.css";

export default function EditAgent() {
  const { id }   = useParams();
  const navigate = useNavigate();

  /* ╔══════════════════════════╗
     ║   1) ÉTAT PRINCIPAL      ║
     ╚══════════════════════════╝ */
  const [agent, setAgent] = useState({
    nom: "", prenom: "", email: "", telephone: "", adresse: "",
    dateNaissance: "", statut: "EN_SERVICE", role: "AGENT_SECURITE",
    password: "******", newPassword: ""
  });

  /* ╔══════════════════════════╗
     ║   2) OPTIONS <Select>    ║
     ╚══════════════════════════╝ */
  const [zonesOpts,    setZonesOpts]    = useState([]);
  const [missionsOpts, setMissionsOpts] = useState([]);
  const [disposOpts,   setDisposOpts]   = useState([]);
  const [diplomesOpts, setDiplomesOpts] = useState([]);
  const [cartesOpts,   setCartesOpts]   = useState([]);
  const [contratsOpts, setContratsOpts] = useState([]);
  const [notifsOpts,   setNotifsOpts]   = useState([]);

  /* ╔══════════════════════════╗
     ║   3) SÉLECTION COURANTE  ║
     ╚══════════════════════════╝ */
  const [zonesSel,     setZonesSel]     = useState([]);
  const [missionsSel,  setMissionsSel]  = useState([]);
  const [disposSel,    setDisposSel]    = useState([]);
  const [diplomesSel,  setDiplomesSel]  = useState([]);
  const [cartesSel,    setCartesSel]    = useState([]);
  const [contratsSel,  setContratsSel]  = useState([]);
  const [notifsSel,    setNotifsSel]    = useState([]);

  /* ╔══════════════════════════╗
     ║   4) FLAGS "TOUCHED"     ║
     ╚══════════════════════════╝ */
  const [disposTouched,   setDisposTouched]   = useState(false);
  const [diplomesTouched, setDiplomesTouched] = useState(false);
  const [cartesTouched,   setCartesTouched]   = useState(false);
  const [contratsTouched, setContratsTouched] = useState(false);
  const [notifsTouched,   setNotifsTouched]   = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('infos');

  /* ╔══════════════════════════╗
     ║   5) CHARGEMENT INITIAL  ║
     ╚══════════════════════════╝ */
  useEffect(() => {
    /* 5‑1  options */
    ZoneService.getAll()
        .then(r => setZonesOpts(r.data.map(z => ({ value: z.id, label: z.nom }))));

    MissionService.getAllMissions()
        .then(r => setMissionsOpts(r.data.map(m => ({ value: m.id, label: m.titre }))));

    DisponibiliteService.getAll()
        .then(r => setDisposOpts(r.data.map(d => ({
          value: d.id,
          label: `${new Date(d.dateDebut).toLocaleString()} → ${new Date(d.dateFin).toLocaleString()}`
        }))));

    DiplomeService.getAll()
        .then(r => setDiplomesOpts(r.data.map(d => ({
          value: d.id,
          label: `${d.niveau} (${new Date(d.dateObtention).toLocaleDateString()})`
        }))));

    CarteProService.getAll()
        .then(r => setCartesOpts(r.data.map(c => ({
          value: c.id,
          label: `#${c.numeroCarte} (${new Date(c.dateDebut).toLocaleDateString()})`
        }))));

    ContratDeTravailService.getAll()
        .then(r => setContratsOpts(r.data.map(c => ({
          value: c.id,
          label: `${c.typeContrat} (${new Date(c.dateDebut).toLocaleDateString()})`
        }))));

    NotificationService.getAll()
        .then(r => setNotifsOpts(r.data.map(n => ({
          value: n.id,
          label: `${n.titre} — ${new Date(n.dateEnvoi).toLocaleDateString()}`
        }))));

    /* 5‑2  données de l'agent */
    AgentService.getAgentById(id).then(({ data }) => {
      setAgent(a => ({
        ...a,
        ...data,
        password: "******",
        newPassword: "",
        dateNaissance: data.dateNaissance ? data.dateNaissance.slice(0, 10) : ""
      }));

      setZonesSel    (data.zonesDeTravailIds?.map(v => ({ value: v, label: "" })) ?? []);
      setMissionsSel (data.missionsIds?.map        (v => ({ value: v, label: "" })) ?? []);
      setDisposSel   (data.disponibilitesIds?.map  (v => ({ value: v, label: "" })) ?? []);
      setDiplomesSel (data.diplomesSSIAPIds?.map   (v => ({ value: v, label: "" })) ?? []);
      setCartesSel   (data.cartesProfessionnellesIds?.map(v => ({ value: v, label: "" })) ?? []);
      setContratsSel (data.contratsDeTravailIds?.map(v => ({ value: v, label: "" })) ?? []);
      setNotifsSel   (data.notificationsIds?.map   (v => ({ value: v, label: "" })) ?? []);
    });
  }, [id]);

  /* ╔══════════════════════════╗
     ║   6) HANDLERS            ║
     ╚══════════════════════════╝ */
  const handleChange = e => {
    const { name, value } = e.target;
    setAgent(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      id,
      nom: agent.nom, prenom: agent.prenom, email: agent.email,
      telephone: agent.telephone, adresse: agent.adresse,
      dateNaissance: agent.dateNaissance || null,
      statut: agent.statut, role: agent.role,
      password: agent.newPassword ? agent.newPassword : undefined,

      /* toujours envoyés */
      zonesDeTravailIds: zonesSel.map(o => o.value),
      missionsIds      : missionsSel.map(o => o.value)
    };

    /* envoyés seulement si modifiés (collections orphanRemoval) */
    if (disposTouched)   payload.disponibilitesIds         = disposSel.map(o => o.value);
    if (cartesTouched)   payload.cartesProfessionnellesIds = cartesSel.map(o => o.value);
    if (diplomesTouched) payload.diplomesSSIAPIds          = diplomesSel.map(o => o.value);
    if (contratsTouched) payload.contratsDeTravailIds      = contratsSel.map(o => o.value);
    if (notifsTouched)   payload.notificationsIds          = notifsSel.map(o => o.value);

    try {
      await AgentService.updateAgent(id, payload);
      navigate("/agents");
    } catch (err) {
      setError(`Mise à jour impossible : ${err.response?.data?.message ?? "serveur indisponible"}`);
      setLoading(false);
    }
  };

  /* ╔══════════════════════════╗
     ║   7) UI                  ║
     ╚══════════════════════════╝ */
  return (
    <Container className="py-4 animate__animated animate__fadeIn">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <FontAwesomeIcon icon={faUserEdit} className="me-2" /> 
            Modifier l'agent de sécurité
          </h4>
          <Badge 
            bg={
              agent.statut === "EN_SERVICE" ? "success" : 
              agent.statut === "EN_CONGE" ? "warning" : "danger"
            }
          >
            {agent.statut === "EN_SERVICE" ? "En service" : 
             agent.statut === "EN_CONGE" ? "En congé" : "Hors service"}
          </Badge>
        </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              <Alert.Heading>Erreur</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Row>
              <Col md={3}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="infos" className="mb-2">
                      <FontAwesomeIcon icon={faIdCard} className="me-2" /> 
                      Informations personnelles
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="zones" className="mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> 
                      Zones et Missions
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="diplomes" className="mb-2">
                      <FontAwesomeIcon icon={faGraduationCap} className="me-2" /> 
                      Diplômes et Cartes Pro
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="disponibilites" className="mb-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" /> 
                      Disponibilités
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="contrats" className="mb-2">
                      <FontAwesomeIcon icon={faFileContract} className="me-2" /> 
                      Contrats de travail
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications">
                      <FontAwesomeIcon icon={faBell} className="me-2" /> 
                      Notifications
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col md={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="infos">
                    <h5 className="mb-3 border-bottom pb-2">Informations personnelles</h5>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                              name="nom"
                              value={agent.nom}
                              onChange={handleChange}
                              required
                              placeholder="Entrez le nom"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Prénom</Form.Label>
                            <Form.Control
                              name="prenom"
                              value={agent.prenom}
                              onChange={handleChange}
                              required
                              placeholder="Entrez le prénom"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              name="email"
                              type="email"
                              value={agent.email}
                              onChange={handleChange}
                              required
                              placeholder="Entrez l'email"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control
                              name="telephone"
                              value={agent.telephone}
                              onChange={handleChange}
                              placeholder="Entrez le numéro de téléphone"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Adresse</Form.Label>
                        <Form.Control
                          name="adresse"
                          value={agent.adresse}
                          onChange={handleChange}
                          placeholder="Entrez l'adresse complète"
                        />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date de naissance</Form.Label>
                            <Form.Control
                              name="dateNaissance"
                              type="date"
                              value={agent.dateNaissance}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Statut</Form.Label>
                            <Form.Select 
                              name="statut" 
                              value={agent.statut} 
                              onChange={handleChange}
                              className={
                                agent.statut === "EN_SERVICE" ? "border-success" : 
                                agent.statut === "EN_CONGE" ? "border-warning" : "border-danger"
                              }
                            >
                              <option value="EN_SERVICE">En service</option>
                              <option value="EN_CONGE">En congé</option>
                              <option value="ABSENT">Hors service</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Nouveau mot de passe</Form.Label>
                        <Form.Control
                          name="newPassword"
                          type="password"
                          value={agent.newPassword}
                          onChange={handleChange}
                          placeholder="Laisser vide pour conserver le mot de passe actuel"
                        />
                        <Form.Text className="text-muted">
                          Laissez vide pour conserver le mot de passe actuel
                        </Form.Text>
                      </Form.Group>
                      
                      <div className="d-flex justify-content-end mt-4">
                        <Button 
                          variant="outline-secondary" 
                          className="me-2"
                          onClick={() => navigate('/agents')}
                        >
                          <FontAwesomeIcon icon={faTimes} className="me-1" /> Annuler
                        </Button>
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" className="me-1" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faSave} className="me-1" /> Enregistrer
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="zones">
                    <h5 className="mb-3 border-bottom pb-2">Zones et Missions</h5>
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" /> Zones de travail
                      </Form.Label>
                      <Select
                        isMulti
                        options={zonesOpts}
                        value={zonesSel}
                        onChange={setZonesSel}
                        placeholder="Sélectionnez les zones de travail"
                        classNamePrefix="select"
                        className="basic-multi-select"
                      />
                      <Form.Text className="text-muted">
                        Les zones géographiques où l'agent est autorisé à travailler
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FontAwesomeIcon icon={faTasks} className="me-1" /> Missions
                      </Form.Label>
                      <Select
                        isMulti
                        options={missionsOpts}
                        value={missionsSel}
                        onChange={setMissionsSel}
                        placeholder="Sélectionnez les missions"
                        classNamePrefix="select"
                        className="basic-multi-select"
                      />
                      <Form.Text className="text-muted">
                        Les missions auxquelles l'agent peut être affecté
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end mt-4">
                      <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-1" /> Enregistrer les modifications
                      </Button>
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="diplomes">
                    <h5 className="mb-3 border-bottom pb-2">Diplômes et Qualifications</h5>
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FontAwesomeIcon icon={faGraduationCap} className="me-1" /> Diplômes SSIAP
                      </Form.Label>
                      <Select
                        isMulti
                        options={diplomesOpts}
                        value={diplomesSel}
                        onChange={sel => { setDiplomesSel(sel); setDiplomesTouched(true); }}
                        placeholder="Sélectionnez les diplômes SSIAP"
                        classNamePrefix="select"
                        className="basic-multi-select"
                      />
                      <Form.Text className="text-muted">
                        Les diplômes de sécurité incendie obtenus par l'agent
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FontAwesomeIcon icon={faIdCard} className="me-1" /> Cartes professionnelles
                      </Form.Label>
                      <Select
                        isMulti
                        options={cartesOpts}
                        value={cartesSel}
                        onChange={sel => { setCartesSel(sel); setCartesTouched(true); }}
                        placeholder="Sélectionnez les cartes professionnelles"
                        classNamePrefix="select"
                        className="basic-multi-select"
                      />
                      <Form.Text className="text-muted">
                        Les cartes professionnelles de l'agent (certifications obligatoires)
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end mt-4">
                      <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-1" /> Enregistrer les modifications
                      </Button>
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="disponibilites">
                    <h5 className="mb-3 border-bottom pb-2">Disponibilités</h5>
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Périodes de disponibilité
                      </Form.Label>
                      <Select
                        isMulti
                        options={disposOpts}
                        value={disposSel}
                        onChange={sel => { setDisposSel(sel); setDisposTouched(true); }}
                        placeholder="Sélectionnez les périodes de disponibilité"
                        classNamePrefix="select"
                        className="basic-multi-select"
                      />
                      <Form.Text className="text-muted">
                        Les périodes durant lesquelles l'agent est disponible pour travailler
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end mt-4">
                      <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-1" /> Enregistrer les modifications
                      </Button>
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="contrats">
                    <h5 className="mb-3 border-bottom pb-2">Contrats de travail</h5>
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FontAwesomeIcon icon={faFileContract} className="me-1" /> Contrats associés
                      </Form.Label>
                      <Select
                        isMulti
                        options={contratsOpts}
                        value={contratsSel}
                        onChange={sel => { setContratsSel(sel); setContratsTouched(true); }}
                        placeholder="Sélectionnez les contrats de travail"
                        classNamePrefix="select"
                        className="basic-multi-select"
                      />
                      <Form.Text className="text-muted">
                        Les contrats de travail associés à cet agent
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end mt-4">
                      <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-1" /> Enregistrer les modifications
                      </Button>
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="notifications">
                    <h5 className="mb-3 border-bottom pb-2">Notifications</h5>
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FontAwesomeIcon icon={faBell} className="me-1" /> Notifications reçues
                      </Form.Label>
                      <Select
                        isMulti
                        options={notifsOpts}
                        value={notifsSel}
                        onChange={sel => { setNotifsSel(sel); setNotifsTouched(true); }}
                        placeholder="Sélectionnez les notifications"
                        classNamePrefix="select"
                        className="basic-multi-select"
                      />
                      <Form.Text className="text-muted">
                        Les notifications envoyées à cet agent
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end mt-4">
                      <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-1" /> Enregistrer les modifications
                      </Button>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
}
