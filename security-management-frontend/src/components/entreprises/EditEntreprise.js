import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, InputGroup, Spinner, Alert, Breadcrumb } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faSave, faTimes, faPhone, faMapMarkerAlt, faUser, faIdCard, faEnvelope, faFileContract, faCheckCircle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import EntrepriseService from "../../services/EntrepriseService";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import DevisService from "../../services/DevisService";
import Select from 'react-select';

const EditEntreprise = () => {
  const { id } = useParams();
  
  const [entreprise, setEntreprise] = useState({
    nom: "",
    siretPrestataire: "",
    representantPrestataire: "",
    numeroRue: "",
    rue: "",
    codePostal: "",
    ville: "",
    pays: "",
    telephone: "",
    email: "",
    devisIds: [],
    contratsDeTravailIds: []
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);  const [contratsDeTravail, setContratsDeTravail] = useState([]);
  const [selectedContrats, setSelectedContrats] = useState([]);
  const [contratsLoading, setContratsLoading] = useState(false);
  
  const [devis, setDevis] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState([]);
  const [devisLoading, setDevisLoading] = useState(false);
  
  const navigate = useNavigate();
  const [originalEntreprise, setOriginalEntreprise] = useState(null);
    useEffect(() => {
    setInitialLoading(true);
    EntrepriseService.getEntrepriseById(id)
      .then(response => {
        const entrepriseData = response.data;
        
        // Formater correctement le numéro de téléphone avec des espaces entre les paires de chiffres
        if (entrepriseData.telephone) {
          // D'abord, on retire tous les espaces existants
          const telSansEspaces = entrepriseData.telephone.replace(/\s+/g, '');
          
          // Ensuite, on reformate avec des espaces entre les paires de chiffres (XX XX XX XX XX)
          if (telSansEspaces.length === 10) {
            entrepriseData.telephone = telSansEspaces.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
          }
        }
        
        setEntreprise(entrepriseData);
        setOriginalEntreprise(entrepriseData); // Sauvegarder l'état initial
          // Si l'entreprise a des contrats de travail associés, les sélectionner
        if (entrepriseData.contratsDeTravailIds && entrepriseData.contratsDeTravailIds.length > 0) {
          setSelectedContrats(entrepriseData.contratsDeTravailIds);
        }
        
        // Si l'entreprise a des devis associés, les sélectionner
        if (entrepriseData.devisIds && entrepriseData.devisIds.length > 0) {
          setSelectedDevis(entrepriseData.devisIds);
        }
        
        setInitialLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement", error);
        setError("Impossible de charger les détails de l'entreprise. Veuillez réessayer.");
        setInitialLoading(false);
      });
  }, [id]);
  // Chargement des contrats de travail disponibles
  useEffect(() => {
    setContratsLoading(true);
    ContratDeTravailService.getAll()
      .then(response => {
        // Tous les contrats doivent être disponibles pour l'édition
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
        // Tous les devis doivent être disponibles pour l'édition
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
    
    // Toujours appliquer un formatage cohérent (XX XX XX XX XX)
    if (value.length > 0) {
      let formattedValue = '';
      for (let i = 0; i < value.length; i += 2) {
        formattedValue += value.slice(i, Math.min(i + 2, value.length));
        if (i + 2 < value.length) formattedValue += ' ';
      }
      value = formattedValue;
    }

    setEntreprise({
      ...entreprise,
      telephone: value
    });
  };// Gérer la sélection des contrats
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }    setLoading(true);
    setError(null);
      // S'assurer que les contratsDeTravailIds sont inclus dans les données envoyées
    // Convertir les valeurs en nombre si nécessaire et s'assurer qu'il n'y a pas de valeurs nulles
    const contratIds = selectedContrats.filter(id => id !== null).map(id => Number(id) || id);
    
    // S'assurer que les devisIds sont inclus dans les données envoyées
    const devisIds = selectedDevis.filter(id => id !== null).map(id => Number(id) || id);
    
    // Préparer les données pour la mise à jour
    let entrepriseToUpdate = {
      id: entreprise.id,
      nom: entreprise.nom,
      siretPrestataire: entreprise.siretPrestataire,
      representantPrestataire: entreprise.representantPrestataire,
      numeroRue: entreprise.numeroRue,
      rue: entreprise.rue,
      codePostal: entreprise.codePostal,
      ville: entreprise.ville,
      pays: entreprise.pays,
      email: entreprise.email,
      contratsDeTravailIds: contratIds,
      devisIds: devisIds
    };    // Toujours inclure le numéro de téléphone dans la mise à jour, qu'il ait été modifié ou non
    // Mais s'assurer qu'il est sans espaces pour respecter le format attendu par l'API
    // Vérifier d'abord que le numéro de téléphone est au format correct (10 chiffres sans les espaces)
    const phoneWithoutSpaces = entreprise.telephone ? entreprise.telephone.replace(/\s+/g, '') : '';
    
    // S'il y a une erreur de validation sur le numéro (longueur différente de 10), ne pas soumettre le formulaire
    if (phoneWithoutSpaces.length !== 10) {
      setError("Le numéro de téléphone doit comporter exactement 10 chiffres. Veuillez vérifier le format.");
      setLoading(false);
      return;
    }
    
    entrepriseToUpdate.telephone = phoneWithoutSpaces;
    
    // Vérifier que l'objet est correctement formaté avant envoi
    console.log("Données entreprise envoyées:", entrepriseToUpdate);
    
    EntrepriseService.updateEntreprise(id, entrepriseToUpdate)
      .then(() => {
        navigate("/entreprises");
      })
      .catch(error => {
        console.error("Erreur de mise à jour", error);
        setError("Une erreur est survenue lors de la mise à jour de l'entreprise. Veuillez réessayer.");
        setLoading(false);
      });
  };

  if (initialLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des données...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">      {/* Le fil d'Ariane a été supprimé */}
        <Card className="shadow border-0">
        <Card.Header className="bg-primary bg-gradient text-white py-3">
          <h4 className="m-0 fw-bold">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Modifier l'entreprise: {entreprise.nom}
          </h4>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}
          
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col lg={6}>                <Card className="h-100 shadow-sm border-0">
                  <Card.Header className="bg-light border-bottom border-primary border-opacity-25">
                    <h5 className="mb-0 text-primary fw-bold">Informations générales</h5>
                  </Card.Header>
                  <Card.Body className="p-4">                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">Nom de l'entreprise</Form.Label>
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
                    </Form.Group>                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">SIRET</Form.Label>
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
                    </Form.Group>                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">Représentant légal</Form.Label>
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
                    </Form.Group>                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">Téléphone</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faPhone} />
                        </InputGroup.Text>                        <Form.Control
                          type="tel"
                          name="telephone"
                          value={entreprise.telephone}
                          onChange={handlePhoneChange}
                          required
                          placeholder="XX XX XX XX XX"
                          pattern="[0-9]{2}(\s[0-9]{2}){4}|[0-9]{2}(\s[0-9]{2}){0,3}(\s[0-9]{1,2})?"
                          onClick={(e) => {
                            // Si le champ est rempli mais pas correctement formaté, reformater lors du clic
                            if (entreprise.telephone && !/^[0-9]{2}(\s[0-9]{2}){4}$/.test(entreprise.telephone)) {
                              const telSansEspaces = entreprise.telephone.replace(/\s+/g, '');
                              if (telSansEspaces.length === 10) {
                                const formatted = telSansEspaces.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
                                setEntreprise({...entreprise, telephone: formatted});
                              }
                            }
                          }}
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Format: XX XX XX XX XX
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir un numéro de téléphone valide.
                      </Form.Control.Feedback>
                    </Form.Group>                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">Email</Form.Label>
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
                    </Form.Group>                    <Form.Group className="mb-4">
                      <Form.Label className="text-dark fw-bold mb-2">
                        <FontAwesomeIcon icon={faFileContract} className="me-2 text-primary" />
                        Contrats de travail associés
                      </Form.Label>
                      <Select
                        isMulti
                        name="contratsDeTravailIds"
                        options={contratsDeTravail.map(contrat => ({
                          value: contrat.id,
                          label: `${contrat.referenceContrat || 'Contrat'} - ${contrat.typeContrat || 'Type inconnu'} - Agent: ${contrat.agentDeSecuriteId || 'Non défini'} (${contrat.dateDebut ? new Date(contrat.dateDebut).toLocaleDateString('fr-FR') : 'Date inconnue'})`
                        }))}
                        value={contratsDeTravail
                          .filter(contrat => selectedContrats.includes(contrat.id))
                          .map(contrat => ({
                            value: contrat.id,
                            label: `${contrat.referenceContrat || 'Contrat'} - ${contrat.typeContrat || 'Type inconnu'} - Agent: ${contrat.agentDeSecuriteId || 'Non défini'} (${contrat.dateDebut ? new Date(contrat.dateDebut).toLocaleDateString('fr-FR') : 'Date inconnue'})`
                          }))
                        }
                        onChange={handleContratsChange}
                        isLoading={contratsLoading}
                        placeholder="Sélectionnez les contrats de travail à associer..."
                        noOptionsMessage={() => "Aucun contrat disponible"}
                        className="basic-multi-select"
                        classNamePrefix="select"
                      />                      <Form.Text className="text-muted">
                        Associez cette entreprise à des contrats de travail. <strong>Attention:</strong> Si un contrat est déjà associé à une autre entreprise, il sera automatiquement dissocié de celle-ci pour être associé à l'entreprise actuelle.
                      </Form.Text>
                    </Form.Group>
                      <Form.Group className="mb-4">
                      <Form.Label className="text-dark fw-bold mb-2">
                        <FontAwesomeIcon icon={faFileContract} className="me-2 text-primary" />
                        Devis associés
                      </Form.Label>
                      <Select
                        isMulti
                        name="devisIds"
                        options={devis.map(devis => ({
                          value: devis.id,
                          label: `${devis.referenceDevis || 'Devis'} - ${devis.description || 'Sans description'} (${devis.dateCreation ? new Date(devis.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'})`
                        }))}
                        value={devis
                          .filter(d => selectedDevis.includes(d.id))
                          .map(d => ({
                            value: d.id,
                            label: `${d.referenceDevis || 'Devis'} - ${d.description || 'Sans description'} (${d.dateCreation ? new Date(d.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'})`
                          }))
                        }
                        onChange={handleDevisChange}
                        isLoading={devisLoading}
                        placeholder="Sélectionnez les devis à associer..."
                        noOptionsMessage={() => "Aucun devis disponible"}
                        className="basic-multi-select"
                        classNamePrefix="select"
                      />                      <Form.Text className="text-muted">
                        Associez cette entreprise à des devis. <strong>Attention:</strong> Si un devis est déjà associé à une autre entreprise, il sera automatiquement dissocié de celle-ci pour être associé à l'entreprise actuelle.
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={6}>                <Card className="h-100 shadow-sm border-0">
                  <Card.Header className="bg-light border-bottom border-primary border-opacity-25">
                    <h5 className="mb-0 text-primary fw-bold">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                      Adresse
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row>
                      <Col md={4}>                        <Form.Group className="mb-3">
                          <Form.Label className="text-dark fw-bold">N° de rue</Form.Label>
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
                      <Col md={8}>                        <Form.Group className="mb-3">
                          <Form.Label className="text-dark fw-bold">Rue</Form.Label>
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
                      <Col md={4}>                        <Form.Group className="mb-3">
                          <Form.Label className="text-dark fw-bold">Code Postal</Form.Label>
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
                      <Col md={8}>                        <Form.Group className="mb-3">
                          <Form.Label className="text-dark fw-bold">Ville</Form.Label>
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
            </Row>            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
              <Link to="/entreprises">
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center px-4 py-2 rounded-pill"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Retour à la liste
                </Button>
              </Link>
              <Button 
                type="submit" 
                variant="primary" 
                className="d-flex align-items-center px-4 py-2 rounded-pill"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Modification en cours...
                  </>
                ) : (                  <>
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    Enregistrer les modifications
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

export default EditEntreprise;
