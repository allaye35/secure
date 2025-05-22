import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import MissionService from "../../services/MissionService";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, InputGroup, Badge, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEuroSign, faPercent, faSave, faArrowLeft, faPlus, faMinus, faMoon, faCalendarWeek, faCalendarDay, faCalendarCheck, faList } from "@fortawesome/free-solid-svg-icons";
import "../../styles/TarifMissionFormV2.css";

// ⚠️ Liste exacte validée avec les types autorisés par le backend
const TYPE_MISSIONS = [
    "GARDE_DU_CORPS",
    "SECURITE_EVENEMENTIELLE",
    "CONTROLEUR_ACCES",
    "CQP_APS",
    "SURVEILLANCE",
    "SSIAP_1",
    "SSIAP_2",
    "SSIAP_3",
    "RONDEUR",
    "TELESURVEILLANCE",
    "AGENT_SURVEILLANCE_VIDEO"
];

export default function TarifMissionForm() {
    const { id }   = useParams();
    const isEdit   = Boolean(id);
    const navigate = useNavigate();

    const [dto, setDto] = useState({
        typeMission:     TYPE_MISSIONS[0],
        prixUnitaireHT:  "",
        majorationNuit:  "",
        majorationWeekend:"",
        majorationDimanche:"",
        majorationFerie: "",
        tauxTVA:         "",
        missionIds:      []
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [allMissions, setAllMissions] = useState([]);
    const [missionsLoading, setMissionsLoading] = useState(false);
    const [selectedMissions, setSelectedMissions] = useState([]);
    const [affichageTTC, setAffichageTTC] = useState(false);    // Charger les données initiales (tarif et missions)
    useEffect(() => {
        setLoading(true);

        // Récupérer toutes les missions disponibles
        setMissionsLoading(true);        MissionService.getAll()
            .then((data) => {
                setAllMissions(data);
                setMissionsLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des missions:", err);
                setMissionsLoading(false);
            });        // Si en mode édition, charger le tarif existant
        if (isEdit) {
            TarifMissionService.getById(id)
                .then((data) => {
                    setDto({
                        typeMission:     data.typeMission,
                        prixUnitaireHT:  data.prixUnitaireHT,
                        majorationNuit:  data.majorationNuit || 0,
                        majorationWeekend:data.majorationWeekend || 0,
                        majorationDimanche:data.majorationDimanche || 0,
                        majorationFerie: data.majorationFerie || 0,
                        tauxTVA:         data.tauxTVA || 20,
                        missionIds:      data.missionIds || []
                    });
                    
                    // Si le tarif a des missions associées, les marquer comme sélectionnées
                    if (data.missionIds && data.missionIds.length > 0) {
                        setSelectedMissions(data.missionIds);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    setError("Impossible de charger le tarif: " + (err.response?.data || err.message));
                    setLoading(false);
                });
        } else {
            // En mode création, initialiser avec des valeurs par défaut
            setDto(prev => ({
                ...prev,
                majorationNuit: 0,
                majorationWeekend: 0,
                majorationDimanche: 0,
                majorationFerie: 0,
                tauxTVA: 20
            }));
            setLoading(false);
        }
    }, [id, isEdit]);    const handleChange = e => {
        const { name, value } = e.target;
        setDto(d => ({ ...d, [name]: value }));
    };
    
    // Basculer une mission comme sélectionnée ou non
    const toggleMissionSelection = (missionId) => {
        if (selectedMissions.includes(missionId)) {
            setSelectedMissions(selectedMissions.filter(id => id !== missionId));
        } else {
            setSelectedMissions([...selectedMissions, missionId]);
        }
    };
    
    // Calculer le prix TTC à partir du prix HT et de la TVA
    const calculerPrixTTC = () => {
        if (!dto.prixUnitaireHT || !dto.tauxTVA) return "";
        const prixTTC = Number(dto.prixUnitaireHT) * (1 + Number(dto.tauxTVA) / 100);
        return prixTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    };
    
    // Calculer le prix avec majoration
    const calculerPrixMajore = (majoration) => {
        if (!dto.prixUnitaireHT || majoration === undefined) return "";
        const prixMajore = Number(dto.prixUnitaireHT) * (1 + Number(majoration) / 100);
        return prixMajore.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    };    const handleSubmit = e => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        // Vérification préalable des données
        if (isNaN(dto.prixUnitaireHT) || dto.prixUnitaireHT <= 0) {
            setError("Le prix unitaire HT doit être un nombre positif");
            setLoading(false);
            return;
        }
        
        const payload = {
            typeMission:     dto.typeMission,
            prixUnitaireHT:  Number(dto.prixUnitaireHT),
            majorationNuit:  Number(dto.majorationNuit) || 0,
            majorationWeekend:Number(dto.majorationWeekend) || 0,
            majorationDimanche:Number(dto.majorationDimanche) || 0,
            majorationFerie: Number(dto.majorationFerie) || 0,
            tauxTVA:         Number(dto.tauxTVA) || 20,
            missionIds:      selectedMissions || []
        };
        
        console.log("Payload envoyé au backend:", payload);
        
        const call = isEdit
            ? TarifMissionService.update(id, payload)
            : TarifMissionService.create(payload);
            
        call
            .then(() => {
                navigate("/tarifs");
            })            .catch(err => {
                console.error("Erreur détaillée:", err);
                // Vérifier si la réponse d'erreur est un objet et extraire un message convivial
                let errorMessage = "Erreur lors de l'enregistrement du tarif";
                
                if (err.response) {
                    if (typeof err.response.data === 'object') {
                        // Traitement spécial pour les erreurs d'enum TypeMission
                        if (err.response.data.message && err.response.data.message.includes("TypeMission")) {
                            errorMessage = "Type de mission invalide. Veuillez en sélectionner un dans la liste déroulante.";
                        } 
                        // Traitement pour les autres erreurs de validation
                        else if (err.response.data.message) {
                            errorMessage = err.response.data.message;
                            // Rendre le message plus convivial
                            errorMessage = errorMessage
                                .replace(/JSON parse error: /g, "")
                                .replace(/Cannot deserialize value of type/g, "Impossible de traiter la valeur");
                        } else {
                            // Fallback pour les autres erreurs
                            errorMessage = JSON.stringify(err.response.data);
                        }
                    } else if (err.response.data) {
                        errorMessage = String(err.response.data);
                    }
                    console.log("Message d'erreur formatté:", errorMessage);
                }
                
                setError(errorMessage);
                setLoading(false);
            });
    };    return (
        <Container fluid className="py-4">
            <Card className="shadow border-0">
                <Card.Header className="bg-primary bg-gradient text-white py-3">
                    <h4 className="mb-0">
                        <FontAwesomeIcon icon={faEuroSign} className="me-2" />
                        {isEdit ? "Modifier" : "Créer"} un tarif de mission
                    </h4>
                </Card.Header>
                
                <Card.Body className="p-4">
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            <FontAwesomeIcon icon={faMinus} className="me-2" />
                            {error}
                        </Alert>
                    )}
                    
                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">Chargement en cours...</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6} className="mb-4">
                                    <Card className="h-100 shadow-sm">
                                        <Card.Header className="bg-light">
                                            <h5 className="mb-0">Informations de base</h5>
                                        </Card.Header>
                                        
                                        <Card.Body>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Type de mission *</Form.Label>
                                                <Form.Select 
                                                    name="typeMission" 
                                                    value={dto.typeMission} 
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    {TYPE_MISSIONS.map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Prix unitaire HT *</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        name="prixUnitaireHT"
                                                        type="number" 
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={dto.prixUnitaireHT}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <InputGroup.Text>€</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Label>Taux de TVA * (%)</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        name="tauxTVA"
                                                        type="number" 
                                                        step="0.01"
                                                        placeholder="20.00"
                                                        value={dto.tauxTVA}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                    <InputGroup.Text>%</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                            
                                            <div className="bg-light p-3 rounded mt-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>Prix TTC:</span>
                                                    <Badge bg="success" className="fs-6 p-2">
                                                        {calculerPrixTTC()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                
                                <Col md={6} className="mb-4">
                                    <Card className="h-100 shadow-sm">
                                        <Card.Header className="bg-light">
                                            <h5 className="mb-0">Majorations</h5>
                                        </Card.Header>
                                        
                                        <Card.Body>
                                            <Row>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            <FontAwesomeIcon icon={faMoon} className="me-1" />
                                                            Majoration nuit (%)
                                                        </Form.Label>
                                                        <InputGroup>
                                                            <Form.Control
                                                                name="majorationNuit"
                                                                type="number" 
                                                                step="0.01"
                                                                placeholder="0"
                                                                value={dto.majorationNuit}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                        <Form.Text muted>
                                                            {Number(dto.majorationNuit) > 0 && 
                                                            `Prix avec majoration: ${calculerPrixMajore(dto.majorationNuit)}`}
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            <FontAwesomeIcon icon={faCalendarWeek} className="me-1" />
                                                            Majoration weekend (%)
                                                        </Form.Label>
                                                        <InputGroup>
                                                            <Form.Control
                                                                name="majorationWeekend"
                                                                type="number" 
                                                                step="0.01"
                                                                placeholder="0"
                                                                value={dto.majorationWeekend}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                        <Form.Text muted>
                                                            {Number(dto.majorationWeekend) > 0 && 
                                                            `Prix avec majoration: ${calculerPrixMajore(dto.majorationWeekend)}`}
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            <FontAwesomeIcon icon={faCalendarDay} className="me-1" />
                                                            Majoration dimanche (%)
                                                        </Form.Label>
                                                        <InputGroup>
                                                            <Form.Control
                                                                name="majorationDimanche"
                                                                type="number" 
                                                                step="0.01"
                                                                placeholder="0"
                                                                value={dto.majorationDimanche}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                        <Form.Text muted>
                                                            {Number(dto.majorationDimanche) > 0 && 
                                                            `Prix avec majoration: ${calculerPrixMajore(dto.majorationDimanche)}`}
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>
                                                            <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                                                            Majoration férié (%)
                                                        </Form.Label>
                                                        <InputGroup>
                                                            <Form.Control
                                                                name="majorationFerie"
                                                                type="number" 
                                                                step="0.01"
                                                                placeholder="0"
                                                                value={dto.majorationFerie}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                        <Form.Text muted>
                                                            {Number(dto.majorationFerie) > 0 && 
                                                            `Prix avec majoration: ${calculerPrixMajore(dto.majorationFerie)}`}
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            
                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Card className="shadow-sm">
                                        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">
                                                <FontAwesomeIcon icon={faList} className="me-2" />
                                                Missions associées
                                            </h5>
                                            <Badge bg="info">
                                                {selectedMissions.length} sélectionnée(s)
                                            </Badge>
                                        </Card.Header>
                                        
                                        <Card.Body>
                                            {missionsLoading ? (
                                                <div className="text-center my-3">
                                                    <Spinner animation="border" size="sm" />
                                                    <span className="ms-2">Chargement des missions...</span>
                                                </div>
                                            ) : allMissions.length === 0 ? (
                                                <Alert variant="info">
                                                    Aucune mission disponible
                                                </Alert>
                                            ) : (                                                <div className="missions-container">
                                                    <ListGroup>
                                                        {allMissions.map(mission => (
                                                            <ListGroup.Item 
                                                                key={mission.id}
                                                                className="d-flex justify-content-between align-items-center"
                                                                action
                                                                active={selectedMissions.includes(mission.id)}
                                                                onClick={() => toggleMissionSelection(mission.id)}
                                                            >
                                                                <div>
                                                                    <strong>Mission #{mission.id}</strong>: {mission.titre || mission.typeMission}
                                                                </div>
                                                                <Badge 
                                                                    bg={selectedMissions.includes(mission.id) ? "primary" : "secondary"}
                                                                >
                                                                    {selectedMissions.includes(mission.id) ? "Sélectionnée" : "Non sélectionnée"}
                                                                </Badge>
                                                            </ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                </div>
                                            )}
                                            <Form.Text muted className="mt-2">
                                                Cliquez sur une mission pour l'associer ou la dissocier de ce tarif.
                                            </Form.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            
                            <div className="d-flex justify-content-between mt-4">
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => navigate("/tarifs")}
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                    Retour à la liste
                                </Button>
                                
                                <Button 
                                    variant="primary" 
                                    type="submit"
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    {isEdit ? "Mettre à jour" : "Créer"} le tarif
                                </Button>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}
