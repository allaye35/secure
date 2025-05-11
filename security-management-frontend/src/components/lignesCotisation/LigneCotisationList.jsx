import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LigneCotisationService from "../../services/LigneCotisationService";
import { Card, Table, Button, Badge, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import "../../styles/LigneCotisationList.css";

export default function LigneCotisationList() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        LigneCotisationService.getAll()
            .then(({ data }) => setList(data))
            .catch(() => setError("Erreur de chargement"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Supprimer cette ligne ?")) return;
        LigneCotisationService.delete(id)
            .then(() => {
                setList(l => l.filter(x => x.id !== id));
                // Toast notification could be added here
            })
            .catch(() => alert("Échec de la suppression"));
    };

    const filteredList = list.filter(item => 
        item.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ficheDePaieId.toString().includes(searchTerm)
    );

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Chargement...</span>
            </Spinner>
        </div>
    );

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Lignes de cotisation</h3>
                <Button 
                    variant="light" 
                    className="d-flex align-items-center" 
                    onClick={() => navigate("/lignes-cotisation/create")}
                >
                    <FaPlus className="me-2" /> Nouvelle ligne
                </Button>
            </Card.Header>
            
            <Card.Body>
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Rechercher par libellé ou ID de fiche..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
                
                <div className="table-responsive">
                    <Table striped hover responsive className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Libellé</th>
                                <th>Taux salarié</th>
                                <th>Montant salarié</th>
                                <th>Taux employeur</th>
                                <th>Montant employeur</th>
                                <th>Fiche ID</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-3 text-muted">
                                        Aucune ligne de cotisation trouvée
                                    </td>
                                </tr>
                            ) : filteredList.map(item => (
                                <tr key={item.id}>
                                    <td><Badge bg="secondary">{item.id}</Badge></td>
                                    <td title={item.libelle}>{item.libelle}</td>
                                    <td>{item.tauxSalarial}%</td>
                                    <td>{item.montantSalarial.toFixed(2)} €</td>
                                    <td>{item.tauxEmployeur}%</td>
                                    <td>{item.montantEmployeur.toFixed(2)} €</td>
                                    <td>
                                        <Badge bg="info">#{item.ficheDePaieId}</Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button variant="outline-info" size="sm" className="me-1" 
                                                onClick={() => navigate(`/lignes-cotisation/${item.id}`)}>
                                            <FaEye />
                                        </Button>
                                        <Button variant="outline-primary" size="sm" className="me-1" 
                                                onClick={() => navigate(`/lignes-cotisation/edit/${item.id}`)}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" 
                                                onClick={() => handleDelete(item.id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
            
            <Card.Footer className="text-muted">
                Total: {filteredList.length} ligne(s) de cotisation
            </Card.Footer>
        </Card>
    );
}
