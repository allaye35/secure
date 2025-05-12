// src/components/agents/AgentList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    Container, Row, Col, Table, Button, Card, Form, 
    InputGroup, Badge, Dropdown, Modal, Alert, Spinner, 
    Tabs, Tab, OverlayTrigger, Tooltip
} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserShield, faUserPlus, faEye, faPencilAlt, faTrashAlt, 
    faUserCog, faCalendarAlt, faShieldAlt, faSitemap, 
    faMapMarkerAlt, faIdCard, faAward, faEllipsisV,
    faSearch, faFileExport, faFilter, faSyncAlt, faSort,
    faSortAmountUp, faSortAmountDown, faChartBar, faListUl, faTh,
    faSave, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
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
    const [viewMode, setViewMode] = useState("list"); // "list" ou "grid"
    const [sortField, setSortField] = useState("nom");
    const [sortDirection, setSortDirection] = useState("asc");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Options de rôles
    const roles = ["AGENT_SECURITE", "CHEF_EQUIPE", "MANAGER", "ADMIN"];
    const statuts = ["EN_SERVICE", "EN_CONGE", "ABSENT", "SUSPENDU"];

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
    }, [refreshTrigger]);

    useEffect(() => {
        // Appliquer les filtres et le tri
        let filtered = [...agents];
        
        // Filtre de recherche textuelle
        if (filter) {
            const term = filter.toLowerCase();
            filtered = filtered.filter(a => 
                a.nom?.toLowerCase().includes(term) ||
                a.prenom?.toLowerCase().includes(term) ||
                a.email?.toLowerCase().includes(term) ||
                a.telephone?.toLowerCase().includes(term) ||
                a.statut?.toLowerCase().includes(term) ||
                a.role?.toLowerCase().includes(term)
            );
        }

        // Filtre par statut
        if (statusFilter !== "all") {
            filtered = filtered.filter(a => a.statut === statusFilter);
        }

        // Filtre par rôle
        if (roleFilter !== "all") {
            filtered = filtered.filter(a => a.role === roleFilter);
        }

        // Tri
        filtered.sort((a, b) => {
            let valA, valB;
            
            switch(sortField) {
                case 'nom':
                    valA = `${a.nom || ''} ${a.prenom || ''}`.toLowerCase();
                    valB = `${b.nom || ''} ${b.prenom || ''}`.toLowerCase();
                    break;
                case 'email':
                    valA = (a.email || '').toLowerCase();
                    valB = (b.email || '').toLowerCase();
                    break;
                case 'statut':
                    valA = (a.statut || '').toLowerCase();
                    valB = (b.statut || '').toLowerCase();
                    break;
                case 'role':
                    valA = (a.role || '').toLowerCase();
                    valB = (b.role || '').toLowerCase();
                    break;
                default:
                    valA = (a[sortField] || '').toLowerCase();
                    valB = (b[sortField] || '').toLowerCase();
            }
            
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredAgents(filtered);
    }, [filter, agents, sortField, sortDirection, statusFilter, roleFilter]);

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
                setSelectedAgents(selectedAgents.filter(id => id !== selectedAgent.id));
            })
            .catch(err => {
                console.error("Erreur lors de la suppression:", err);
                setMessage({ text: "Une erreur est survenue lors de la suppression", type: "danger" });
                setShowConfirmDelete(false);
            });
    };

    const handleBulkDelete = () => {
        if (selectedAgents.length === 0) return;
        
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedAgents.length} agents sélectionnés ?`)) {
            Promise.all(
                selectedAgents.map(id => AgentService.deleteAgent(id))
            )
            .then(() => {
                setAgents(agents.filter(a => !selectedAgents.includes(a.id)));
                setMessage({ text: `${selectedAgents.length} agents supprimés avec succès`, type: "success" });
                setSelectedAgents([]);
                setSelectAll(false);
            })
            .catch(err => {
                console.error("Erreur lors de la suppression en masse:", err);
                setMessage({ text: "Une erreur est survenue lors de la suppression en masse", type: "danger" });
            });
        }
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

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        
        if (newSelectAll) {
            setSelectedAgents(filteredAgents.map(a => a.id));
        } else {
            setSelectedAgents([]);
        }
    };
    
    const handleSelectAgent = (id) => {
        if (selectedAgents.includes(id)) {
            setSelectedAgents(prev => prev.filter(agentId => agentId !== id));
        } else {
            setSelectedAgents(prev => [...prev, id]);
        }
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
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
        
        const statusLabel = {
            EN_SERVICE: "En service",
            EN_CONGE: "En congé",
            ABSENT: "Absent",
            SUSPENDU: "Suspendu"
        };
        
        return (
            <Badge bg={statusColors[status] || "secondary"}>
                {statusLabel[status] || status}
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
        
        const roleLabel = {
            AGENT_SECURITE: "Agent",
            CHEF_EQUIPE: "Chef d'équipe",
            MANAGER: "Manager",
            ADMIN: "Admin"
        };
        
        return (
            <Badge bg={roleColors[role] || "secondary"}>
                {roleLabel[role] || role}
            </Badge>
        );
    };
    
    // Générer un rapport CSV exportable
    const generateCsv = () => {
        const headers = ["ID", "Nom", "Prénom", "Email", "Téléphone", "Statut", "Rôle"];
        
        const csvRows = [
            headers.join(','),
            ...filteredAgents.map(a => {
                return [
                    a.id,
                    `"${(a.nom || '').replace(/"/g, '""')}"`,
                    `"${(a.prenom || '').replace(/"/g, '""')}"`,
                    `"${(a.email || '').replace(/"/g, '""')}"`,
                    `"${(a.telephone || '').replace(/"/g, '""')}"`,
                    `"${(a.statut || '').replace(/"/g, '""')}"`,
                    `"${(a.role || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ];
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `agents_securite_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Rendu des tooltips
    const renderTooltip = (props, content) => (
        <Tooltip id="button-tooltip" {...props}>
            {content}
        </Tooltip>
    );

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container fluid className="agent-list-container py-4 animate__animated animate__fadeIn">
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        <FontAwesomeIcon icon={faUserShield} className="me-2" />
                        Agents de Sécurité
                    </h4>
                    <div className="d-flex">
                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Rafraîchir la liste")}>
                            <Button 
                                variant="outline-light" 
                                className="me-2 border-0" 
                                onClick={handleRefresh}
                            >
                                <FontAwesomeIcon icon={faSyncAlt} />
                            </Button>
                        </OverlayTrigger>
                        <Link to="/agents/create">
                            <Button variant="light" className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Nouvel Agent
                            </Button>
                        </Link>
                    </div>
                </Card.Header>
                
                <Card.Body>
                    {message.text && (
                        <Alert 
                            variant={message.type} 
                            dismissible 
                            onClose={() => setMessage({text: "", type: ""})}
                            className="mb-3"
                        >
                            {message.text}
                        </Alert>
                    )}
                    
                    <Row className="mb-4 align-items-center">
                        <Col lg={3} md={6} className="mb-2 mb-md-0">
                            <InputGroup>
                                <InputGroup.Text className="bg-light">
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text" 
                                    placeholder="Rechercher un agent..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="border-start-0"
                                />
                            </InputGroup>
                        </Col>
                        <Col lg={2} md={6} className="mb-2 mb-md-0">
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border"
                            >
                                <option value="all">Tous les statuts</option>
                                {statuts.map(statut => (
                                    <option key={statut} value={statut}>
                                        {statut === "EN_SERVICE" ? "En service" : 
                                        statut === "EN_CONGE" ? "En congé" : 
                                        statut === "ABSENT" ? "Absent" : 
                                        statut === "SUSPENDU" ? "Suspendu" : statut}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col lg={2} md={6} className="mb-2 mb-md-0">
                            <Form.Select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="border"
                            >
                                <option value="all">Tous les rôles</option>
                                {roles.map(role => (
                                    <option key={role} value={role}>
                                        {role === "AGENT_SECURITE" ? "Agent" :
                                        role === "CHEF_EQUIPE" ? "Chef d'équipe" :
                                        role === "MANAGER" ? "Manager" :
                                        role === "ADMIN" ? "Admin" : role}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <div className="d-flex align-items-center">
                                {selectedAgents.length > 0 && (
                                    <>
                                        <Badge bg="primary" className="me-2">
                                            {selectedAgents.length} sélectionné(s)
                                        </Badge>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={handleBulkDelete}
                                            className="me-2"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} className="me-1" /> Supprimer
                                        </Button>
                                    </>
                                )}
                                
                                <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Exporter en CSV")}>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm"
                                        onClick={generateCsv}
                                        className="me-2"
                                    >
                                        <FontAwesomeIcon icon={faFileExport} />
                                    </Button>
                                </OverlayTrigger>
                                
                                {/* Boutons de basculement de vue */}
                                <div className="view-toggle ms-2">
                                    <Button 
                                        variant={viewMode === 'list' ? "secondary" : "outline-secondary"}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="me-1"
                                    >
                                        <FontAwesomeIcon icon={faListUl} />
                                    </Button>
                                    <Button 
                                        variant={viewMode === 'grid' ? "secondary" : "outline-secondary"}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <FontAwesomeIcon icon={faTh} />
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Chargement des agents...</p>
                        </div>
                    ) : filteredAgents.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="empty-state-icon mb-3">
                                <FontAwesomeIcon icon={faUserShield} size="4x" className="text-muted" />
                            </div>
                            <h5>Aucun agent trouvé</h5>
                            <p className="text-muted">
                                {filter || statusFilter !== "all" || roleFilter !== "all" ?
                                    "Aucun résultat pour votre recherche. Ajustez vos critères de filtre." :
                                    "Aucun agent de sécurité n'a été créé."}
                            </p>
                            <Link to="/agents/create">
                                <Button variant="primary" className="mt-3">
                                    <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Créer un agent
                                </Button>
                            </Link>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="table-responsive">
                            <Table hover className="agent-table mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th width="40">
                                            <Form.Check 
                                                type="checkbox" 
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th onClick={() => handleSort('nom')} style={{cursor: 'pointer'}}>
                                            Nom / Prénom
                                            {sortField === 'nom' && (
                                                <FontAwesomeIcon 
                                                    icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                                                    className="ms-2"
                                                />
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('email')} style={{cursor: 'pointer'}}>
                                            Contact
                                            {sortField === 'email' && (
                                                <FontAwesomeIcon 
                                                    icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                                                    className="ms-2"
                                                />
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('statut')} style={{cursor: 'pointer'}}>
                                            Statut
                                            {sortField === 'statut' && (
                                                <FontAwesomeIcon 
                                                    icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                                                    className="ms-2"
                                                />
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('role')} style={{cursor: 'pointer'}}>
                                            Rôle
                                            {sortField === 'role' && (
                                                <FontAwesomeIcon 
                                                    icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                                                    className="ms-2"
                                                />
                                            )}
                                        </th>
                                        <th>Zones</th>
                                        <th>Documents</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAgents.map((agent, index) => {
                                        const isSelected = selectedAgents.includes(agent.id);
                                        const animationDelay = index * 50; // ms
                                        
                                        return (
                                            <tr 
                                                key={agent.id}
                                                className={isSelected ? 'selected-row' : ''}
                                                style={{animationDelay: `${animationDelay}ms`}}
                                            >
                                                <td>
                                                    <Form.Check 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => handleSelectAgent(agent.id)}
                                                    />
                                                </td>
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
                                                    <div className="small">
                                                        <div><i className="bi bi-envelope me-1"></i> {agent.email}</div>
                                                        <div><i className="bi bi-telephone me-1"></i> {agent.telephone || "–"}</div>
                                                    </div>
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
                                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Diplômes SSIAP")}>
                                                            <Badge bg={agent.diplomesSSIAPIds?.length > 0 ? "success" : "light"} 
                                                                text={agent.diplomesSSIAPIds?.length > 0 ? "white" : "dark"}
                                                            >
                                                                <FontAwesomeIcon icon={faAward} className="me-1" />
                                                                {agent.diplomesSSIAPIds?.length || 0}
                                                            </Badge>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Cartes professionnelles")}>
                                                            <Badge bg={agent.cartesProfessionnellesIds?.length > 0 ? "primary" : "light"}
                                                                text={agent.cartesProfessionnellesIds?.length > 0 ? "white" : "dark"}
                                                            >
                                                                <FontAwesomeIcon icon={faIdCard} className="me-1" />
                                                                {agent.cartesProfessionnellesIds?.length || 0}
                                                            </Badge>
                                                        </OverlayTrigger>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Voir les détails")}>
                                                            <Link to={`/agents/${agent.id}`}>
                                                                <Button variant="outline-primary" size="sm">
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </Button>
                                                            </Link>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Modifier l'agent")}>
                                                            <Link to={`/agents/edit/${agent.id}`}>
                                                                <Button variant="outline-secondary" size="sm">
                                                                    <FontAwesomeIcon icon={faPencilAlt} />
                                                                </Button>
                                                            </Link>
                                                        </OverlayTrigger>
                                                        <Dropdown>
                                                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Plus d'options")}>
                                                                <Dropdown.Toggle variant="outline-dark" size="sm" id={`dropdown-${agent.id}`}>
                                                                    <FontAwesomeIcon icon={faEllipsisV} />
                                                                </Dropdown.Toggle>
                                                            </OverlayTrigger>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => handleChangeRole(agent)}>
                                                                    <FontAwesomeIcon icon={faUserCog} className="me-2" />Changer le rôle
                                                                </Dropdown.Item>
                                                                <Link to={`/agents/${agent.id}/planning`} className="dropdown-item">
                                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />Voir le planning
                                                                </Link>
                                                                <Dropdown.Item onClick={() => handleDeleteAgent(agent)} className="text-danger">
                                                                    <FontAwesomeIcon icon={faTrashAlt} className="me-2" />Supprimer
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                            {filteredAgents.map((agent, index) => {
                                const isSelected = selectedAgents.includes(agent.id);
                                const animationDelay = index * 50; // ms
                                
                                return (
                                    <Col key={agent.id}>
                                        <Card 
                                            className={`h-100 agent-card ${isSelected ? 'selected-card' : ''}`}
                                            style={{animationDelay: `${animationDelay}ms`}}
                                        >
                                            <Card.Header className="d-flex justify-content-between align-items-center">
                                                <div className="form-check">
                                                    <Form.Check 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => handleSelectAgent(agent.id)}
                                                    />
                                                </div>
                                                {getStatusBadge(agent.statut)}
                                            </Card.Header>
                                            <Card.Body>
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="avatar-circle me-3">
                                                        {agent.prenom?.[0]}{agent.nom?.[0]}
                                                    </div>
                                                    <div>
                                                        <Card.Title className="mb-0 fs-6">{agent.nom} {agent.prenom}</Card.Title>
                                                        <div className="small text-muted">{getRoleBadge(agent.role)}</div>
                                                    </div>
                                                </div>
                                                <div className="small mb-3">
                                                    <div><i className="bi bi-envelope me-1"></i> {agent.email}</div>
                                                    <div><i className="bi bi-telephone me-1"></i> {agent.telephone || "–"}</div>
                                                    <div><i className="bi bi-calendar me-1"></i> Né(e) le: {formatDate(agent.dateNaissance)}</div>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <div>
                                                        <Badge bg="light" text="dark" className="me-2">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                            {agent.zonesDeTravailIds?.length || 0} zones
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <Badge bg={agent.diplomesSSIAPIds?.length > 0 ? "success" : "light"} 
                                                              text={agent.diplomesSSIAPIds?.length > 0 ? "white" : "dark"}
                                                              className="me-1">
                                                            <FontAwesomeIcon icon={faAward} className="me-1" />
                                                            {agent.diplomesSSIAPIds?.length || 0}
                                                        </Badge>
                                                        <Badge bg={agent.cartesProfessionnellesIds?.length > 0 ? "primary" : "light"}
                                                              text={agent.cartesProfessionnellesIds?.length > 0 ? "white" : "dark"}>
                                                            <FontAwesomeIcon icon={faIdCard} className="me-1" />
                                                            {agent.cartesProfessionnellesIds?.length || 0}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                            <Card.Footer className="p-2">
                                                <div className="d-flex justify-content-between">
                                                    <div className="btn-group w-100">
                                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Voir les détails")}>
                                                            <Link to={`/agents/${agent.id}`} className="btn btn-sm btn-outline-primary flex-grow-1">
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </Link>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Modifier l'agent")}>
                                                            <Link to={`/agents/edit/${agent.id}`} className="btn btn-sm btn-outline-secondary flex-grow-1">
                                                                <FontAwesomeIcon icon={faPencilAlt} />
                                                            </Link>
                                                        </OverlayTrigger>
                                                        <Dropdown as="div" className="flex-grow-1">
                                                            <Dropdown.Toggle variant="outline-dark" size="sm" className="w-100">
                                                                <FontAwesomeIcon icon={faEllipsisV} />
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu align="end">
                                                                <Dropdown.Item onClick={() => handleChangeRole(agent)}>
                                                                    <FontAwesomeIcon icon={faUserCog} className="me-2" />Changer le rôle
                                                                </Dropdown.Item>
                                                                <Link to={`/agents/${agent.id}/planning`} className="dropdown-item">
                                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />Voir le planning
                                                                </Link>
                                                                <Dropdown.Item onClick={() => handleDeleteAgent(agent)} className="text-danger">
                                                                    <FontAwesomeIcon icon={faTrashAlt} className="me-2" />Supprimer
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </Card.Body>
                
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                        Total: {filteredAgents.length} agent(s) {filteredAgents.length !== agents.length && <span>sur {agents.length}</span>}
                    </div>
                </Card.Footer>
            </Card>

            {/* Modal pour changer le rôle */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faUserCog} className="me-2" />
                        Changer le rôle
                    </Modal.Title>
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
                                        <option key={role} value={role}>
                                            {role === "AGENT_SECURITE" ? "Agent de sécurité" :
                                             role === "CHEF_EQUIPE" ? "Chef d'équipe" :
                                             role === "MANAGER" ? "Manager" :
                                             role === "ADMIN" ? "Administrateur" : role}
                                        </option>
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
                        <FontAwesomeIcon icon={faSave} className="me-1" /> Confirmer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmation de suppression */}
            <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)}>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>
                        <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                        Confirmer la suppression
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAgent && (
                        <>
                            <p>
                                Êtes-vous sûr de vouloir supprimer l'agent
                                <strong> {selectedAgent.nom} {selectedAgent.prenom}</strong> ?
                            </p>
                            <Alert variant="warning">
                                <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                                Cette action est irréversible et supprimera toutes les données associées à cet agent.
                            </Alert>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        <FontAwesomeIcon icon={faTrashAlt} className="me-1" /> Supprimer définitivement
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AgentList;
