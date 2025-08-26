// src/components/missions/MissionList.jsx
import React, { useEffect, useState } from "react";
// Fonction utilitaire pour confirmation et appel d'action
function askAndCall(message, action, ...args) {
  if (window.confirm(`Voulez-vous vraiment ${message} ?`)) {
    action(...args);
  }
}
import { useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import SiteService from "../../services/SiteService";
import ContratService from "../../services/ContratService";
import DevisService from "../../services/DevisService";
import AgentService from "../../services/AgentService";
import "../../styles/MissionList.css";
import { Table, Button, Badge, Card, Container, Row, Col, Dropdown, Form, InputGroup, Modal } from 'react-bootstrap';
import FactureService from '../../services/FactureService';
import AssocierFactureModal from './AssocierFactureModal';

export default function MissionList() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [siteNames, setSiteNames] = useState({});
  // Pour associer facture
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [allFactures, setAllFactures] = useState([]);
  const [selectedFactureMissionId, setSelectedFactureMissionId] = useState(null);
  const [contratNames, setContratNames] = useState({});
  const [devisNames, setDevisNames] = useState({});
  const [allSites, setAllSites] = useState([]);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  // Pour agents
  const [allAgents, setAllAgents] = useState([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);
    // Modal pour retirer agent(s)
    const [showRetirerAgentModal, setShowRetirerAgentModal] = useState(false);
    const [agentsMission, setAgentsMission] = useState([]);
    const [selectedRetirerAgentIds, setSelectedRetirerAgentIds] = useState([]);
  const missionsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    MissionService.getAllMissions()
      .then(({ data }) => {
        let missionsList = [];
        if (Array.isArray(data)) missionsList = data;
        else if (data && Array.isArray(data.content)) missionsList = data.content;
        else {
          setError("Format de données inattendu reçu du serveur.");
          return;
        }
        setMissions(missionsList);
        setFilteredMissions(missionsList);

        // Sites
        const siteIds = [...new Set(missionsList.map(m => m.siteId).filter(Boolean))];
        siteIds.forEach(siteId => {
          if (!siteNames[siteId]) {
            SiteService.getSiteById(siteId)
              .then(res => setSiteNames(prev => ({ ...prev, [siteId]: res.data.nom || res.data.name || `Site #${siteId}` })))
              .catch(() => setSiteNames(prev => ({ ...prev, [siteId]: `Site #${siteId}` })));
          }
        });

        // Contrats
        const contratIds = [...new Set(missionsList.map(m => m.contratId || (m.contrat && m.contrat.id)).filter(Boolean))];
        contratIds.forEach(contratId => {
          if (!contratNames[contratId]) {
            ContratService.getById(contratId)
              .then(res => setContratNames(prev => ({ ...prev, [contratId]: res.data.referenceContrat || res.data.nom || `Contrat #${contratId}` })))
              .catch(() => setContratNames(prev => ({ ...prev, [contratId]: `Contrat #${contratId}` })));
          }
        });

        // Devis
        const devisIds = [...new Set(missionsList.map(m => m.devisId || (m.devis && m.devis.id)).filter(Boolean))];
        devisIds.forEach(devisId => {
          if (!devisNames[devisId]) {
            DevisService.getById(devisId)
              .then(res => setDevisNames(prev => ({ ...prev, [devisId]: res.data.referenceDevis || res.data.nom || `Devis #${devisId}` })))
              .catch(() => setDevisNames(prev => ({ ...prev, [devisId]: `Devis #${devisId}` })));
          }
        });
      })
      .catch((error) => {
        if (error.response) setError(`Erreur ${error.response.status}: ${error.response.data?.message || "Erreur du serveur"}`);
        else if (error.request) setError("Erreur de connexion au serveur. Vérifiez que le backend est démarré.");
        else setError("Erreur lors du chargement des missions.");
      })
      .finally(() => setLoading(false));

    // Charger tous les sites pour le sélecteur
    SiteService.getAllSites && SiteService.getAllSites()
      .then(res => {
        if (Array.isArray(res.data)) setAllSites(res.data);
        else if (res.data && Array.isArray(res.data.content)) setAllSites(res.data.content);
      })
      .catch(() => setAllSites([]));

    // Charger tous les agents pour le sélecteur
    AgentService.getAllAgents && AgentService.getAllAgents()
      .then(res => {
        if (Array.isArray(res.data)) setAllAgents(res.data);
        else if (res.data && Array.isArray(res.data.content)) setAllAgents(res.data.content);
      })
      .catch(() => setAllAgents([]));

    // Charger toutes les factures pour le sélecteur
    FactureService.getAll()
      .then(res => {
        if (Array.isArray(res.data)) setAllFactures(res.data);
        else if (res.data && Array.isArray(res.data.content)) setAllFactures(res.data.content);
      })
      .catch(() => setAllFactures([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const results = missions.filter(mission =>
      (mission.titre && mission.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mission.description && mission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mission.statutMission && mission.statutMission.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mission.typeMission && mission.typeMission.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMissions(results);
    setCurrentPage(1);
  }, [searchTerm, missions]);

  const formatDate = d => d ? new Date(d).toLocaleDateString() : "-";
  const formatTime = t => t ? t.slice(0, 5) : "-";

  const handleDelete = id => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    MissionService.deleteMission(id)
      .then(() => {
        setMissions(ms => ms.filter(m => m.id !== id));
        setFilteredMissions(ms => ms.filter(m => m.id !== id));
      })
      .catch(() => alert("Échec de la suppression."));
  };

  // Modal pour associer un site
  const handleShowSiteModal = (missionId) => {
    setSelectedMissionId(missionId);
    setSelectedSiteId("");
    setShowSiteModal(true);
  };

  const handleSiteModalClose = () => {
    setShowSiteModal(false);
    setSelectedMissionId(null);
    setSelectedSiteId("");
  };

  const handleSiteModalSubmit = () => {
    if (!selectedSiteId || !selectedMissionId) return;
    MissionService.assignSite(selectedMissionId, selectedSiteId)
      .then(() => {
        alert("Site associé !");
        MissionService.getAllMissions().then(({ data }) => {
          if (Array.isArray(data)) {
            setMissions(data);
            setFilteredMissions(data.filter(mission =>
              (mission.titre && mission.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.description && mission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.statutMission && mission.statutMission?.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.typeMission && mission.typeMission?.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
          }
        });
        handleSiteModalClose();
      })
      .catch(e => alert("Erreur : " + (e.response?.data?.message || e.message)));
  };

  // Modal pour affecter agent(s)
  const handleShowAgentModal = (missionId) => {
    setSelectedMissionId(missionId);
    setSelectedAgentIds([]);
    setShowAgentModal(true);
  };

    // Modal pour retirer agent(s)
    const handleShowRetirerAgentModal = (missionId) => {
      setSelectedMissionId(missionId);
      setSelectedRetirerAgentIds([]);
      MissionService.getMissionById(missionId)
        .then(async res => {
          const data = res.data;
          // Si agents est un tableau d'objets
          if (data && Array.isArray(data.agents) && data.agents.length > 0 && typeof data.agents[0] === 'object') {
            setAgentsMission(data.agents);
          }
          // Si agentIds est un tableau d'IDs
          else if (data && Array.isArray(data.agentIds) && data.agentIds.length > 0) {
            // Hydrate les agents
            const agentsDetails = await Promise.all(
              data.agentIds.map(id =>
                window.AgentService && AgentService.getAgentById
                  ? AgentService.getAgentById(id).then(r => r.data).catch(() => null)
                  : Promise.resolve({ id })
              )
            );
            setAgentsMission(agentsDetails.filter(a => !!a));
          } else {
            setAgentsMission([]);
          }
        })
        .catch(() => setAgentsMission([]));
      setShowRetirerAgentModal(true);
    };

    const handleRetirerAgentModalClose = () => {
      setShowRetirerAgentModal(false);
      setSelectedMissionId(null);
      setSelectedRetirerAgentIds([]);
      setAgentsMission([]);
    };

    const handleRetirerAgentModalSubmit = async () => {
      if (!selectedMissionId || selectedRetirerAgentIds.length === 0) return;
      try {
        for (const agentId of selectedRetirerAgentIds) {
          await MissionService.retirerAgent(selectedMissionId, agentId);
        }
        alert('Agent(s) retiré(s) !');
        MissionService.getAllMissions().then(({ data }) => {
          if (Array.isArray(data)) {
            setMissions(data);
            setFilteredMissions(data.filter(mission =>
              (mission.titre && mission.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.description && mission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.statutMission && mission.statutMission?.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.typeMission && mission.typeMission?.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
          }
        });
        handleRetirerAgentModalClose();
      } catch (e) {
        alert('Erreur : ' + (e.response?.data?.message || e.message));
      }
    };

  const handleAgentModalClose = () => {
    setShowAgentModal(false);
    setSelectedMissionId(null);
    setSelectedAgentIds([]);
  };

  const handleAgentModalSubmit = () => {
    if (!selectedMissionId || selectedAgentIds.length === 0) return;
    MissionService.assignAgents(selectedMissionId, selectedAgentIds)
      .then(() => {
        alert("Agent(s) affecté(s) !");
        MissionService.getAllMissions().then(({ data }) => {
          if (Array.isArray(data)) {
            setMissions(data);
            setFilteredMissions(data.filter(mission =>
              (mission.titre && mission.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.description && mission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.statutMission && mission.statutMission?.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.typeMission && mission.typeMission?.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
          }
        });
        handleAgentModalClose();
      })
      .catch(e => alert("Erreur : " + (e.response?.data?.message || e.message)));
  };

  // Modal pour associer facture(s)
  const handleShowFactureModal = (missionId) => {
    setSelectedFactureMissionId(missionId);
    setShowFactureModal(true);
  };

  const handleFactureModalClose = () => {
    setShowFactureModal(false);
    setSelectedFactureMissionId(null);
  };

  const handleFactureModalSubmit = () => {
    if (!selectedFactureMissionId) return;
    // Logique pour associer la facture à la mission
    alert("Facture associée !");
    handleFactureModalClose();
  };

  const STATUT_META = {
    PLANIFIEE: { label: 'Planifiée', color: 'info' },
    EN_ATTENTE_DE_VALIDATION_DEVIS: { label: 'En attente validation devis', color: 'secondary' },
    EN_COURS: { label: 'En cours', color: 'primary' },
    TERMINEE: { label: 'Terminée', color: 'success' },
    ANNULEE: { label: 'Annulée', color: 'danger' }
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Non défini</Badge>;
    const meta = STATUT_META[status];
    if (!meta) return <Badge bg="secondary">{status}</Badge>;
    return <Badge bg={meta.color}>{meta.label}</Badge>;
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredMissions].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredMissions(sortedData);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  // Pagination
  const indexOfLastMission = currentPage * missionsPerPage;
  const indexOfFirstMission = indexOfLastMission - missionsPerPage;
  const currentMissions = filteredMissions.slice(indexOfFirstMission, indexOfLastMission);
  const totalPages = Math.ceil(filteredMissions.length / missionsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container fluid className="mission-list mt-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col><h2 className="mb-0">Liste des missions</h2></Col>
            <Col xs="auto">
              <Button variant="light" onClick={() => navigate("/missions/create")}>
                <i className="bi bi-plus-circle"></i> Nouvelle mission
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher une mission..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover bordered striped className="tbl-missions">
              <thead className="table-light">
                <tr>
                  <th onClick={() => requestSort('id')}>№</th>
                  <th onClick={() => requestSort('titre')}>Titre</th>
                  <th onClick={() => requestSort('dateDebut')}>Période</th>
                  <th onClick={() => requestSort('statutMission')}>Statut</th>
                  <th onClick={() => requestSort('typeMission')}>Type</th>
                  <th onClick={() => requestSort('nombreAgents')}>Agents</th>
                  <th onClick={() => requestSort('montantHT')}>Montant HT</th>
                  <th onClick={() => requestSort('site')}>Site</th>
                  <th>Contrat/Devis</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMissions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">Aucune mission trouvée</td>
                  </tr>
                ) : currentMissions.filter(m => m.id).map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>
                      <div className="fw-bold cell-truncate" title={m.titre}>{m.titre}</div>
                      <div className="text-muted small cell-truncate" title={m.description}>
                        {m.description}
                      </div>
                    </td>
                    <td>
                      <div>{formatDate(m.dateDebut)} {formatTime(m.heureDebut)}</div>
                      <div className="text-muted small">à {formatDate(m.dateFin)} {formatTime(m.heureFin)}</div>
                    </td>
                    <td>{getStatusBadge(m.statutMission)}</td>
                    <td><Badge bg="info">{m.typeMission || 'Non défini'}</Badge></td>
                    <td className="text-center">{m.nombreAgents || '0'}</td>
                    <td className="fw-bold text-end">{m.montantHT ? `${m.montantHT.toFixed(2)} €` : '-'}</td>
                    <td>{m.siteId ? (siteNames[m.siteId] || <span className="text-muted">Chargement...</span>) : '-'}</td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0, maxWidth: 180 }}>
                        {(m.contratId || (m.contrat && m.contrat.id)) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', minWidth: 0 }}>
                            <Badge bg="secondary" style={{ whiteSpace: 'nowrap', marginRight: 4 }}>Contrat:</Badge>
                            <span
                              style={{
                                wordBreak: 'break-all',
                                minWidth: 0,
                                maxWidth: 120,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block',
                                verticalAlign: 'bottom',
                                cursor: 'pointer'
                              }}
                              title={contratNames[m.contratId || (m.contrat && m.contrat.id)]}
                            >
                              {contratNames[m.contratId || (m.contrat && m.contrat.id)] || <span className="text-muted">Chargement...</span>}
                            </span>
                          </div>
                        )}

                        {(m.devisId || (m.devis && m.devis.id)) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', minWidth: 0 }}>
                            <Badge bg="secondary" style={{ whiteSpace: 'nowrap', marginRight: 4 }}>Devis:</Badge>
                            <span
                              style={{
                                wordBreak: 'break-all',
                                minWidth: 0,
                                maxWidth: 120,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block',
                                verticalAlign: 'bottom',
                                cursor: 'pointer'
                              }}
                              title={devisNames[m.devisId || (m.devis && m.devis.id)]}
                            >
                              {devisNames[m.devisId || (m.devis && m.devis.id)] || <span className="text-muted">Chargement...</span>}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <Dropdown className="actions-dropdown position-static">
                        <Dropdown.Toggle
                          variant="primary"
                          size="md"
                          id={`dropdown-mission-${m.id}`}
                          className="btn-action-dropdown d-flex align-items-center gap-2"
                          style={{ borderRadius: '2rem', fontWeight: 600, letterSpacing: '0.02em', boxShadow: '0 2px 8px rgba(13,110,253,0.08)' }}
                        >
                          <i className="bi bi-list"></i> Actions
                        </Dropdown.Toggle>

                        {/* ⬇️ le menu ne sera pas coupé + s’ouvre vers le haut si besoin */}
                        <Dropdown.Menu
                          renderOnMount
                          align="end"
                          popperConfig={{
                            strategy: 'fixed',
                            modifiers: [
                              { name: 'offset', options: { offset: [0, 8] } },
                              { name: 'flip', options: { fallbackPlacements: ['top-end', 'bottom-end'] } },
                              { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
                            ],
                          }}
                          style={{ maxHeight: '60vh', overflowY: 'auto' }}
                        >
                          <Dropdown.Item onClick={() => navigate(`/missions/${m.id}`)}>
                            <i className="bi bi-eye"></i> Détails
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => navigate(`/missions/edit/${m.id}`)}>
                            <i className="bi bi-pencil"></i> Éditer
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={() => handleDelete(m.id)} className="text-danger">
                            <i className="bi bi-trash"></i> Supprimer
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={() => handleShowAgentModal(m.id)}>
                            <i className="bi bi-person-plus"></i> Affecter agent
                          </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleShowRetirerAgentModal(m.id)}>
                              <i className="bi bi-person-dash"></i> Retirer agent
                            </Dropdown.Item>
                          <Dropdown.Item onClick={() => askAndCall("Associer planning", MissionService.assignPlanning, m.id)}>
                            <i className="bi bi-calendar-plus"></i> Associer planning
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleShowSiteModal(m.id)}>
                            <i className="bi bi-geo-alt"></i> Associer site
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => askAndCall("Associer contrat", (mid, cid) => MissionService.assignContrat(mid, cid), m.id)}>
                            <i className="bi bi-file-earmark-text"></i> Associer contrat
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleShowFactureModal(m.id)}>
                            <i className="bi bi-receipt"></i> Associer facture
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center my-3">
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Précédent
            </Button>
            {[...Array(totalPages)].map((_, idx) => (
              <Button
                key={idx + 1}
                variant={currentPage === idx + 1 ? "primary" : "outline-primary"}
                size="sm"
                className="mx-1"
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </Button>
            ))}
            <Button
              variant="outline-primary"
              size="sm"
              className="ms-2"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </Card>
  {/* Modal de sélection d'agent(s) */}
    <Modal show={showAgentModal} onHide={handleAgentModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Affecter un ou plusieurs agents à la mission</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="selectAgents">
            <Form.Label>Choisir les agents</Form.Label>
            <Form.Select
              multiple
              value={selectedAgentIds}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions);
                setSelectedAgentIds(options.map(opt => opt.value));
              }}
              style={{ minHeight: 120 }}
            >
              {allAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.nom || agent.name || agent.prenom ? `${agent.nom || agent.name} ${agent.prenom || ''}` : `Agent #${agent.id}`}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs agents.</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleAgentModalClose}>Annuler</Button>
        <Button variant="primary" onClick={handleAgentModalSubmit} disabled={selectedAgentIds.length === 0}>Affecter</Button>
      </Modal.Footer>
    </Modal>
      {/* Modal de retrait d'agent(s) */}
      <Modal show={showRetirerAgentModal} onHide={handleRetirerAgentModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Retirer un ou plusieurs agents de la mission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="selectRetirerAgents">
              <Form.Label>Agents affectés à la mission</Form.Label>
              <Form.Select
                multiple
                value={selectedRetirerAgentIds}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions);
                  setSelectedRetirerAgentIds(options.map(opt => opt.value));
                }}
                style={{ minHeight: 120 }}
              >
                {agentsMission.length === 0 ? (
                  <option disabled>Aucun agent affecté</option>
                ) : (
                  agentsMission.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.nom || agent.name || agent.prenom
                        ? `${agent.nom || agent.name}${agent.prenom ? ' ' + agent.prenom : ''}`
                        : agent.email
                          ? agent.email
                          : `Agent #${agent.id}`}
                    </option>
                  ))
                )}
              </Form.Select>
              <Form.Text className="text-muted">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs agents à retirer.</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRetirerAgentModalClose}>Annuler</Button>
          <Button variant="danger" onClick={handleRetirerAgentModalSubmit} disabled={selectedRetirerAgentIds.length === 0}>Retirer</Button>
        </Modal.Footer>
      </Modal>
    {/* Modal de sélection de site */}
    <Modal show={showSiteModal} onHide={handleSiteModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Associer un site à la mission</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="selectSite">
            <Form.Label>Choisir un site</Form.Label>
            <Form.Select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
            >
              <option value="">-- Sélectionner un site --</option>
              {allSites.map(site => (
                <option key={site.id} value={site.id}>
                  {site.nom || site.name || `Site #${site.id}`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleSiteModalClose}>Annuler</Button>
        <Button variant="primary" onClick={handleSiteModalSubmit} disabled={!selectedSiteId}>Associer</Button>
      </Modal.Footer>
    </Modal>
    {/* Modal d'association de facture(s) */}
    <AssocierFactureModal
      show={showFactureModal}
      onClose={handleFactureModalClose}
      missionId={selectedFactureMissionId}
      factures={allFactures}
      onSuccess={() => {
        MissionService.getAllMissions().then(({ data }) => {
          if (Array.isArray(data)) {
            setMissions(data);
            setFilteredMissions(data.filter(mission =>
              (mission.titre && mission.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.description && mission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.statutMission && mission.statutMission?.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (mission.typeMission && mission.typeMission?.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
          }
        });
      }}
    />
    </Container>
  );
}
