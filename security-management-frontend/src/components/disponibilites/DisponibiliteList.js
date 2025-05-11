import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner, Modal, Form, InputGroup } from 'react-bootstrap';
import { FaCalendarAlt, FaPlus, FaSearch, FaFilter, FaSyncAlt, FaEye, FaEdit, FaTrashAlt, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import DisponibiliteService from "../../services/DisponibiliteService";
import AgentService from "../../services/AgentService";
import "../../styles/AgentList.css"; // reprend styles existants

const DisponibiliteList = () => {
    const [list, setList] = useState([]);
    const [agents, setAgents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortField, setSortField] = useState('dateDebut');
    const [sortDirection, setSortDirection] = useState('asc');

    // Fonction pour trier la liste
    const sortedList = () => {
        return [...list].filter(d => {
            // Filtre par recherche
            const agentInfo = getAgentInfo(d.agentId).toLowerCase();
            const searchMatch = searchTerm === '' || agentInfo.includes(searchTerm.toLowerCase());
            
            // Filtre par statut
            const status = getDisponibiliteStatus(d.dateDebut, d.dateFin).status;
            const statusMatch = filterStatus === 'all' || status === filterStatus;
            
            return searchMatch && statusMatch;
        }).sort((a, b) => {
            if (sortField === 'dateDebut') {
                return sortDirection === 'asc' 
                    ? new Date(a.dateDebut) - new Date(b.dateDebut)
                    : new Date(b.dateDebut) - new Date(a.dateDebut);
            } else if (sortField === 'agent') {
                const agentA = getAgentInfo(a.agentId).toLowerCase();
                const agentB = getAgentInfo(b.agentId).toLowerCase();
                return sortDirection === 'asc'
                    ? agentA.localeCompare(agentB)
                    : agentB.localeCompare(agentA);
            } else if (sortField === 'duration') {
                const durationA = new Date(a.dateFin) - new Date(a.dateDebut);
                const durationB = new Date(b.dateFin) - new Date(b.dateDebut);
                return sortDirection === 'asc'
                    ? durationA - durationB
                    : durationB - durationA;
            }
            return 0;
        });
    };

    // Fonction pour charger les données
    const loadData = () => {
        setLoading(true);
        setError(null);

        // Chargement des disponibilités
        DisponibiliteService.getAll()
            .then(res => {
                setList(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des disponibilités", err);
                setError("Impossible de charger les disponibilités.");
                setLoading(false);
            });
        
        // Chargement des agents pour avoir les détails
        AgentService.getAllAgents()
            .then(res => {
                // Créer un index des agents par ID pour faciliter la recherche
                const agentsIndex = {};
                res.data.forEach(agent => {
                    agentsIndex[agent.id] = agent;
                });
                setAgents(agentsIndex);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents", err);
                setError(error => error || "Impossible de charger les informations des agents.");
            });
    };

    useEffect(() => {
        loadData();
    }, []);

    // Gestionnaire pour la confirmation de suppression
    const handleDelete = () => {
        if (deleteId) {
            DisponibiliteService.delete(deleteId)
                .then(() => {
                    setList(list.filter(x => x.id !== deleteId));
                    setShowDeleteModal(false);
                    setDeleteId(null);
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression", err);
                    setError("Impossible de supprimer cette disponibilité.");
                });
        }
    };

    // Fonction pour changer l'ordre de tri
    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Fonction pour obtenir les informations d'un agent à partir de son ID
    const getAgentInfo = (agentId) => {
        const agent = agents[agentId];
        if (!agent) return `Agent #${agentId}`;
        return `${agent.nom} ${agent.prenom}${agent.email ? ` - ${agent.email}` : ""}`;
    };

    // Fonction pour calculer la durée d'une disponibilité
    const calculateDuration = (dateDebut, dateFin) => {
        const start = new Date(dateDebut);
        const end = new Date(dateFin);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        const remainingHours = diffHours % 24;
        
        if (diffDays > 0) {
            return `${diffDays} jour${diffDays > 1 ? 's' : ''} et ${remainingHours} heure${remainingHours > 1 ? 's' : ''}`;
        } else {
            return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        }
    };

    // Fonction pour déterminer le statut d'une disponibilité
    const getDisponibiliteStatus = (dateDebut, dateFin) => {
        const now = new Date();
        const start = new Date(dateDebut);
        const end = new Date(dateFin);
        
        if (now < start) {
            return { status: "future", label: "À venir", variant: "primary" };
        } else if (now > end) {
            return { status: "past", label: "Terminée", variant: "secondary" };
        } else {
            return { status: "active", label: "En cours", variant: "success" };
        }
    };

    // Fonction pour vérifier les chevauchements avec d'autres disponibilités du même agent
    const checkOverlap = (disponibilite) => {
        const overlaps = list.filter(d => 
            d.id !== disponibilite.id && 
            d.agentId === disponibilite.agentId &&
            ((new Date(d.dateDebut) < new Date(disponibilite.dateFin) && 
              new Date(d.dateFin) > new Date(disponibilite.dateDebut)))
        );
        
        return overlaps.length > 0 ? 
            { hasOverlap: true, count: overlaps.length } : 
            { hasOverlap: false };
    };

    return (
        <Container fluid className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary bg-gradient text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                <FaCalendarAlt className="me-2" /> Gestion des disponibilités
                            </h5>
                        </Col>
                        <Col xs="auto">
                            <Link to="/disponibilites/create" className="btn btn-light">
                                <FaPlus className="me-1" /> Nouvelle disponibilité
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            <FaExclamationTriangle className="me-2" /> {error}
                        </Alert>
                    )}

                    {/* Filtres et recherche */}
                    <Row className="mb-4 g-2">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text><FaSearch /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Rechercher un agent..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <InputGroup>
                                <InputGroup.Text><FaFilter /></InputGroup.Text>
                                <Form.Select 
                                    value={filterStatus} 
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="active">En cours</option>
                                    <option value="future">À venir</option>
                                    <option value="past">Terminées</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-secondary" onClick={loadData}>
                                <FaSyncAlt className="me-1" /> Actualiser
                            </Button>
                        </Col>
                        <Col md={2} className="text-md-end">
                            <Badge bg="info" className="fs-6">
                                {sortedList().length} disponibilités
                            </Badge>
                        </Col>
                    </Row>

                    {/* Tableau des disponibilités */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Chargement des disponibilités...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover striped className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th onClick={() => toggleSort('agent')} style={{cursor: 'pointer'}}>
                                            Agent {sortField === 'agent' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th>Statut</th>
                                        <th onClick={() => toggleSort('dateDebut')} style={{cursor: 'pointer'}}>
                                            Période {sortField === 'dateDebut' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => toggleSort('duration')} style={{cursor: 'pointer'}}>
                                            Durée {sortField === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th>Conflits</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedList().length > 0 ? (
                                        sortedList().map((d) => {
                                            const status = getDisponibiliteStatus(d.dateDebut, d.dateFin);
                                            const overlap = checkOverlap(d);
                                            
                                            return (
                                                <tr key={d.id} className={status.status === 'active' ? 'table-active' : ''}>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <span className="fw-bold">{getAgentInfo(d.agentId).split(' - ')[0]}</span>
                                                            {getAgentInfo(d.agentId).includes(' - ') && (
                                                                <small className="text-muted">{getAgentInfo(d.agentId).split(' - ')[1]}</small>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg={status.variant} pill>
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <div>
                                                                <FaCalendarAlt className="me-1 text-muted" size={12} />
                                                                <small>{new Date(d.dateDebut).toLocaleDateString()}</small>
                                                            </div>
                                                            <div>
                                                                <FaClock className="me-1 text-muted" size={12} />
                                                                <small>{new Date(d.dateDebut).toLocaleTimeString()} - {new Date(d.dateFin).toLocaleTimeString()}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            {calculateDuration(d.dateDebut, d.dateFin)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {overlap.hasOverlap ? (
                                                            <Badge bg="danger" pill>
                                                                <FaExclamationTriangle className="me-1" /> 
                                                                {overlap.count} conflit{overlap.count > 1 ? 's' : ''}
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="success" pill>
                                                                <FaCheckCircle className="me-1" /> OK
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <Link 
                                                                to={`/disponibilites/${d.id}`} 
                                                                className="btn btn-sm btn-outline-info"
                                                                title="Voir les détails"
                                                            >
                                                                <FaEye />
                                                            </Link>
                                                            <Link 
                                                                to={`/disponibilites/edit/${d.id}`} 
                                                                className="btn btn-sm btn-outline-primary"
                                                                title="Modifier"
                                                            >
                                                                <FaEdit />
                                                            </Link>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                title="Supprimer"
                                                                onClick={() => {
                                                                    setDeleteId(d.id);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                            >
                                                                <FaTrashAlt />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <p className="text-muted mb-2">Aucune disponibilité trouvée</p>
                                                {(searchTerm || filterStatus !== 'all') && (
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setFilterStatus('all');
                                                        }}
                                                    >
                                                        Réinitialiser les filtres
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>Confirmation de suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Êtes-vous sûr de vouloir supprimer cette disponibilité ?</p>
                    <p className="text-muted small">Cette action est irréversible.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DisponibiliteList;
