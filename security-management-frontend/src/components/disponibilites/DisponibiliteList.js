import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner, Modal, Form, InputGroup, Tabs, Tab, Nav, ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { 
    FaCalendarAlt, FaPlus, FaSearch, FaFilter, FaSyncAlt, FaEye, 
    FaEdit, FaTrashAlt, FaExclamationTriangle, FaCheckCircle, 
    FaClock, FaTable, FaTh, FaChartBar, FaUser, FaCalendarCheck, 
    FaCalendarTimes, FaInfoCircle, FaFileExport, FaPrint, FaBell,
    FaEnvelope
} from 'react-icons/fa';
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
    const [viewMode, setViewMode] = useState('table'); // 'table', 'grid', 'stats'
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ message: '', variant: 'success' });

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
                // Afficher une notification de succès
                showTemporaryNotification('Données chargées avec succès', 'success');
            })
            .catch(err => {
                console.error("Erreur lors du chargement des disponibilités", err);
                setError("Impossible de charger les disponibilités.");
                setLoading(false);
                // Afficher une notification d'erreur
                showTemporaryNotification('Erreur lors du chargement des données', 'danger');
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

    // Fonction pour afficher une notification temporaire
    const showTemporaryNotification = (message, variant = 'success') => {
        setNotification({ message, variant });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000); // Disparaît après 3 secondes
    };

    // Fonction pour exporter les données en CSV
    const exportToCSV = () => {
        const headers = ['Agent', 'Statut', 'Date de début', 'Date de fin', 'Durée', 'Conflits'];
        
        const rows = sortedList().map(d => {
            const status = getDisponibiliteStatus(d.dateDebut, d.dateFin);
            const overlap = checkOverlap(d);
            return [
                getAgentInfo(d.agentId),
                status.label,
                new Date(d.dateDebut).toLocaleString(),
                new Date(d.dateFin).toLocaleString(),
                calculateDuration(d.dateDebut, d.dateFin),
                overlap.hasOverlap ? `${overlap.count} conflit(s)` : 'OK'
            ];
        });
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'disponibilites.csv');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showTemporaryNotification('Export CSV effectué avec succès', 'success');
    };

    // Fonction pour imprimer la liste des disponibilités
    const printList = () => {
        window.print();
        showTemporaryNotification('Impression lancée', 'info');
    };

    // Statistiques des disponibilités
    const getDisponibiliteStats = () => {
        const total = sortedList().length;
        const active = sortedList().filter(d => getDisponibiliteStatus(d.dateDebut, d.dateFin).status === 'active').length;
        const future = sortedList().filter(d => getDisponibiliteStatus(d.dateDebut, d.dateFin).status === 'future').length;
        const past = sortedList().filter(d => getDisponibiliteStatus(d.dateDebut, d.dateFin).status === 'past').length;
        const withConflicts = sortedList().filter(d => checkOverlap(d).hasOverlap).length;
        
        return {
            total,
            active,
            future,
            past,
            withConflicts,
            activePercentage: total ? Math.round((active / total) * 100) : 0,
            futurePercentage: total ? Math.round((future / total) * 100) : 0,
            pastPercentage: total ? Math.round((past / total) * 100) : 0,
            conflictsPercentage: total ? Math.round((withConflicts / total) * 100) : 0
        };
    };

    // Filtre par agent spécifique
    const getAgentOptions = () => {
        const agentIds = [...new Set(list.map(d => d.agentId))];
        return [
            { value: 'all', label: 'Tous les agents' },
            ...agentIds.map(id => ({
                value: id,
                label: getAgentInfo(id)
            }))
        ];
    };

    const filteredList = () => {
        return sortedList().filter(d => selectedAgent === 'all' || d.agentId.toString() === selectedAgent);
    };

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

    // Rendu du tooltip pour les informations supplémentaires
    const renderTooltip = (text) => (
        <Tooltip id="button-tooltip">
            {text}
        </Tooltip>
    );

    return (
        <Container fluid className="py-4">
            {/* Notification temporaire */}
            {showNotification && (
                <Alert 
                    variant={notification.variant} 
                    className="position-fixed top-0 end-0 m-4 shadow-sm alert-dismissible fade show" 
                    style={{ zIndex: 1050, maxWidth: '300px', animation: 'fadeIn 0.5s' }}
                    onClose={() => setShowNotification(false)}
                    dismissible
                >
                    <div className="d-flex align-items-center">
                        {notification.variant === 'success' && <FaCheckCircle className="me-2" />}
                        {notification.variant === 'danger' && <FaExclamationTriangle className="me-2" />}
                        {notification.variant === 'info' && <FaInfoCircle className="me-2" />}
                        {notification.message}
                    </div>
                </Alert>
            )}
            
            <Card className="shadow-sm border-0 rounded-lg">
                <Card.Header className="bg-gradient bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                <FaCalendarAlt className="me-2" /> Gestion des disponibilités
                            </h5>
                        </Col>
                        <Col xs="auto">
                            <Link 
                                to="/disponibilites/create" 
                                className="btn btn-warning fw-bold shadow-sm text-dark" 
                                style={{ 
                                    fontSize: '0.95rem', 
                                    transition: 'all 0.3s ease',
                                    border: '2px solid #f8f9fa'
                                }}
                            >
                                <FaPlus className="me-1" /> Nouvelle disponibilité
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body className="p-0">
                    {/* Onglets de navigation */}
                    <Nav variant="tabs" className="border-0 bg-light">
                        <Nav.Item>
                            <Nav.Link 
                                active={viewMode === 'table'} 
                                onClick={() => setViewMode('table')}
                                className="d-flex align-items-center"
                            >
                                <FaTable className="me-1" /> Tableau
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={viewMode === 'grid'} 
                                onClick={() => setViewMode('grid')}
                                className="d-flex align-items-center"
                            >
                                <FaTh className="me-1" /> Cartes
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={viewMode === 'stats'} 
                                onClick={() => setViewMode('stats')}
                                className="d-flex align-items-center"
                            >
                                <FaChartBar className="me-1" /> Statistiques
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                    
                    <div className="p-4">
                        {error && (
                            <Alert variant="danger" className="mb-4 d-flex align-items-center">
                                <FaExclamationTriangle className="me-2" /> {error}
                            </Alert>
                        )}

                        {/* Action button flottant pour mobile */}
                        <div className="d-block d-md-none position-fixed" style={{ bottom: '20px', right: '20px', zIndex: 1000 }}>
                            <Link 
                                to="/disponibilites/create" 
                                className="btn btn-warning btn-lg rounded-circle shadow" 
                                style={{ width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <FaPlus size={24} />
                            </Link>
                        </div>

                        {/* Filtres et recherche */}
                        <Row className="mb-4 g-3">
                            <Col md={3}>
                                <div className="shadow-sm rounded">
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FaSearch className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Rechercher un agent..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-start-0"
                                            style={{ borderLeft: 'none' }}
                                        />
                                        {searchTerm && (
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={() => setSearchTerm('')}
                                                className="border-start-0"
                                            >
                                                ×
                                            </Button>
                                        )}
                                    </InputGroup>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="shadow-sm rounded">
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FaUser className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Select
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                            className="border-start-0"
                                        >
                                            {getAgentOptions().map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </div>
                            </Col>
                            <Col md={2}>
                                <div className="shadow-sm rounded">
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FaFilter className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Select 
                                            value={filterStatus} 
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="border-start-0"
                                        >
                                            <option value="all">Tous les statuts</option>
                                            <option value="active">En cours</option>
                                            <option value="future">À venir</option>
                                            <option value="past">Terminées</option>
                                        </Form.Select>
                                    </InputGroup>
                                </div>
                            </Col>
                            <Col md={4} className="d-flex gap-2 justify-content-md-end align-items-center">
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={loadData} 
                                    title="Actualiser les données"
                                    className="shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '38px', height: '38px' }}
                                >
                                    <FaSyncAlt />
                                </Button>
                                
                                <OverlayTrigger
                                    trigger="click"
                                    placement="bottom"
                                    show={showExportOptions}
                                    onToggle={(show) => setShowExportOptions(show)}
                                    overlay={
                                        <div className="bg-white shadow p-2 rounded border" style={{ zIndex: 1000 }}>
                                            <Button 
                                                variant="outline-success" 
                                                size="sm" 
                                                onClick={exportToCSV}
                                                className="d-block w-100 mb-2"
                                            >
                                                <FaFileExport className="me-1" /> Exporter en CSV
                                            </Button>
                                            <Button 
                                                variant="outline-info" 
                                                size="sm" 
                                                onClick={printList}
                                                className="d-block w-100"
                                            >
                                                <FaPrint className="me-1" /> Imprimer
                                            </Button>
                                        </div>
                                    }
                                >
                                    <Button variant="outline-primary" className="shadow-sm">
                                        <FaFileExport className="me-1" /> <span className="d-none d-md-inline">Exporter</span>
                                    </Button>
                                </OverlayTrigger>
                                
                                <Badge 
                                    bg="info" 
                                    className="d-flex align-items-center px-3 shadow-sm"
                                    style={{ height: '38px', fontSize: '0.95rem' }}
                                >
                                    {filteredList().length} disponibilité{filteredList().length > 1 ? 's' : ''}
                                </Badge>
                            </Col>
                        </Row>

                        {/* Contenu principal selon le mode de vue */}
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Chargement des disponibilités...</p>
                            </div>
                        ) : (
                            <>
                                {/* Mode tableau */}
                                {viewMode === 'table' && (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle border shadow-sm bg-white">
                                            <thead>
                                                <tr className="bg-light">
                                                    <th onClick={() => toggleSort('agent')} style={{cursor: 'pointer', borderBottom: '2px solid #dee2e6'}}>
                                                        <div className="d-flex align-items-center p-2">
                                                            <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                                <FaUser className="text-primary" size={14} />
                                                            </div>
                                                            <span>Agent</span>
                                                            {sortField === 'agent' && (
                                                                <span className="ms-2 badge bg-primary bg-opacity-10 text-primary">
                                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th style={{borderBottom: '2px solid #dee2e6'}}>
                                                        <div className="d-flex align-items-center p-2">
                                                            <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                                <FaBell className="text-primary" size={14} />
                                                            </div>
                                                            <span>Statut</span>
                                                        </div>
                                                    </th>
                                                    <th onClick={() => toggleSort('dateDebut')} style={{cursor: 'pointer', borderBottom: '2px solid #dee2e6'}}>
                                                        <div className="d-flex align-items-center p-2">
                                                            <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                                <FaCalendarAlt className="text-primary" size={14} />
                                                            </div>
                                                            <span>Période</span>
                                                            {sortField === 'dateDebut' && (
                                                                <span className="ms-2 badge bg-primary bg-opacity-10 text-primary">
                                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th onClick={() => toggleSort('duration')} style={{cursor: 'pointer', borderBottom: '2px solid #dee2e6'}}>
                                                        <div className="d-flex align-items-center p-2">
                                                            <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                                <FaClock className="text-primary" size={14} />
                                                            </div>
                                                            <span>Durée</span>
                                                            {sortField === 'duration' && (
                                                                <span className="ms-2 badge bg-primary bg-opacity-10 text-primary">
                                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th style={{borderBottom: '2px solid #dee2e6'}}>
                                                        <div className="d-flex align-items-center p-2">
                                                            <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                                <FaExclamationTriangle className="text-primary" size={14} />
                                                            </div>
                                                            <span>Conflits</span>
                                                        </div>
                                                    </th>
                                                    <th className="text-center" style={{borderBottom: '2px solid #dee2e6'}}>
                                                        <div className="p-2">Actions</div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredList().length > 0 ? (
                                                    filteredList().map((d, index) => {
                                                        const status = getDisponibiliteStatus(d.dateDebut, d.dateFin);
                                                        const overlap = checkOverlap(d);
                                                        
                                                        return (
                                                            <tr 
                                                                key={d.id} 
                                                                className={`${status.status === 'active' ? 'table-active' : ''} ${index % 2 === 0 ? 'bg-light bg-opacity-50' : ''}`}
                                                            >
                                                                <td className="p-3">
                                                                    <div className="d-flex flex-column">
                                                                        <span className="fw-bold">{getAgentInfo(d.agentId).split(' - ')[0]}</span>
                                                                        {getAgentInfo(d.agentId).includes(' - ') && (
                                                                            <div className="d-flex align-items-center mt-1">
                                                                                <FaEnvelope className="text-muted me-1" size={12} />
                                                                                <small className="text-muted">{getAgentInfo(d.agentId).split(' - ')[1]}</small>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-3">
                                                                    <Badge 
                                                                        bg={`${status.variant}`} 
                                                                        pill 
                                                                        className="d-flex align-items-center shadow-sm" 
                                                                        style={{ width: 'fit-content', padding: '0.5rem 0.85rem' }}
                                                                    >
                                                                        {status.status === 'active' && <FaCalendarCheck className="me-1" />}
                                                                        {status.status === 'future' && <FaCalendarAlt className="me-1" />}
                                                                        {status.status === 'past' && <FaCalendarTimes className="me-1" />}
                                                                        {status.label}
                                                                    </Badge>
                                                                </td>
                                                                <td className="p-3">
                                                                    <div className="d-flex flex-column">
                                                                        <div className="mb-1 d-flex align-items-center">
                                                                            <FaCalendarAlt className="me-2 text-primary" size={12} />
                                                                            <strong className="me-1">Date:</strong>
                                                                            <span className="text-dark">{new Date(d.dateDebut).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <div className="d-flex align-items-center">
                                                                            <FaClock className="me-2 text-primary" size={12} />
                                                                            <strong className="me-1">Horaire:</strong>
                                                                            <span className="text-dark">
                                                                                {new Date(d.dateDebut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(d.dateFin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3">
                                                                    <Badge 
                                                                        bg="light" 
                                                                        text="dark" 
                                                                        className="d-flex align-items-center shadow-sm"
                                                                        style={{ padding: '0.5rem 0.85rem' }}
                                                                    >
                                                                        <FaClock className="me-2 text-primary" />
                                                                        {calculateDuration(d.dateDebut, d.dateFin)}
                                                                    </Badge>
                                                                </td>
                                                                <td className="p-3">
                                                                    {overlap.hasOverlap ? (
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={renderTooltip(`${overlap.count} conflit(s) détecté(s). Vérifiez le planning de l'agent.`)}
                                                                        >
                                                                            <Badge 
                                                                                bg="danger" 
                                                                                pill
                                                                                className="d-flex align-items-center shadow-sm"
                                                                                style={{ padding: '0.5rem 0.85rem' }}
                                                                            >
                                                                                <FaExclamationTriangle className="me-1" /> 
                                                                                {overlap.count} conflit{overlap.count > 1 ? 's' : ''}
                                                                            </Badge>
                                                                        </OverlayTrigger>
                                                                    ) : (
                                                                        <Badge 
                                                                            bg="success" 
                                                                            pill
                                                                            className="d-flex align-items-center shadow-sm"
                                                                            style={{ padding: '0.5rem 0.85rem' }}
                                                                        >
                                                                            <FaCheckCircle className="me-1" /> OK
                                                                        </Badge>
                                                                    )}
                                                                </td>
                                                                <td className="p-3">
                                                                    <div className="d-flex justify-content-center gap-2">
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={renderTooltip("Voir les détails")}
                                                                        >
                                                                            <Link 
                                                                                to={`/disponibilites/${d.id}`} 
                                                                                className="btn btn-sm btn-outline-info shadow-sm"
                                                                            >
                                                                                <FaEye />
                                                                            </Link>
                                                                        </OverlayTrigger>
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={renderTooltip("Modifier")}
                                                                        >
                                                                            <Link 
                                                                                to={`/disponibilites/edit/${d.id}`} 
                                                                                className="btn btn-sm btn-outline-primary shadow-sm"
                                                                            >
                                                                                <FaEdit />
                                                                            </Link>
                                                                        </OverlayTrigger>
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={renderTooltip("Supprimer")}
                                                                        >
                                                                            <Button
                                                                                variant="outline-danger"
                                                                                size="sm"
                                                                                className="shadow-sm"
                                                                                onClick={() => {
                                                                                    setDeleteId(d.id);
                                                                                    setShowDeleteModal(true);
                                                                                }}
                                                                            >
                                                                                <FaTrashAlt />
                                                                            </Button>
                                                                        </OverlayTrigger>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-5">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="bg-light p-4 rounded-circle mb-3">
                                                                    <FaCalendarAlt className="text-secondary" size={48} />
                                                                </div>
                                                                <h5 className="text-secondary mb-3">Aucune disponibilité trouvée</h5>
                                                                {(searchTerm || filterStatus !== 'all' || selectedAgent !== 'all') && (
                                                                    <Button 
                                                                        variant="primary" 
                                                                        size="sm"
                                                                        className="shadow-sm"
                                                                        onClick={() => {
                                                                            setSearchTerm('');
                                                                            setFilterStatus('all');
                                                                            setSelectedAgent('all');
                                                                        }}
                                                                    >
                                                                        Réinitialiser les filtres
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}

                                {/* Mode grille (cartes) */}
                                {viewMode === 'grid' && (
                                    <>
                                        {filteredList().length > 0 ? (
                                            <Row xs={1} md={2} lg={3} className="g-4">
                                                {filteredList().map((d) => {
                                                    const status = getDisponibiliteStatus(d.dateDebut, d.dateFin);
                                                    const overlap = checkOverlap(d);
                                                    
                                                    return (
                                                        <Col key={d.id}>
                                                            <Card className={`h-100 border-${status.variant} hover-shadow transition-all`} 
                                                                  style={{ transition: 'all 0.2s ease' }}>
                                                                <Card.Header className={`bg-${status.variant} bg-opacity-10 d-flex justify-content-between align-items-center`}>
                                                                    <Badge bg={status.variant} pill>
                                                                        {status.status === 'active' && <FaCalendarCheck className="me-1" />}
                                                                        {status.status === 'future' && <FaCalendarAlt className="me-1" />}
                                                                        {status.status === 'past' && <FaCalendarTimes className="me-1" />}
                                                                        {status.label}
                                                                    </Badge>
                                                                    {overlap.hasOverlap && (
                                                                        <Badge bg="danger" pill>
                                                                            <FaExclamationTriangle className="me-1" /> 
                                                                            {overlap.count} conflit{overlap.count > 1 ? 's' : ''}
                                                                        </Badge>
                                                                    )}
                                                                </Card.Header>
                                                                <Card.Body>
                                                                    <Card.Title>
                                                                        <FaUser className="me-2 text-muted" />
                                                                        {getAgentInfo(d.agentId).split(' - ')[0]}
                                                                    </Card.Title>
                                                                    <hr />
                                                                    <div className="mb-3">
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <FaCalendarAlt className="me-2 text-primary" />
                                                                            <strong>Période:</strong>
                                                                        </div>
                                                                        <div className="ms-4">
                                                                            <div>Début: {new Date(d.dateDebut).toLocaleString()}</div>
                                                                            <div>Fin: {new Date(d.dateFin).toLocaleString()}</div>
                                                                            <div className="mt-2">
                                                                                <Badge bg="light" text="dark" className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                                                                                    <FaClock className="me-1" /> {calculateDuration(d.dateDebut, d.dateFin)}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Card.Body>
                                                                <Card.Footer className="bg-transparent border-top d-flex justify-content-between">
                                                                    <Link to={`/disponibilites/${d.id}`} className="btn btn-sm btn-outline-info">
                                                                        <FaEye className="me-1" /> Détails
                                                                    </Link>
                                                                    <div>
                                                                        <Link to={`/disponibilites/edit/${d.id}`} className="btn btn-sm btn-outline-primary me-2">
                                                                            <FaEdit className="me-1" /> Modifier
                                                                        </Link>
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setDeleteId(d.id);
                                                                                setShowDeleteModal(true);
                                                                            }}
                                                                        >
                                                                            <FaTrashAlt className="me-1" /> Supprimer
                                                                        </Button>
                                                                    </div>
                                                                </Card.Footer>
                                                            </Card>
                                                        </Col>
                                                    );
                                                })}
                                            </Row>
                                        ) : (
                                            <div className="text-center py-5">
                                                <FaCalendarAlt className="mb-3 text-muted" size={48} />
                                                <p className="text-muted mb-2">Aucune disponibilité trouvée</p>
                                                {(searchTerm || filterStatus !== 'all' || selectedAgent !== 'all') && (
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setFilterStatus('all');
                                                            setSelectedAgent('all');
                                                        }}
                                                    >
                                                        Réinitialiser les filtres
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Mode statistiques */}
                                {viewMode === 'stats' && (
                                    <div className="py-3">
                                        <Row className="mb-5">
                                            <Col md={3}>
                                                <Card className="border-0 shadow-sm text-center h-100">
                                                    <Card.Body>
                                                        <div className="display-4 text-primary mb-2">{getDisponibiliteStats().total}</div>
                                                        <Card.Title>Disponibilités totales</Card.Title>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="border-0 shadow-sm text-center h-100">
                                                    <Card.Body>
                                                        <div className="display-4 text-success mb-2">{getDisponibiliteStats().active}</div>
                                                        <Card.Title>Disponibilités en cours</Card.Title>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="border-0 shadow-sm text-center h-100">
                                                    <Card.Body>
                                                        <div className="display-4 text-primary mb-2">{getDisponibiliteStats().future}</div>
                                                        <Card.Title>Disponibilités à venir</Card.Title>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="border-0 shadow-sm text-center h-100">
                                                    <Card.Body>
                                                        <div className="display-4 text-danger mb-2">{getDisponibiliteStats().withConflicts}</div>
                                                        <Card.Title>Conflits détectés</Card.Title>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                        
                                        <Card className="border-0 shadow-sm mb-4">
                                            <Card.Header className="bg-light">
                                                <h6 className="mb-0">Répartition des disponibilités</h6>
                                            </Card.Header>
                                            <Card.Body>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span>En cours</span>
                                                        <span>{getDisponibiliteStats().activePercentage}%</span>
                                                    </div>
                                                    <ProgressBar variant="success" now={getDisponibiliteStats().activePercentage} />
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span>À venir</span>
                                                        <span>{getDisponibiliteStats().futurePercentage}%</span>
                                                    </div>
                                                    <ProgressBar variant="primary" now={getDisponibiliteStats().futurePercentage} />
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span>Terminées</span>
                                                        <span>{getDisponibiliteStats().pastPercentage}%</span>
                                                    </div>
                                                    <ProgressBar variant="secondary" now={getDisponibiliteStats().pastPercentage} />
                                                </div>
                                                <div>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span>Avec conflits</span>
                                                        <span>{getDisponibiliteStats().conflictsPercentage}%</span>
                                                    </div>
                                                    <ProgressBar variant="danger" now={getDisponibiliteStats().conflictsPercentage} />
                                                </div>
                                            </Card.Body>
                                        </Card>
                                        
                                        <Card className="border-0 shadow-sm">
                                            <Card.Header className="bg-light">
                                                <h6 className="mb-0">Disponibilités par agent</h6>
                                            </Card.Header>
                                            <Card.Body>
                                                <Table striped hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Agent</th>
                                                            <th>Total</th>
                                                            <th>En cours</th>
                                                            <th>À venir</th>
                                                            <th>Terminées</th>
                                                            <th>Conflits</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(agents).map(agentId => {
                                                            const agentDispos = list.filter(d => d.agentId.toString() === agentId.toString());
                                                            const active = agentDispos.filter(d => getDisponibiliteStatus(d.dateDebut, d.dateFin).status === 'active').length;
                                                            const future = agentDispos.filter(d => getDisponibiliteStatus(d.dateDebut, d.dateFin).status === 'future').length;
                                                            const past = agentDispos.filter(d => getDisponibiliteStatus(d.dateDebut, d.dateFin).status === 'past').length;
                                                            const conflicts = agentDispos.filter(d => checkOverlap(d).hasOverlap).length;
                                                            
                                                            if (agentDispos.length === 0) return null;
                                                            
                                                            return (
                                                                <tr key={agentId}>
                                                                    <td>{getAgentInfo(agentId).split(' - ')[0]}</td>
                                                                    <td>{agentDispos.length}</td>
                                                                    <td>
                                                                        <Badge bg={active > 0 ? 'success' : 'light'} text={active > 0 ? 'white' : 'dark'}>
                                                                            {active}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg={future > 0 ? 'primary' : 'light'} text={future > 0 ? 'white' : 'dark'}>
                                                                            {future}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg={past > 0 ? 'secondary' : 'light'} text={past > 0 ? 'white' : 'dark'}>
                                                                            {past}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg={conflicts > 0 ? 'danger' : 'success'}>
                                                                            {conflicts > 0 ? conflicts : 'OK'}
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }).filter(Boolean)}
                                                    </tbody>
                                                </Table>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Modal de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered animation={true}>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>
                        <FaExclamationTriangle className="me-2" />
                        Confirmation de suppression
                    </Modal.Title>
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
                        <FaTrashAlt className="me-1" /> Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Styles CSS pour les animations */}            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .hover-shadow:hover {
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
                    transform: translateY(-2px);
                }
                
                .transition-all {
                    transition: all 0.3s ease;
                }
                
                .badge {
                    font-weight: 500;
                }
                
                th {
                    font-weight: 600;
                    white-space: nowrap;
                }
                
                tr:hover {
                    background-color: rgba(0, 123, 255, 0.03);
                }
                
                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .btn:active {
                    transform: translateY(0);
                }
                
                .table {
                    border-collapse: separate;
                    border-spacing: 0;
                }
                
                .table td:first-child, .table th:first-child {
                    border-left: 1px solid #dee2e6;
                }
                
                .table td:last-child, .table th:last-child {
                    border-right: 1px solid #dee2e6;
                }
                
                .table tr:last-child td {
                    border-bottom: 1px solid #dee2e6;
                }
                
                .table thead th, .table tbody td {
                    border-right: 1px solid #dee2e6;
                }

                @media print {
                    .btn, .nav, .card-header, .form-control, .input-group {
                        display: none !important;
                    }
                }
            `}</style>
        </Container>
    );
};

export default DisponibiliteList;
