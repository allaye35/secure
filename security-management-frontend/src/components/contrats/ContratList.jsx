// src/components/contrats/ContratList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ContratService from "../../services/ContratService";
import DevisService from "../../services/DevisService";
import MissionService from "../../services/MissionService";
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Spinner, Alert, Tooltip, OverlayTrigger, Dropdown, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faPlus, faEye, faPencilAlt, faTrash, faFileSignature, faClipboardCheck, faTasks, faList, faClipboardList, faListCheck, faCalendarCheck, faInfoCircle, faExclamationTriangle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function ContratList() {    
    // Style global pour garantir que les tooltips s'affichent au premier plan
    useEffect(() => {
        // Ajouter un style global pour les tooltips
        const style = document.createElement('style');
        style.innerHTML = `
            .tooltip {
                z-index: 9999 !important;
            }
            .btn, .btn-group {
                z-index: 5 !important;
                position: relative;
            }
        `;
        document.head.appendChild(style);
        
        // Nettoyer le style lors du démontage du composant
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    // États principaux
    const [contrats, setContrats] = useState([]);
    const [devisMap, setDevisMap] = useState({});
    const [missionsMap, setMissionsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredContrats, setFilteredContrats] = useState([]);
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [showMissionsModal, setShowMissionsModal] = useState(false);
    
    // États pour filtrage et recherche
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        dureeMin: "",
        dureeMax: "",
        dateMin: "",
        dateMax: "",
        avecMissions: ""
    });
    const [showFilters, setShowFilters] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        // Chargement des données
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Charger tous les contrats
                const contratsResponse = await ContratService.getAll();
                const list = contratsResponse.data;
                setContrats(list);
                setFilteredContrats(list);
                
                // Extraire tous les devisId et charger leurs détails
                const devisIds = Array.from(
                    new Set(list.map(c => c.devisId).filter(Boolean))
                );
                
                // Chargement parallèle des devis
                const devisResults = await Promise.all(devisIds.map(id =>
                    DevisService.getById(id)
                        .then(r => ({ id, dto: r.data }))
                        .catch(() => null)
                ));
                
                const devisMapData = {};
                devisResults.forEach(r => { if (r) devisMapData[r.id] = r.dto; });
                setDevisMap(devisMapData);
                
                // Chargement parallèle des missions pour chaque contrat
                const missionsResults = await Promise.all(list.map(c =>
                    MissionService.getByContratId(c.id)
                        .then(r => ({ contratId: c.id, missions: r.data }))
                        .catch(() => ({ contratId: c.id, missions: [] }))
                ));
                
                const missionsMapData = {};
                missionsResults.forEach(r => { missionsMapData[r.contratId] = r.missions; });
                setMissionsMap(missionsMapData);
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger les contrats. Veuillez réessayer ultérieurement.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    // Application des filtres lorsqu'ils changent
    useEffect(() => {
        applyFilters();
    }, [searchTerm, filters, contrats]);
    
    const applyFilters = () => {
        let results = [...contrats];
        
        // Filtrage par terme de recherche (référence ou autres infos)
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            results = results.filter(contrat => 
                (contrat.referenceContrat && contrat.referenceContrat.toLowerCase().includes(term)) ||
                (devisMap[contrat.devisId]?.referenceDevis && 
                 devisMap[contrat.devisId].referenceDevis.toLowerCase().includes(term))
            );
        }
        
        // Filtrage par durée minimum
        if (filters.dureeMin) {
            results = results.filter(contrat => 
                contrat.dureeMois && parseInt(contrat.dureeMois) >= parseInt(filters.dureeMin)
            );
        }
        
        // Filtrage par durée maximum
        if (filters.dureeMax) {
            results = results.filter(contrat => 
                contrat.dureeMois && parseInt(contrat.dureeMois) <= parseInt(filters.dureeMax)
            );
        }
        
        // Filtrage par date minimum
        if (filters.dateMin) {
            const dateMin = new Date(filters.dateMin);
            results = results.filter(contrat => 
                contrat.dateSignature && new Date(contrat.dateSignature) >= dateMin
            );
        }
        
        // Filtrage par date maximum
        if (filters.dateMax) {
            const dateMax = new Date(filters.dateMax);
            results = results.filter(contrat => 
                contrat.dateSignature && new Date(contrat.dateSignature) <= dateMax
            );
        }
        
        // Filtrage par présence de missions
        if (filters.avecMissions === "avec") {
            results = results.filter(contrat => 
                (missionsMap[contrat.id] && missionsMap[contrat.id].length > 0)
            );
        } else if (filters.avecMissions === "sans") {
            results = results.filter(contrat => 
                !missionsMap[contrat.id] || missionsMap[contrat.id].length === 0
            );
        }
        
        setFilteredContrats(results);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            dureeMin: "",
            dureeMax: "",
            dateMin: "",
            dateMax: "",
            avecMissions: ""
        });
        setSearchTerm("");
        setFilteredContrats(contrats);
    };

    const handleDelete = id => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.")) {
            ContratService.remove(id)
                .then(() => {
                    setContrats(prevContrats => prevContrats.filter(c => c.id !== id));
                    setFilteredContrats(prevFiltered => prevFiltered.filter(c => c.id !== id));
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression:", err);
                    setError("Impossible de supprimer le contrat. Veuillez réessayer.");
                });
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };      const getMissionBadge = (contratId) => {
        const missions = missionsMap[contratId] || [];
        
        if (missions.length === 0) {
            return (
                <Badge bg="secondary" className="d-flex align-items-center" style={{ cursor: 'default', position: 'relative', zIndex: 1 }}>
                    <FontAwesomeIcon icon={faClipboardList} className="me-1" />
                    Aucune mission
                </Badge>
            );
        } 
        
        return (
            <Button 
                variant={missions.length === 1 ? "info" : "primary"} 
                size="sm" 
                onClick={() => handleShowMissions(contratId)}
                className="d-flex align-items-center shadow-sm"
                style={{ position: 'relative', zIndex: 1, minWidth: '110px' }}
            >
                <FontAwesomeIcon icon={missions.length === 1 ? faListCheck : faClipboardList} className="me-1" />
                {missions.length} mission{missions.length > 1 ? "s" : ""}
            </Button>
        );
    };
    
    const handleShowMissions = (contratId) => {
        setSelectedContrat(contrats.find(c => c.id === contratId));
        setShowMissionsModal(true);
    };

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="h4 mb-0">
                                <FontAwesomeIcon icon={faFileSignature} className="me-2" />
                                Contrats
                            </h2>
                        </Col>
                        <Col xs="auto">
                            <Button variant="light" onClick={() => navigate("/contrats/create")}>
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Nouveau contrat
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6} lg={4}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Rechercher un contrat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button variant="outline-secondary">
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col>
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowFilters(!showFilters)}
                                className="ms-2"
                            >
                                <FontAwesomeIcon icon={faFilter} className="me-2" />
                                {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
                            </Button>
                            {showFilters && (
                                <Button 
                                    variant="outline-danger" 
                                    onClick={resetFilters}
                                    className="ms-2"
                                    size="sm"
                                >
                                    Réinitialiser les filtres
                                </Button>
                            )}
                        </Col>
                    </Row>
                    
                    {showFilters && (
                        <Card className="mb-4 border bg-light">
                            <Card.Body>
                                <Row>
                                    <Col md={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Durée minimum (mois)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="dureeMin"
                                                value={filters.dureeMin}
                                                onChange={handleFilterChange}
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Durée maximum (mois)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="dureeMax"
                                                value={filters.dureeMax}
                                                onChange={handleFilterChange}
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Date signature (début)</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dateMin"
                                                value={filters.dateMin}
                                                onChange={handleFilterChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Date signature (fin)</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dateMax"
                                                value={filters.dateMax}
                                                onChange={handleFilterChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={3} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Missions</Form.Label>
                                            <Form.Select
                                                name="avecMissions"
                                                value={filters.avecMissions}
                                                onChange={handleFilterChange}
                                            >
                                                <option value="">Tous les contrats</option>
                                                <option value="avec">Avec missions</option>
                                                <option value="sans">Sans mission</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Chargement des contrats...</p>
                        </div>
                    ) : (
                        <>                            <div className="table-responsive">
                                <Table hover striped className="align-middle" style={{ tableLayout: 'fixed' }}>
                                    <thead className="table-light">                                        <tr>
                                            <th className="text-center" style={{width: '50px'}}>ID</th>
                                            <th style={{width: '15%'}}>Référence</th>
                                            <th style={{width: '12%'}}>Date signature</th>
                                            <th style={{width: '8%'}}>Durée</th>
                                            <th style={{width: '12%'}}>Devis (réf.)</th>
                                            <th style={{width: '25%'}}>
                                                <div className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faCalendarCheck} className="me-1 text-primary" />
                                                    1ère Mission
                                                </div>
                                            </th>                                            <th className="text-center" style={{width: '10%'}}>
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <FontAwesomeIcon icon={faClipboardList} className="me-1 text-primary" />
                                                    Missions
                                                </div>
                                            </th>
                                            <th className="text-center" style={{width: '120px', position: 'relative', overflow: 'visible'}}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredContrats.map(c => {
                                            const devis = devisMap[c.devisId];
                                            const missions = missionsMap[c.id] || [];
                                            return (
                                                <tr key={c.id}>
                                                    <td className="text-center">{c.id}</td>                                                    <td>
                                                        <Link to={`/contrats/${c.id}`} className="text-decoration-none">
                                                            <strong>{c.referenceContrat}</strong>
                                                        </Link>
                                                    </td>
                                                    <td>{formatDate(c.dateSignature)}</td>
                                                    <td>{c.dureeMois || "—"} mois</td>
                                                    <td>
                                                        {devis ? (
                                                            <Link to={`/devis/${c.devisId}`}>
                                                                {devis.referenceDevis}
                                                            </Link>
                                                        ) : "—"}
                                                    </td>                                                    <td style={{ position: 'relative', zIndex: 1 }}>
                                                        {missions[0] ? (
                                                            <Link to={`/missions/${missions[0].id}`} className="d-flex align-items-center text-decoration-none">
                                                                <Badge bg="light" text="dark" className="me-2 p-2 border">
                                                                    <FontAwesomeIcon icon={faTasks} className="text-primary" />
                                                                </Badge>
                                                                <div>
                                                                    <div className="fw-bold">{missions[0].titreMission}</div>
                                                                    <small className="text-muted">
                                                                        {missions[0].dateDebut && new Date(missions[0].dateDebut).toLocaleDateString()}
                                                                    </small>
                                                                </div>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-muted d-flex align-items-center">
                                                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-secondary" />
                                                                Aucune mission
                                                            </span>
                                                        )}
                                                    </td>                                                    <td>
                                                        <div className="d-flex justify-content-center" style={{ position: 'relative', zIndex: 1 }}>
                                                            {getMissionBadge(c.id)}
                                                        </div>
                                                    </td><td className="text-center" style={{ position: 'relative', overflow: 'visible', zIndex: 5 }}>                                                        <div className="d-flex justify-content-center gap-2 position-relative" style={{ zIndex: 10 }}>
                                                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${c.id}`}>Voir détails</Tooltip>}>
                                                                <Button variant="info" size="sm" className="text-white shadow-sm" 
                                                                    style={{ minWidth: '32px', height: '32px', position: 'relative', zIndex: 10 }}
                                                                    onClick={() => navigate(`/contrats/${c.id}`)}>
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </Button>
                                                            </OverlayTrigger>
                                                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-edit-${c.id}`}>Modifier</Tooltip>}>
                                                                <Button variant="warning" size="sm" className="shadow-sm"
                                                                    style={{ minWidth: '32px', height: '32px', position: 'relative', zIndex: 10 }}
                                                                    onClick={() => navigate(`/contrats/edit/${c.id}`)}>
                                                                    <FontAwesomeIcon icon={faPencilAlt} />
                                                                </Button>
                                                            </OverlayTrigger>
                                                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-delete-${c.id}`}>Supprimer</Tooltip>}>
                                                                <Button variant="danger" size="sm" className="shadow-sm"
                                                                    style={{ minWidth: '32px', height: '32px', position: 'relative', zIndex: 10 }}
                                                                    onClick={() => handleDelete(c.id)}>
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </Button>
                                                            </OverlayTrigger>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                            
                            {filteredContrats.length === 0 && (
                                <div className="text-center py-4 bg-light rounded">
                                    <p className="text-muted mb-0">
                                        {contrats.length === 0 ? 
                                            "Aucun contrat n'a été trouvé." : 
                                            "Aucun contrat ne correspond à vos critères de recherche."
                                        }
                                    </p>
                                </div>
                            )}
                            
                            <div className="mt-3 text-end">
                                <small className="text-muted">
                                    {filteredContrats.length} contrat(s) sur {contrats.length} au total
                                </small>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
            
            {/* Modal pour afficher les missions d'un contrat */}
            <Modal show={showMissionsModal} onHide={() => setShowMissionsModal(false)} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                        Missions du contrat {selectedContrat?.referenceContrat}
                    </Modal.Title>
                </Modal.Header>                <Modal.Body>
                    {selectedContrat && (
                        <>
                            <div className="mb-3">
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <h6>Référence du contrat</h6>
                                        <p className="fw-bold">{selectedContrat.referenceContrat}</p>
                                    </Col>
                                    <Col md={3}>
                                        <h6>Date de signature</h6>
                                        <p>{formatDate(selectedContrat.dateSignature)}</p>
                                    </Col>
                                    <Col md={3}>
                                        <h6>Durée</h6>
                                        <p>{selectedContrat.dureeMois || "—"} mois</p>
                                    </Col>
                                </Row>
                                
                                <hr className="my-3" />
                                
                                <h5 className="mb-3 d-flex align-items-center">
                                    <FontAwesomeIcon icon={faTasks} className="me-2 text-primary" />
                                    Liste des missions 
                                    <Badge bg="primary" pill className="ms-2">
                                        {missionsMap[selectedContrat.id]?.length || 0}
                                    </Badge>
                                </h5>
                                  {missionsMap[selectedContrat.id] && missionsMap[selectedContrat.id].length > 0 ? (                                    <div className="table-responsive">
                                        <Table hover bordered striped className="align-middle shadow-sm" style={{ tableLayout: 'fixed' }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="text-center" style={{width: '50px'}}>ID</th>
                                                    <th>Titre</th>
                                                    <th>Date de début</th>
                                                    <th>Date de fin</th>
                                                    <th className="text-center">Statut</th>
                                                    <th className="text-center" style={{width: '120px', position: 'relative', overflow: 'visible'}}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {missionsMap[selectedContrat.id].map(mission => (
                                                    <tr key={mission.id}>
                                                        <td className="text-center">{mission.id}</td>                                                        <td className="fw-bold">
                                                            <div className="d-flex align-items-center" style={{ position: 'relative', zIndex: 1 }}>
                                                                <Badge bg="light" text="dark" className="me-2 p-2 border">
                                                                    <FontAwesomeIcon icon={faTasks} className="text-primary" />
                                                                </Badge>
                                                                {mission.titreMission}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <FontAwesomeIcon icon={faCalendarCheck} className="text-success me-2" />
                                                                {mission.dateDebut ? formatDate(mission.dateDebut) : "—"}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <FontAwesomeIcon icon={faCalendarCheck} className="text-danger me-2" />
                                                                {mission.dateFin ? formatDate(mission.dateFin) : "—"}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center">
                                                                <Badge bg={mission.statut === "EN_COURS" ? "success" : 
                                                                    mission.statut === "PLANIFIEE" ? "info" : 
                                                                    mission.statut === "TERMINEE" ? "secondary" : "warning"}
                                                                    className="px-3 py-2 d-flex align-items-center"
                                                                    style={{ width: 'fit-content' }}
                                                                >
                                                                    <FontAwesomeIcon icon={
                                                                        mission.statut === "EN_COURS" ? faClipboardCheck : 
                                                                        mission.statut === "PLANIFIEE" ? faCalendarCheck : 
                                                                        mission.statut === "TERMINEE" ? faCheckCircle : faInfoCircle
                                                                    } className="me-2" />
                                                                    {mission.statut?.replace(/_/g, " ") || "Non défini"}
                                                                </Badge>
                                                            </div>
                                                        </td>                                                        <td>                                                            <div className="d-flex justify-content-center gap-1 position-relative" style={{ zIndex: 10 }}>
                                                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-mission-${mission.id}`}>Voir détails</Tooltip>}>
                                                                    <Link to={`/missions/${mission.id}`} style={{ position: 'relative', zIndex: 10 }}>
                                                                        <Button size="sm" variant="outline-primary" className="shadow-sm"
                                                                               style={{ minWidth: '32px', height: '32px', position: 'relative', zIndex: 10 }}>
                                                                            <FontAwesomeIcon icon={faEye} />
                                                                        </Button>
                                                                    </Link>
                                                                </OverlayTrigger>
                                                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-edit-mission-${mission.id}`}>Modifier</Tooltip>}>
                                                                    <Link to={`/missions/edit/${mission.id}`} style={{ position: 'relative', zIndex: 10 }}>
                                                                        <Button size="sm" variant="outline-warning" className="shadow-sm"
                                                                               style={{ minWidth: '32px', height: '32px', position: 'relative', zIndex: 10 }}>
                                                                            <FontAwesomeIcon icon={faPencilAlt} />
                                                                        </Button>
                                                                    </Link>
                                                                </OverlayTrigger>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <Alert variant="warning">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                        Aucune mission n'est associée à ce contrat.
                                    </Alert>
                                )}
                            </div>
                            
                            <div className="d-flex justify-content-between mt-3">
                                <Button variant="outline-secondary" onClick={() => setShowMissionsModal(false)}>
                                    Fermer
                                </Button>
                                <Link to={`/missions/create?contratId=${selectedContrat.id}`}>
                                    <Button variant="success">
                                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Ajouter une mission
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
}
