// src/components/agents/AgentList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    Container, Row, Col, Table, Button, Card, Form, 
    InputGroup, Badge, Dropdown, Modal, Alert, Spinner
} from "react-bootstrap";
import { 
    BsSearch, BsPersonPlus, BsEye, BsPencil, BsTrash, 
    BsPersonBadge, BsCalendarCheck, BsShield, BsDiagram2, 
    BsGeoAlt, BsCreditCard2Front, BsAward, BsThreeDots
} from "react-icons/bs";
import AgentService from "../../services/AgentService";
import "../../styles/AgentList.css";

const AgentList = () => {
    const [agents, setAgents] = useState([]);
    const [filteredAgents, setFilteredAgents] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Options de rôles
    const roles = ["AGENT_SECURITE", "CHEF_EQUIPE", "MANAGER", "ADMIN"];

    const loadAgents = () => {
        setLoading(true);
        AgentService.getAllAgents()
            .then(res => {
                setAgents(res.data);
                setFilteredAgents(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents:", err);
                setError("Impossible de charger la liste des agents.");
                setLoading(false);
            });
    };

    useEffect(() => {
        loadAgents();
    }, []);

    useEffect(() => {
        if (filter) {
            const term = filter.toLowerCase();
            const filtered = agents.filter(a => 
                a.nom?.toLowerCase().includes(term) ||
                a.prenom?.toLowerCase().includes(term) ||
                a.email?.toLowerCase().includes(term) ||
                a.telephone?.toLowerCase().includes(term) ||
                a.statut?.toLowerCase().includes(term) ||
                a.role?.toLowerCase().includes(term)
            );
            setFilteredAgents(filtered);
        } else {
            setFilteredAgents(agents);
        }
    }, [filter, agents]);

    const handleDeleteAgent = (agent) => {
        setSelectedAgent(agent);
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        AgentService.deleteAgent(selectedAgent.id)
            .then(() => {
                setAgents(agents.filter(a => a.id !== selectedAgent.id));
                setMessage({ text: `Agent ${selectedAgent.nom} ${selectedAgent.prenom} supprimé avec succès`, type: "success" });
                setShowConfirmDelete(false);
            })
            .catch(err => {
                console.error("Erreur lors de la suppression:", err);
                setMessage({ text: "Une erreur est survenue lors de la suppression", type: "danger" });
                setShowConfirmDelete(false);
            });
    };

    const handleChangeRole = (agent) => {
        setSelectedAgent(agent);
        setSelectedRole(agent.role);
        setShowRoleModal(true);
    };

    const confirmChangeRole = () => {
        AgentService.changeRole(selectedAgent.id, selectedRole)
            .then(res => {
                const updatedAgents = agents.map(a => 
                    a.id === selectedAgent.id ? res.data : a
                );
                setAgents(updatedAgents);
                setMessage({ text: `Rôle modifié avec succès pour ${selectedAgent.nom}`, type: "success" });
                setShowRoleModal(false);
            })
            .catch(err => {
                console.error("Erreur lors du changement de rôle:", err);
                setMessage({ text: "Une erreur est survenue lors du changement de rôle", type: "danger" });
                setShowRoleModal(false);
            });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "–";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR').format(date);
    };

    const getStatusBadge = (status) => {
        if (!status) return <Badge bg="secondary">Non défini</Badge>;
        
        const statusColors = {
            EN_SERVICE: "success",
            EN_CONGE: "info",
            ABSENT: "warning",
            SUSPENDU: "danger"
        };
        
        return (
            <Badge bg={statusColors[status] || "secondary"}>
                {status.replace("_", " ")}
            </Badge>
        );
    };

    const getRoleBadge = (role) => {
        if (!role) return <Badge bg="secondary">Non défini</Badge>;
        
        const roleColors = {
            AGENT_SECURITE: "primary",
            CHEF_EQUIPE: "success",
            MANAGER: "warning",
            ADMIN: "danger"
        };
        
        return (
            <Badge bg={roleColors[role] || "secondary"}>
                {role.replace("_", " ")}
            </Badge>
        );
    };

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container fluid className="agent-list-container my-4">
            {/* En-tête avec titre et boutons d'action */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                    <Row className="align-items-center mb-3">
                        <Col>
                            <h2 className="text-primary mb-0">
                                <BsShield className="me-2" />
                                Liste des Agents de Sécurité
                            </h2>
                        </Col>
                        <Col xs="auto">
                            <Link to="/agents/create">
                                <Button variant="primary" className="d-flex align-items-center">
                                    <BsPersonPlus className="me-2" /> Nouvel Agent
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                    
                    {/* Barre de recherche */}
                    <Row>
                        <Col md={6} lg={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <BsSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text" 
                                    placeholder="Rechercher par nom, email, statut..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col>
                            {message.text && (
                                <Alert 
                                    variant={message.type} 
                                    dismissible 
                                    onClose={() => setMessage({text: "", type: ""})}
                                >
                                    {message.text}
                                </Alert>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tableau des agents */}
            <Card className="shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Chargement des agents...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="agent-table mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="text-center">#</th>
                                        <th>Nom / Prénom</th>
                                        <th>Contact</th>
                                        <th>Statut</th>
                                        <th>Rôle</th>
                                        <th>Zones</th>
                                        <th>Documents</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAgents.map((agent, index) => (
                                        <tr key={agent.id}>
                                            <td className="text-center">{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-circle">
                                                        {agent.prenom?.[0]}{agent.nom?.[0]}
                                                    </div>
                                                    <div className="ms-3">
                                                        <div className="fw-bold">{agent.nom} {agent.prenom}</div>
                                                        <small className="text-muted">
                                                            Né(e) le: {formatDate(agent.dateNaissance)}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div><small><i className="bi bi-envelope"></i> {agent.email}</small></div>
                                                <div><small><i className="bi bi-telephone"></i> {agent.telephone || "–"}</small></div>
                                            </td>
                                            <td>{getStatusBadge(agent.statut)}</td>
                                            <td>{getRoleBadge(agent.role)}</td>
                                            <td className="text-center">
                                                {(agent.zonesDeTravailIds?.length > 0) ? (
                                                    <Badge bg="info" pill>{agent.zonesDeTravailIds.length}</Badge>
                                                ) : (
                                                    <Badge bg="light" text="dark" pill>0</Badge>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Badge bg={agent.diplomesSSIAPIds?.length > 0 ? "success" : "light"} 
                                                           text={agent.diplomesSSIAPIds?.length > 0 ? "white" : "dark"} 
                                                           title="Diplômes SSIAP">
                                                        <BsAward className="me-1" />
                                                        {agent.diplomesSSIAPIds?.length || 0}
                                                    </Badge>
                                                    <Badge bg={agent.cartesProfessionnelles?.length > 0 ? "primary" : "light"}
                                                           text={agent.cartesProfessionnelles?.length > 0 ? "white" : "dark"}
                                                           title="Cartes Pro">
                                                        <BsCreditCard2Front className="me-1" />
                                                        {agent.cartesProfessionnelles?.length || 0}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1">
                                                    <Link to={`/agents/${agent.id}`}>
                                                        <Button variant="outline-primary" size="sm" title="Voir le détail">
                                                            <BsEye />
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/agents/edit/${agent.id}`}>
                                                        <Button variant="outline-secondary" size="sm" title="Modifier">
                                                            <BsPencil />
                                                        </Button>
                                                    </Link>
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="outline-dark" size="sm" id={`dropdown-${agent.id}`}>
                                                            <BsThreeDots />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => handleChangeRole(agent)}>
                                                                <BsPersonBadge className="me-2" />Changer le rôle
                                                            </Dropdown.Item>
                                                            <Link to={`/agents/${agent.id}/planning`} className="dropdown-item">
                                                                <BsCalendarCheck className="me-2" />Voir le planning
                                                            </Link>
                                                            <Dropdown.Item onClick={() => handleDeleteAgent(agent)}>
                                                                <BsTrash className="me-2" />Supprimer
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            
                            {filteredAgents.length === 0 && !loading && (
                                <div className="text-center py-5">
                                    <p className="text-muted">Aucun agent ne correspond à votre recherche</p>
                                </div>
                            )}
                        </div>
                    )}
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                        Total: {filteredAgents.length} agent(s)
                    </div>
                </Card.Footer>
            </Card>

            {/* Modal pour changer le rôle */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Changer le rôle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAgent && (
                        <>
                            <p>Changer le rôle de l'agent: <strong>{selectedAgent.nom} {selectedAgent.prenom}</strong></p>
                            <Form.Group>
                                <Form.Label>Sélectionner un rôle</Form.Label>
                                <Form.Select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role.replace("_", " ")}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={confirmChangeRole}>
                        Confirmer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmation de suppression */}
            <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAgent && (
                        <p>
                            Êtes-vous sûr de vouloir supprimer l'agent
                            <strong> {selectedAgent.nom} {selectedAgent.prenom} </strong>?
                            Cette action est irréversible.
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>        </Container>
    );
};

export default AgentList;
