// src/components/missions/MissionList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";
import "../../styles/MissionList.css";
import { Table, Button, Badge, Card, Container, Row, Col, Dropdown, Form, InputGroup, Pagination } from 'react-bootstrap';

export default function MissionList() {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMissions, setFilteredMissions] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const navigate = useNavigate();
    
    // Variables pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [missionsPerPage, setMissionsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    
    useEffect(() => {
        MissionService.getAllMissions()
            .then(data => {
                if (Array.isArray(data)) {
                    setMissions(data);
                    setFilteredMissions(data);
                    setTotalPages(Math.ceil(data.length / missionsPerPage));
                } else {
                    setError("Format de données inattendu.");
                }
            })
            .catch(() => setError("Erreur lors du chargement."))
            .finally(() => setLoading(false));
    }, [missionsPerPage]);

    useEffect(() => {
        const results = missions.filter(mission =>
            mission.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.statutMission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.typeMission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (mission.site?.nom?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredMissions(results);
        setTotalPages(Math.ceil(results.length / missionsPerPage));
        setCurrentPage(1); // Réinitialiser à la première page après une recherche
    }, [searchTerm, missions, missionsPerPage]);

    // Calculer les index de début et de fin pour la pagination
    const indexOfLastMission = currentPage * missionsPerPage;
    const indexOfFirstMission = indexOfLastMission - missionsPerPage;
    // Obtenir les missions à afficher pour la page actuelle
    const currentMissions = filteredMissions.slice(indexOfFirstMission, indexOfLastMission);

    // Fonction pour changer de page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    
    // Action générique : on demande un ID
    const askAndCall = (label, fn, missionId) => {
        const target = window.prompt(`${label} – saisir l'ID :`);
        if (!target) return;
        fn(missionId, parseInt(target, 10))
            .then(() => {
                alert(`${label} réalisé !`);
                // Refresh data after operation
                MissionService.getAllMissions()
                    .then(data => {
                        if (Array.isArray(data)) {
                            setMissions(data);
                            setFilteredMissions(data.filter(mission =>
                                mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                mission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                mission.statutMission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                mission.typeMission?.toLowerCase().includes(searchTerm.toLowerCase())
                            ));
                        }
                    });
            })
            .catch(e => alert("Erreur : " + e.response?.data?.message || e.message));
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'en cours':
                return <Badge bg="primary">En cours</Badge>;
            case 'terminé':
            case 'termine':
            case 'terminée':
            case 'terminee':
                return <Badge bg="success">Terminé</Badge>;
            case 'planifié':
            case 'planifie':
            case 'planifiée':
            case 'planifiee':
                return <Badge bg="info">Planifié</Badge>;
            case 'annulé':
            case 'annule':
            case 'annulée':
            case 'annulee':
                return <Badge bg="danger">Annulé</Badge>;
            default:
                return <Badge bg="secondary">{status || 'Non défini'}</Badge>;
        }
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        
        const sortedData = [...filteredMissions].sort((a, b) => {
            if (a[key] < b[key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        
        setFilteredMissions(sortedData);
        setCurrentPage(1); // Réinitialiser à la première page après un tri
    };

    // Cette fonction détermine si le menu doit s'ouvrir vers le haut ou vers le bas
    const getDropDirection = (index) => {
        // Si l'élément est dans le dernier tiers de la liste, ouvrir vers le haut
        const threshold = Math.floor(filteredMissions.length * 0.67);
        return index >= threshold ? 'up' : 'down';
    };

    // Fonction pour rafraîchir les données après une action
    const refreshData = () => {
        MissionService.getAllMissions()
            .then(data => {
                if (Array.isArray(data)) {
                    setMissions(data);
                    setFilteredMissions(data.filter(mission =>
                        mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        mission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        mission.statutMission?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        mission.typeMission?.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
                }
            });
    };

    // Générer les éléments de pagination
    const renderPaginationItems = () => {
        const items = [];
        
        // Premier élément (première page)
        items.push(
            <Pagination.First 
                key="first" 
                onClick={() => paginate(1)} 
                disabled={currentPage === 1}
            />
        );
        
        // Élément précédent
        items.push(
            <Pagination.Prev 
                key="prev" 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
            />
        );
        
        // Afficher les numéros de page
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Ajuster si on est près de la fin
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Première page si on n'est pas au début
        if (startPage > 1) {
            items.push(
                <Pagination.Item key={1} onClick={() => paginate(1)}>
                    1
                </Pagination.Item>
            );
            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="ellipsis-start" />);
            }
        }
        
        // Pages intermédiaires
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item 
                    key={i} 
                    active={i === currentPage} 
                    onClick={() => paginate(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        
        // Dernière page si on n'est pas à la fin
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="ellipsis-end" />);
            }
            items.push(
                <Pagination.Item 
                    key={totalPages} 
                    onClick={() => paginate(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }
        
        // Éléments suivant et dernier
        items.push(
            <Pagination.Next 
                key="next" 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
            />
        );
        items.push(
            <Pagination.Last 
                key="last" 
                onClick={() => paginate(totalPages)} 
                disabled={currentPage === totalPages}
            />
        );
        
        return items;
    };

    if (loading) return (
        <Container className="mt-4">
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        </Container>
    );
    
    if (error) return (
        <Container className="mt-4">
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        </Container>
    );

    return (
        <Container fluid className="mission-list mt-4">
            <Card>
                <Card.Header className="bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="mb-0">Liste des missions</h2>
                        </Col>
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
                        <Col md={3} className="ms-auto">
                            <Form.Group>
                                <Form.Select 
                                    value={missionsPerPage} 
                                    onChange={(e) => setMissionsPerPage(Number(e.target.value))}
                                >
                                    <option value="5">5 missions par page</option>
                                    <option value="10">10 missions par page</option>
                                    <option value="20">20 missions par page</option>
                                    <option value="50">50 missions par page</option>
                                </Form.Select>
                            </Form.Group>
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
                                {currentMissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center">
                                            Aucune mission trouvée
                                        </td>
                                    </tr>
                                ) : currentMissions.map((m, index) => (
                                    <tr key={m.id}>
                                        <td>{m.id}</td>
                                        <td>
                                            <div className="fw-bold">{m.titre}</div>
                                            <div className="text-muted small text-truncate" style={{maxWidth: "200px"}} title={m.description}>
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
                                        <td>{m.site?.nom ?? "-"}</td>
                                        <td>
                                            {m.contrat && (
                                                <div><Badge bg="secondary">Contrat:</Badge> {m.contrat.referenceContrat}</div>
                                            )}
                                            {m.devis && (
                                                <div><Badge bg="secondary">Devis:</Badge> {m.devis.referenceDevis}</div>
                                            )}
                                        </td>
                                        <td>
                                            <Dropdown 
                                                drop={getDropDirection(index)} 
                                                align="end"
                                            >
                                                <Dropdown.Toggle 
                                                    variant="light" 
                                                    size="sm" 
                                                    id={`dropdown-mission-${m.id}`}
                                                >
                                                    Actions
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu 
                                                    className="dropdown-menu-compact" 
                                                    style={{ maxHeight: '80vh', overflowY: 'auto', width: '280px' }}
                                                    popperConfig={{ 
                                                        strategy: 'fixed',
                                                        modifiers: [
                                                            {
                                                                name: 'preventOverflow',
                                                                options: {
                                                                    boundary: 'viewport',
                                                                    padding: 8
                                                                }
                                                            }
                                                        ]
                                                    }}
                                                >
                                                    {/* Actions principales */}
                                                    <Dropdown.Header>Actions principales</Dropdown.Header>
                                                    <div className="d-flex flex-wrap">
                                                        <Dropdown.Item onClick={() => navigate(`/missions/${m.id}`)} className="w-50 py-2">
                                                            <i className="bi bi-eye"></i> Détails
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => navigate(`/missions/edit/${m.id}`)} className="w-50 py-2">
                                                            <i className="bi bi-pencil"></i> Éditer
                                                        </Dropdown.Item>
                                                    </div>
                                                    <Dropdown.Item onClick={() => handleDelete(m.id)} className="text-danger py-2">
                                                        <i className="bi bi-trash"></i> Supprimer
                                                    </Dropdown.Item>
                                                    
                                                    {/* Gestion des agents */}
                                                    <Dropdown.Divider />
                                                    <Dropdown.Header>Gestion des agents</Dropdown.Header>
                                                    <div className="d-flex flex-wrap">
                                                        <Dropdown.Item onClick={() => askAndCall("Affecter un agent", MissionService.assignAgents, m.id)} className="w-50 py-2">
                                                            <i className="bi bi-person-plus"></i> Affecter
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => askAndCall("Retirer un agent", (mid, aid) => MissionService.retirerAgent(mid, aid), m.id)} className="w-50 py-2">
                                                            <i className="bi bi-person-dash"></i> Retirer
                                                        </Dropdown.Item>
                                                    </div>
                                                    
                                                    {/* Planification et localisation */}
                                                    <Dropdown.Divider />
                                                    <Dropdown.Header>Planification/Localisation</Dropdown.Header>
                                                    <div className="d-flex flex-wrap">
                                                        <Dropdown.Item onClick={() => askAndCall("Associer planning", MissionService.assignPlanning, m.id)} className="w-50 py-2">
                                                            <i className="bi bi-calendar-plus"></i> Planning
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => askAndCall("Associer site", MissionService.assignSite, m.id)} className="w-50 py-2">
                                                            <i className="bi bi-geo-alt"></i> Site
                                                        </Dropdown.Item>
                                                    </div>
                                                    
                                                    {/* Documents et finance */}
                                                    <Dropdown.Divider />
                                                    <Dropdown.Header>Documents et finance</Dropdown.Header>
                                                    <div className="d-flex flex-wrap">
                                                        <Dropdown.Item onClick={() => askAndCall("Associer contrat", (mid, cid) => MissionService.assignContrat(mid, cid), m.id)} className="w-50 py-2">
                                                            <i className="bi bi-file-earmark-text"></i> Contrat
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => askAndCall("Associer contrat de travail", (mid, cid) => MissionService.assignContratTravail(mid, cid), m.id)} className="w-50 py-2">
                                                            <i className="bi bi-file-earmark-person"></i> Contrat travail
                                                        </Dropdown.Item>
                                                    </div>
                                                    <div className="d-flex flex-wrap">
                                                        <Dropdown.Item onClick={() => askAndCall("Associer facture", (mid, fid) => MissionService.assignFacture(mid, fid), m.id)} className="w-50 py-2">
                                                            <i className="bi bi-receipt"></i> Facture
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => askAndCall("Associer rapport", (mid, rid) => MissionService.assignRapport(mid, rid), m.id)} className="w-50 py-2">
                                                            <i className="bi bi-file-text"></i> Rapport
                                                        </Dropdown.Item>
                                                    </div>
                                                    
                                                    {/* Géolocalisation */}
                                                    <Dropdown.Divider />
                                                    <Dropdown.Header>Géolocalisation</Dropdown.Header>
                                                    <div className="d-flex flex-wrap">
                                                        <Dropdown.Item 
                                                            onClick={() => {
                                                                if (window.confirm("Associer une géolocalisation à cette mission ?")) {
                                                                    MissionService.associerGeoloc(m.id)
                                                                        .then(() => {
                                                                            alert("Géolocalisation associée avec succès");
                                                                            refreshData();
                                                                        })
                                                                        .catch(e => alert("Erreur : " + e.response?.data?.message || e.message));
                                                                }
                                                            }} 
                                                            className="w-50 py-2"
                                                        >
                                                            <i className="bi bi-geo-alt-fill"></i> Associer
                                                        </Dropdown.Item>
                                                        <Dropdown.Item 
                                                            onClick={() => {
                                                                if (window.confirm("Dissocier la géolocalisation de cette mission ?")) {
                                                                    MissionService.dissocierGeoloc(m.id)
                                                                        .then(() => {
                                                                            alert("Géolocalisation dissociée avec succès");
                                                                            refreshData();
                                                                        })
                                                                        .catch(e => alert("Erreur : " + e.response?.data?.message || e.message));
                                                                }
                                                            }} 
                                                            className="w-50 py-2"
                                                        >
                                                            <i className="bi bi-geo-alt-fill text-danger"></i> Dissocier
                                                        </Dropdown.Item>
                                                    </div>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    
                    {/* Pagination */}
                    <Row className="mt-3">
                        <Col md={6}>
                            <div className="text-muted">
                                Affichage de {indexOfFirstMission + 1} à {Math.min(indexOfLastMission, filteredMissions.length)} sur {filteredMissions.length} missions
                            </div>
                        </Col>
                        <Col md={6} className="d-flex justify-content-end">
                            <Pagination className="mb-0">
                                {renderPaginationItems()}
                            </Pagination>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}
