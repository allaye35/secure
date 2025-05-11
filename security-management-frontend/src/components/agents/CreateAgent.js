// src/components/agents/CreateAgent.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Form, Button, Container, Row, Col, Card, Alert, InputGroup } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase, FaMapPin, FaClock, FaGraduationCap, FaIdCard } from 'react-icons/fa';

import AgentService from '../../services/AgentService';
import ZoneService from '../../services/ZoneService';
import DisponibiliteService from '../../services/DisponibiliteService';
import DiplomeService from '../../services/DiplomeService';
import CarteProService from '../../services/CarteProService';

import '../../styles/AgentForm.css';

export default function CreateAgent() {
  const navigate = useNavigate();

  /* ---------- état principal ---------- */
  const [agent, setAgent] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    adresse: '',
    dateNaissance: '',
    statut: 'EN_SERVICE',
    role: 'AGENT_SECURITE'
  });

  /* ---------- listes d'options ---------- */
  const [zonesOpts, setZonesOpts] = useState([]);
  const [disposOpts, setDisposOpts] = useState([]);
  const [diplomesOpts, setDiplomesOpts] = useState([]);
  const [cartesOpts, setCartesOpts] = useState([]);

  /* ---------- sélection utilisateur ---------- */
  const [zonesSel, setZonesSel] = useState([]);
  const [disposSel, setDisposSel] = useState([]);
  const [diplomesSel, setDiplomesSel] = useState([]);
  const [cartesSel, setCartesSel] = useState([]);

  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  /* -------------------------------------------------------------------- */
  /* 1.  Charger les données existantes dès le montage                    */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    ZoneService.getAll().then(res =>
      setZonesOpts(res.data.map(z => ({ value: z.id, label: z.nom })))
    );

    DisponibiliteService.getAll().then(res =>
      setDisposOpts(res.data.map(d => ({
        value: d.id,
        label: `${new Date(d.dateDebut).toLocaleString()} → ${new Date(d.dateFin).toLocaleString()}`
      })))
    );

    DiplomeService.getAll().then(res =>
      setDiplomesOpts(res.data.map(d => ({
        value: d.id,
        label: `${d.niveau} (${new Date(d.dateObtention).toLocaleDateString()})`
      })))
    );

    CarteProService.getAll().then(res =>
      setCartesOpts(res.data.map(c => ({
        value: c.id,
        label: `#${c.numeroCarte} (${new Date(c.dateDebut).toLocaleDateString()})`
      })))
    );
  }, []);

  /* -------------------------------------------------------------------- */
  /* 2.  Binding des champs « texte »                                     */
  /* -------------------------------------------------------------------- */
  const handleChange = e => {
    const { name, value } = e.target;
    setAgent(prev => ({ ...prev, [name]: value }));
  };

  /* -------------------------------------------------------------------- */
  /* 3.  Soumission                                                       */
  /* -------------------------------------------------------------------- */
  const handleSubmit = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Activation de la validation Bootstrap
    setValidated(true);
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }
    
    setError('');

    if (agent.password !== agent.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const payload = {
      ...agent,
      zonesDeTravailIds: zonesSel.map(o => o.value),
      disponibilitesIds: disposSel.map(o => o.value),
      diplomesSSIAPIds: diplomesSel.map(o => o.value),
      cartesProfessionnellesIds: cartesSel.map(o => o.value)
    };

    try {
      await AgentService.createAgent(payload);
      navigate('/agents');
    } catch (err) {
      console.error(err);
      setError("Création impossible : " + (err.response?.data?.message ?? 'erreur serveur'));
    }
  };

  /* -------------------------------------------------------------------- */
  /* 4.  Personnalisation du style pour react-select                      */
  /* -------------------------------------------------------------------- */
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.375rem',
      borderColor: '#ced4da',
      minHeight: '38px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#86b7fe',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999
    })
  };

  /* -------------------------------------------------------------------- */
  /* 5.  Rendu                                                            */
  /* -------------------------------------------------------------------- */
  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white p-3">
          <FaUser className="me-2" /> Créer un nouvel agent de sécurité
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col>
                <h5 className="border-bottom pb-2 mb-3">Informations personnelles</h5>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaUser /></InputGroup.Text>
                    <Form.Control
                      name="nom"
                      placeholder="Nom"
                      value={agent.nom}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir un nom.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaUser /></InputGroup.Text>
                    <Form.Control
                      name="prenom"
                      placeholder="Prénom"
                      value={agent.prenom}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir un prénom.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={agent.email}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                    />
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir une adresse email valide.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaPhone /></InputGroup.Text>
                    <Form.Control
                      name="telephone"
                      placeholder="Téléphone"
                      value={agent.telephone}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Adresse</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaMapMarkerAlt /></InputGroup.Text>
                    <Form.Control
                      name="adresse"
                      placeholder="Adresse"
                      value={agent.adresse}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de naissance</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                    <Form.Control
                      name="dateNaissance"
                      type="date"
                      value={agent.dateNaissance}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4 mt-4">
              <Col>
                <h5 className="border-bottom pb-2 mb-3">Informations de sécurité</h5>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaLock /></InputGroup.Text>
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="Mot de passe"
                      value={agent.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir un mot de passe.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmer le mot de passe</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaLock /></InputGroup.Text>
                    <Form.Control
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      value={agent.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      isInvalid={agent.password !== agent.confirmPassword && agent.confirmPassword !== ''}
                    />
                    <Form.Control.Feedback type="invalid">
                      Les mots de passe ne correspondent pas.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4 mt-4">
              <Col>
                <h5 className="border-bottom pb-2 mb-3">Statut et affectations</h5>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaBriefcase /></InputGroup.Text>
                    <Form.Select name="statut" value={agent.statut} onChange={handleChange}>
                      <option value="EN_SERVICE">En service</option>
                      <option value="EN_CONGE">En congé</option>
                      <option value="ABSENT">Absent</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FaMapPin className="me-1" /> Zones de travail</Form.Label>
                  <Select
                    isMulti
                    options={zonesOpts}
                    value={zonesSel}
                    onChange={setZonesSel}
                    placeholder="Sélectionner les zones..."
                    styles={selectStyles}
                    classNamePrefix="select"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FaClock className="me-1" /> Disponibilités</Form.Label>
                  <Select
                    isMulti
                    options={disposOpts}
                    value={disposSel}
                    onChange={setDisposSel}
                    placeholder="Sélectionner les disponibilités..."
                    styles={selectStyles}
                    classNamePrefix="select"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FaGraduationCap className="me-1" /> Diplômes SSIAP</Form.Label>
                  <Select
                    isMulti
                    options={diplomesOpts}
                    value={diplomesSel}
                    onChange={setDiplomesSel}
                    placeholder="Sélectionner les diplômes..."
                    styles={selectStyles}
                    classNamePrefix="select"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FaIdCard className="me-1" /> Cartes professionnelles</Form.Label>
                  <Select
                    isMulti
                    options={cartesOpts}
                    value={cartesSel}
                    onChange={setCartesSel}
                    placeholder="Sélectionner les cartes pro..."
                    styles={selectStyles}
                    classNamePrefix="select"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/agents')}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  Créer l'agent
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
