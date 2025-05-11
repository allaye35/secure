import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LigneCotisationService from "../../services/LigneCotisationService";
import { Card, Form, Button, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaPercentage, FaEuroSign, FaFileInvoice } from 'react-icons/fa';
import "../../styles/LigneCotisationForm.css";

export default function LigneCotisationForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(isEdit);

    const [dto, setDto] = useState({
        libelle: "",
        tauxSalarial: "",
        montantSalarial: "",
        tauxEmployeur: "",
        montantEmployeur: "",
        ficheDePaieId: ""
    });
    const [error, setError] = useState("");
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (isEdit) {
            LigneCotisationService.getById(id)
                .then(({ data }) => setDto({
                    libelle: data.libelle,
                    tauxSalarial: data.tauxSalarial,
                    montantSalarial: data.montantSalarial,
                    tauxEmployeur: data.tauxEmployeur,
                    montantEmployeur: data.montantEmployeur,
                    ficheDePaieId: data.ficheDePaieId
                }))
                .catch(() => setError("Impossible de charger la ligne de cotisation"))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleChange = e => {
        const { name, value } = e.target;
        setDto(d => ({ ...d, [name]: value }));
    };

    const handleSubmit = e => {
        const form = e.currentTarget;
        e.preventDefault();
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        
        setError("");
        setLoading(true);
        
        const payload = {
            ...dto,
            tauxSalarial: Number(dto.tauxSalarial),
            montantSalarial: Number(dto.montantSalarial),
            tauxEmployeur: Number(dto.tauxEmployeur),
            montantEmployeur: Number(dto.montantEmployeur),
            ficheDePaieId: Number(dto.ficheDePaieId)
        };
        
        const call = isEdit
            ? LigneCotisationService.update(id, payload)
            : LigneCotisationService.create(payload);        
            
        call
            .then(() => navigate("/lignes-cotisation"))
            .catch(err => setError(err.response?.data?.message || "Erreur lors de l'enregistrement"))
            .finally(() => setLoading(false));
    };

    if (isEdit && loading) {
        return (
            <div className="d-flex justify-content-center align-items-center my-5">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Chargement...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h3 className="mb-0">{isEdit ? "Modifier" : "Créer"} une ligne de cotisation</h3>
            </Card.Header>

            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Group controlId="libelle">
                                <Form.Label>Libellé <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    name="libelle"
                                    value={dto.libelle}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex: Cotisation retraite"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Le libellé est requis
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        
                        <Col md={4}>
                            <Form.Group controlId="ficheDePaieId">
                                <Form.Label>ID Fiche de paie <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><FaFileInvoice /></InputGroup.Text>
                                    <Form.Control
                                        name="ficheDePaieId"
                                        type="number"
                                        value={dto.ficheDePaieId}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: 123"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        L'ID de fiche de paie est requis
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="tauxSalarial">
                                <Form.Label>Taux salarié (%) <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        name="tauxSalarial"
                                        type="number"
                                        step="0.01"
                                        value={dto.tauxSalarial}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: 5.12"
                                    />
                                    <InputGroup.Text><FaPercentage /></InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Le taux salarial est requis
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group controlId="montantSalarial">
                                <Form.Label>Montant salarié (€) <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        name="montantSalarial"
                                        type="number"
                                        step="0.01"
                                        value={dto.montantSalarial}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: 150.50"
                                    />
                                    <InputGroup.Text><FaEuroSign /></InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Le montant salarial est requis
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group controlId="tauxEmployeur">
                                <Form.Label>Taux employeur (%) <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        name="tauxEmployeur"
                                        type="number"
                                        step="0.01"
                                        value={dto.tauxEmployeur}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: 8.32"
                                    />
                                    <InputGroup.Text><FaPercentage /></InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Le taux employeur est requis
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group controlId="montantEmployeur">
                                <Form.Label>Montant employeur (€) <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        name="montantEmployeur"
                                        type="number"
                                        step="0.01"
                                        value={dto.montantEmployeur}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: 230.75"
                                    />
                                    <InputGroup.Text><FaEuroSign /></InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Le montant employeur est requis
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-4">
                        <Button 
                            variant="secondary" 
                            className="d-flex align-items-center" 
                            onClick={() => navigate("/lignes-cotisation")}
                        >
                            <FaArrowLeft className="me-2" /> Annuler
                        </Button>
                        <Button 
                            variant="primary" 
                            className="d-flex align-items-center" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                            <FaSave className="me-2" /> {isEdit ? "Mettre à jour" : "Enregistrer"}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}
