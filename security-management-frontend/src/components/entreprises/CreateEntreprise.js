// src/components/entreprises/CreateEntreprise.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faSave, faTimes, faPhone, faMapMarkerAlt, faUser, faIdCard, faEnvelope, faFileContract } from "@fortawesome/free-solid-svg-icons";
import EntrepriseService from "../../services/EntrepriseService";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import DevisService from "../../services/DevisService";
import Select from 'react-select';

const CreateEntreprise = () => {
  const [entreprise, setEntreprise] = useState({
    nom: "",
    siretPrestataire: "",
    representantPrestataire: "",
    numeroRue: "",
    rue: "",
    codePostal: "",
    ville: "",
    pays: "France", // Valeur par défaut
    telephone: "",
    email: "",
    devisIds: [],
    contratsDeTravailIds: []
  });
  
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  const [contratsDeTravail, setContratsDeTravail] = useState([]);
  const [selectedContrats, setSelectedContrats] = useState([]);
  const [contratsLoading, setContratsLoading] = useState(false);
  
  const [devis, setDevis] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState([]);
  const [devisLoading, setDevisLoading] = useState(false);
  
  const navigate = useNavigate();  // Chargement des contrats de travail disponibles
  useEffect(() => {
    setContratsLoading(true);
    ContratDeTravailService.getAll()
      .then(response => {
        setContratsDeTravail(response.data);
        setContratsLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement des contrats de travail", error);
        setContratsLoading(false);
      });
  }, []);
  
  // Chargement des devis disponibles
  useEffect(() => {
    setDevisLoading(true);
    DevisService.getAll()
      .then(response => {
        setDevis(response.data);
        setDevisLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement des devis", error);
        setDevisLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntreprise({
      ...entreprise,
      [name]: value
    });
  };
    // Gérer la sélection des contrats
  const handleContratsChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedContrats(selectedIds);
    
    setEntreprise({
      ...entreprise,
      contratsDeTravailIds: selectedIds
    });
  };
  
  // Gérer la sélection des devis
  const handleDevisChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedDevis(selectedIds);
    
    setEntreprise({
      ...entreprise,
      devisIds: selectedIds
    });
  };

  // Formatage automatique du SIRET
  const handleSiretChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Enlever tous les caractères non numériques
    if (value.length > 14) value = value.slice(0, 14); // Limiter à 14 chiffres
    
    // Formater avec des espaces
    if (value.length > 9) {
      value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 9) + ' ' + value.slice(9);
    } else if (value.length > 6) {
      value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
    } else if (value.length > 3) {
      value = value.slice(0, 3) + ' ' + value.slice(3);
    }

    setEntreprise({
      ...entreprise,
      siretPrestataire: value
    });
  };

  // Formatage automatique du téléphone
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Enlever tous les caractères non numériques
    if (value.length > 10) value = value.slice(0, 10); // Limiter à 10 chiffres
    
    // Formater avec des espaces
    if (value.length > 8) {
      value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4, 6) + ' ' + value.slice(6, 8) + ' ' + value.slice(8);
    } else if (value.length > 6) {
      value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4, 6) + ' ' + value.slice(6);
    } else if (value.length > 4) {
      value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4);
    } else if (value.length > 2) {
      value = value.slice(0, 2) + ' ' + value.slice(2);
    }

    setEntreprise({
      ...entreprise,
      telephone: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }    setLoading(true);
    setError(null);    // S'assurer que les contratsDeTravailIds sont inclus dans les données envoyées
    // Convertir les valeurs en nombre si nécessaire et s'assurer qu'il n'y a pas de valeurs nulles
    const contratIds = selectedContrats.filter(id => id !== null).map(id => Number(id) || id);
    
    // S'assurer que les devisIds sont inclus dans les données envoyées
    const devisIds = selectedDevis.filter(id => id !== null).map(id => Number(id) || id);
    
    // Enlever les espaces du numéro de téléphone car il semble y avoir une contrainte d'unicité
    const formattedTelephone = entreprise.telephone ? entreprise.telephone.replace(/\s+/g, '') : '';
    
    const entrepriseToCreate = {
      ...entreprise,
      telephone: formattedTelephone,
      contratsDeTravailIds: contratIds,
      devisIds: devisIds
    };
    
    // Vérifier que l'objet est correctement formaté avant envoi
    console.log("Données entreprise envoyées:", entrepriseToCreate);
    
    EntrepriseService.createEntreprise(entrepriseToCreate)
      .then(() => {
        navigate("/entreprises");
      })
      .catch(err => {
        console.error("Erreur de création :", err);
        setError("Une erreur est survenue lors de la création de l'entreprise. Veuillez réessayer.");
        setLoading(false);
      });
  };

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary bg-gradient text-white">
          <h4 className="m-0">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Créer une nouvelle entreprise
          </h4>
        </Card.Header>
        <Card.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col lg={6}>
                <Card className="h-100">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Informations générales</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom de l'entreprise</Form.Label>
                      <Form.Control
                        type="text"
                        name="nom"
                        value={entreprise.nom}
                        onChange={handleChange}
                        required
                        placeholder="Nom de l'entreprise"
                      />
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir le nom de l'entreprise.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>SIRET</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faIdCard} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="siretPrestataire"
                          value={entreprise.siretPrestataire}
                          onChange={handleSiretChange}
                          required
                          placeholder="XXX XXX XXX XXXXX"
                          pattern="[0-9 ]{14,20}"
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Format: 14 chiffres (XXX XXX XXX XXXXX)
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir un SIRET valide (14 chiffres).
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Représentant légal</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUser} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="representantPrestataire"
                          value={entreprise.representantPrestataire}
                          onChange={handleChange}
                          required
                          placeholder="Nom et prénom du représentant"
                        />
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir le nom du représentant.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Téléphone</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faPhone} />
                        </InputGroup.Text>
                        <Form.Control
                          type="tel"
                          name="telephone"
                          value={entreprise.telephone}
                          onChange={handlePhoneChange}
                          required
                          placeholder="XX XX XX XX XX"
                          pattern="[0-9 ]{14}"
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Format: XX XX XX XX XX
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir un numéro de téléphone valide.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          name="email"
                          value={entreprise.email || ""}
                          onChange={handleChange}
                          placeholder="exemple@domaine.com"
                        />
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir une adresse email valide.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={6}>
                <Card className="h-100">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                      Adresse
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>N° de rue</Form.Label>
                          <Form.Control
                            type="text"
                            name="numeroRue"
                            value={entreprise.numeroRue}
                            onChange={handleChange}
                            required
                            placeholder="N°"
                          />
                          <Form.Control.Feedback type="invalid">
                            Requis
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={8}>
                        <Form.Group className="mb-3">
                          <Form.Label>Rue</Form.Label>
                          <Form.Control
                            type="text"
                            name="rue"
                            value={entreprise.rue}
                            onChange={handleChange}
                            required
                            placeholder="Nom de la rue"
                          />
                          <Form.Control.Feedback type="invalid">
                            Requis
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Code Postal</Form.Label>
                          <Form.Control
                            type="text"
                            name="codePostal"
                            value={entreprise.codePostal}
                            onChange={handleChange}
                            required
                            placeholder="Code postal"
                            pattern="[0-9]{5}"
                          />
                          <Form.Control.Feedback type="invalid">
                            Code postal à 5 chiffres
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={8}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ville</Form.Label>
                          <Form.Control
                            type="text"
                            name="ville"
                            value={entreprise.ville}
                            onChange={handleChange}
                            required
                            placeholder="Ville"
                          />
                          <Form.Control.Feedback type="invalid">
                            Requis
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Pays</Form.Label>
                      <Form.Select
                        name="pays"
                        value={entreprise.pays}
                        onChange={handleChange}
                        required
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Luxembourg">Luxembourg</option>
                        <option value="Allemagne">Allemagne</option>
                        <option value="Espagne">Espagne</option>
                        <option value="Italie">Italie</option>
                        <option value="Autre">Autre</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Requis
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-between mt-3">
              <Link to="/entreprises">
                <Button variant="secondary" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Annuler
                </Button>
              </Link>
              <Button 
                type="submit" 
                variant="success" 
                className="d-flex align-items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Créer l'entreprise
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateEntreprise;
