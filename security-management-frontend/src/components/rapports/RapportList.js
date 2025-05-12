// src/components/rapports/RapportList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RapportService from "../../services/RapportService";
import MissionService from "../../services/MissionService";
import { 
    Container, Row, Col, Table, Card, Button, 
    Badge, Form, InputGroup, Spinner, Modal, Alert
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, faEye, faEdit, faTrash, faSearch,
    faFilter, faSort, faFileDownload, faSyncAlt 
} from '@fortawesome/free-solid-svg-icons';

export default function RapportList() {
    const [rapports, setRapports] = useState([]);
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortField, setSortField] = useState('dateIntervention');
    const [sortDirection, setSortDirection] = useState('desc');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rapportToDelete, setRapportToDelete] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // 🔄 recharge la liste des rapports
    const refreshRapports = () => {
        setLoading(true);
        RapportService.getAllRapports()
            .then(res => {
                const unique = new Map(res.data.map(r => [r.id, r]));
                setRapports(Array.from(unique.values()));
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des rapports:", err);
                setLoading(false);
                showNotification("Erreur lors du chargement des rapports", "danger");
            });
    };

    // 1) on récupère d'abord tous les rapports…
    useEffect(() => {
        refreshRapports();
    }, []);

    // 2) …et en même temps on charge toutes les missions
    useEffect(() => {
        MissionService.getAllMissions()
            .then(res => setMissions(res.data))
            .catch(err => console.error("Erreur lors du chargement des missions:", err));
    }, []);

    // Afficher une notification
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ ...notification, show: false }), 3000);
    };

    // Confirmation avant suppression
    const handleDeleteClick = (rapport) => {
        setRapportToDelete(rapport);
        setShowDeleteModal(true);
    };

    // Suppression confirmée
    const handleDelete = () => {
        if (!rapportToDelete) return;
        
        setLoading(true);
        RapportService.deleteRapport(rapportToDelete.id)
            .then(() => {
                refreshRapports();
                setShowDeleteModal(false);
                setRapportToDelete(null);
                showNotification("Rapport supprimé avec succès");
            })
            .catch(err => {
                console.error("Erreur lors de la suppression:", err);
                setLoading(false);
                showNotification("Erreur lors de la suppression du rapport", "danger");
            });
    };

    // Fonction pour trier les rapports
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Fonction pour filtrer les rapports
    const filteredRapports = rapports.filter(rapport => {
        // Filtrage par terme de recherche
        const searchMatch = searchTerm === '' || 
            rapport.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rapport.agentNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rapport.id.toString().includes(searchTerm);
        
        // Filtrage par statut
        const statusMatch = filterStatus === '' || rapport.status === filterStatus;
        
        return searchMatch && statusMatch;
    });

    // Fonction pour trier les rapports filtrés
    const sortedRapports = [...filteredRapports].sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'id') {
            comparison = a.id - b.id;
        } else if (sortField === 'dateIntervention') {
            comparison = new Date(a.dateIntervention) - new Date(b.dateIntervention);
        } else if (sortField === 'agentNom') {
            comparison = (a.agentNom || '').localeCompare(b.agentNom || '');
        } else if (sortField === 'status') {
            comparison = (a.status || '').localeCompare(b.status || '');
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Télécharger en CSV
    const exportToCSV = () => {
        const headers = ['ID', 'Date', 'Agent', 'Mission', 'Status', 'Description'];
        
        const csvData = sortedRapports.map(r => {
            const mission = missions.find(m => m.id === r.missionId);
            const missionTitle = mission ? mission.titre : `Mission #${r.missionId}`;
            
            return [
                r.id,
                r.dateIntervention?.replace('T', ' '),
                r.agentNom,
                missionTitle,
                r.status,
                r.description?.replace(/,/g, ';') // Éviter les problèmes avec les virgules
            ];
        });
        
        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `rapports_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Fonction pour obtenir la couleur du badge selon le statut
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'TERMINE': return 'success';
            case 'EN_COURS': return 'warning';
            case 'ANNULE': return 'danger';
            default: return 'secondary';
        }
    };

    // Affichage du nom de statut
    const getStatusDisplayName = (status) => {
        switch (status) {
            case 'TERMINE': return 'Terminé';
            case 'EN_COURS': return 'En cours';
            case 'ANNULE': return 'Annulé';
            default: return status;
        }
    };

    return (
        <Container fluid className="py-4">
            {/* Notification */}
            {notification.show && (
                <Alert 
                    variant={notification.type} 
                    className="position-fixed top-0 end-0 m-3" 
                    style={{ zIndex: 1050, maxWidth: '350px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                >
                    {notification.message}
                </Alert>
            )}

            {/* En-tête */}
            <Row className="align-items-center mb-4">
                <Col>
                    <h2 className="mb-0">
                        <FontAwesomeIcon icon={faFileDownload} className="me-2 text-primary" />
                        Rapports d'intervention
                    </h2>
                    <p className="text-muted mt-1">
                        {filteredRapports.length} rapport(s) trouvé(s)
                    </p>
                </Col>
                <Col xs="auto">
                    <Button 
                        as={Link} 
                        to="/rapports/create" 
                        variant="primary"
                        className="me-2"
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Nouveau rapport
                    </Button>
                    <Button 
                        variant="outline-secondary" 
                        onClick={refreshRapports}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faSyncAlt} className={loading ? "fa-spin me-1" : "me-1"} /> Actualiser
                    </Button>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <Row className="align-items-center">
                        <Col md={4} className="mb-3 mb-md-0">
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Rechercher..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3} className="mb-3 mb-md-0">
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faFilter} />
                                </InputGroup.Text>
                                <Form.Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="EN_COURS">En cours</option>
                                    <option value="TERMINE">Terminé</option>
                                    <option value="ANNULE">Annulé</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col className="text-md-end">
                            <Button 
                                variant="outline-success" 
                                onClick={exportToCSV} 
                                className="me-2"
                            >
                                <FontAwesomeIcon icon={faFileDownload} className="me-1" /> Exporter CSV
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" variant="primary" className="mb-2">
                                <span className="visually-hidden">Chargement...</span>
                            </Spinner>
                            <p className="text-muted">Chargement des données...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table striped hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>
                                            ID {sortField === 'id' && (
                                                <FontAwesomeIcon icon={faSort} className="ms-1 text-muted" />
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('dateIntervention')} style={{cursor: 'pointer'}}>
                                            Date {sortField === 'dateIntervention' && (
                                                <FontAwesomeIcon icon={faSort} className="ms-1 text-muted" />
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('agentNom')} style={{cursor: 'pointer'}}>
                                            Agent {sortField === 'agentNom' && (
                                                <FontAwesomeIcon icon={faSort} className="ms-1 text-muted" />
                                            )}
                                        </th>
                                        <th>Mission</th>
                                        <th onClick={() => handleSort('status')} style={{cursor: 'pointer'}}>
                                            Statut {sortField === 'status' && (
                                                <FontAwesomeIcon icon={faSort} className="ms-1 text-muted" />
                                            )}
                                        </th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRapports.length > 0 ? sortedRapports.map((r) => {
                                        // retrouve l'objet mission correspondant
                                        const mission = missions.find(m => m.id === r.missionId);
                                        return (
                                            <tr key={r.id}>
                                                <td><Badge bg="secondary">#{r.id}</Badge></td>
                                                <td>
                                                    {new Date(r.dateIntervention).toLocaleString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td>
                                                    <div>{r.agentNom}</div>
                                                    <small className="text-muted">{r.agentEmail}</small>
                                                </td>
                                                <td>
                                                    {mission
                                                        ? (
                                                            <>
                                                                <div>{mission.titre}</div>
                                                                {mission.siteId && (
                                                                    <small className="text-muted">
                                                                        Site #{mission.siteId}
                                                                    </small>
                                                                )}
                                                            </>
                                                        )
                                                        : r.missionId
                                                            ? <span className="text-muted">Mission #{r.missionId}</span>
                                                            : <span className="text-muted">—</span>
                                                    }
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadgeVariant(r.status)}>
                                                        {getStatusDisplayName(r.status)}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Button 
                                                        as={Link} 
                                                        to={`/rapports/${r.id}`} 
                                                        variant="outline-secondary" 
                                                        size="sm" 
                                                        className="me-1"
                                                        title="Voir"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                    <Button 
                                                        as={Link} 
                                                        to={`/rapports/edit/${r.id}`} 
                                                        variant="outline-primary" 
                                                        size="sm" 
                                                        className="me-1"
                                                        title="Modifier"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        title="Supprimer"
                                                        onClick={() => handleDeleteClick(r)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                {searchTerm || filterStatus ? (
                                                    <div>
                                                        <p className="mb-1">Aucun résultat trouvé pour votre recherche.</p>
                                                        <Button 
                                                            variant="link" 
                                                            onClick={() => {
                                                                setSearchTerm('');
                                                                setFilterStatus('');
                                                            }}
                                                        >
                                                            Réinitialiser les filtres
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="mb-1">Aucun rapport d'intervention trouvé.</p>
                                                        <Button as={Link} to="/rapports/create" variant="primary">
                                                            Créer un nouveau rapport
                                                        </Button>
                                                    </div>
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
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {rapportToDelete && (
                        <div>
                            <p>Êtes-vous sûr de vouloir supprimer ce rapport d'intervention ?</p>
                            <ul className="list-unstyled">
                                <li><strong>ID :</strong> #{rapportToDelete.id}</li>
                                <li><strong>Date :</strong> {new Date(rapportToDelete.dateIntervention).toLocaleString()}</li>
                                <li><strong>Agent :</strong> {rapportToDelete.agentNom}</li>
                                {rapportToDelete.description && (
                                    <li><strong>Description :</strong> {rapportToDelete.description}</li>
                                )}
                            </ul>
                            <Alert variant="warning">
                                Cette action est irréversible.
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                                Suppression...
                            </>
                        ) : (
                            <>Supprimer</>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
