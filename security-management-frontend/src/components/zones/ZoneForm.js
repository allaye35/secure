import React, { useState } from "react";
import "../../styles/ZoneForm.css";
import { Container, Row, Col, Form, Button, Card, InputGroup, Alert, Accordion, Badge } from "react-bootstrap";
import { FaSave, FaMapMarkerAlt, FaCity, FaGlobe, FaUsers, FaSearch, FaCheck } from "react-icons/fa";

const ZoneForm = ({ title, data, setData, onSubmit, error, agents, selectedAgents, setSelectedAgents }) => {
    // État local pour la recherche d'agents
    const [agentSearch, setAgentSearch] = useState("");
    
    // Fonction pour gérer la sélection/désélection des agents
    const handleAgentSelection = (agentId) => {
        if (selectedAgents.includes(agentId)) {
            setSelectedAgents(selectedAgents.filter(id => id !== agentId));
        } else {
            setSelectedAgents([...selectedAgents, agentId]);
        }
    };

    // Filtrer les agents basé sur la recherche
    const filteredAgents = agents && agents.filter(agent => 
        `${agent.nom} ${agent.prenom}`.toLowerCase().includes(agentSearch.toLowerCase())
    );

    // Sélectionner/désélectionner tous les agents
    const toggleAllAgents = () => {
        if (filteredAgents.length === 0) return;
        
        const allAgentIds = filteredAgents.map(agent => agent.id);
        const allSelected = filteredAgents.every(agent => selectedAgents.includes(agent.id));
        
        if (allSelected) {
            // Désélectionner tous les agents filtrés
            setSelectedAgents(selectedAgents.filter(id => !allAgentIds.includes(id)));
        } else {
            // Sélectionner tous les agents filtrés (en évitant les doublons)
            const newSelectedAgents = [...new Set([...selectedAgents, ...allAgentIds])];
            setSelectedAgents(newSelectedAgents);
        }
    };

    return (
        <Container className="zone-form-container py-4 px-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white">
                    <h2 className="text-center mb-0">
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        {title} une zone
                    </h2>
                </Card.Header>
                <Card.Body>                    {error && (
                        <Alert variant="danger" className="mb-4">
                            <div className="d-flex align-items-center">
                                <div className="me-3 fs-4">⚠️</div>
                                <div>
                                    <strong>Erreur de création:</strong>
                                    <p className="mb-0 mt-1">{error}</p>
                                </div>
                            </div>
                        </Alert>
                    )}
                    
                    <Form onSubmit={onSubmit} className="needs-validation">
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaMapMarkerAlt /></InputGroup.Text>
                                        <Form.Control
                                            name="nom"
                                            value={data.nom}
                                            onChange={e => setData({ ...data, nom: e.target.value })}
                                            placeholder="Nom de la zone"
                                            required
                                        />
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Donnez un nom descriptif à cette zone
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Type de zone <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="typeZone"
                                        value={data.typeZone}
                                        onChange={e => setData({ ...data, typeZone: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Sélectionner un type --</option>
                                        <option value="VILLE">Ville</option>
                                        <option value="DEPARTEMENT">Département</option>
                                        <option value="REGION">Région</option>
                                        <option value="CODE_POSTAL">Code postal</option>
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Le type définit la nature de la zone
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Code Postal</Form.Label>
                                    <Form.Control
                                        name="codePostal"
                                        value={data.codePostal || ''}
                                        onChange={e => setData({ ...data, codePostal: e.target.value })}
                                        placeholder="Ex: 75001"
                                        pattern="[0-9]{5}"
                                        title="Le code postal doit contenir 5 chiffres"
                                    />
                                </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ville</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaCity /></InputGroup.Text>
                                        <Form.Control
                                            name="ville"
                                            value={data.ville || ''}
                                            onChange={e => setData({ ...data, ville: e.target.value })}
                                            placeholder="Ex: Paris"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Département</Form.Label>
                                    <Form.Control
                                        name="departement"
                                        value={data.departement || ''}
                                        onChange={e => setData({ ...data, departement: e.target.value })}
                                        placeholder="Ex: Paris"
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Région</Form.Label>
                                            <Form.Control
                                                name="region"
                                                value={data.region || ''}
                                                onChange={e => setData({ ...data, region: e.target.value })}
                                                placeholder="Ex: Île-de-France"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Pays</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text><FaGlobe /></InputGroup.Text>
                                                <Form.Control
                                                    name="pays"
                                                    value={data.pays || ''}
                                                    onChange={e => setData({ ...data, pays: e.target.value })}
                                                    placeholder="Ex: France"
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <hr className="my-4" />

                        <Accordion defaultActiveKey="0" className="mb-4">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                    <FaUsers className="me-2" /> 
                                    Affectation d'agents
                                    {selectedAgents.length > 0 && (
                                        <Badge bg="primary" pill className="ms-2">
                                            {selectedAgents.length}
                                        </Badge>
                                    )}
                                </Accordion.Header>
                                <Accordion.Body>
                                    {agents && agents.length > 0 ? (
                                        <>
                                            <div className="d-flex justify-content-between mb-3">
                                                <InputGroup className="agent-search-bar">
                                                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Rechercher un agent..."
                                                        value={agentSearch}
                                                        onChange={e => setAgentSearch(e.target.value)}
                                                    />
                                                </InputGroup>
                                                
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    onClick={toggleAllAgents}
                                                    disabled={filteredAgents.length === 0}
                                                >
                                                    {filteredAgents.every(agent => selectedAgents.includes(agent.id)) ?
                                                    "Désélectionner tout" : "Sélectionner tout"}
                                                </Button>
                                            </div>

                                            {selectedAgents.length > 0 && (
                                                <div className="selected-agents mb-3">
                                                    <small className="text-muted d-block mb-2">Agents sélectionnés:</small>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {selectedAgents.map(agentId => {
                                                            const agent = agents.find(a => a.id === agentId);
                                                            if (!agent) return null;
                                                            
                                                            return (
                                                                <Badge 
                                                                    bg="primary" 
                                                                    key={agentId}
                                                                    className="p-2 d-flex align-items-center"
                                                                >
                                                                    {agent.nom} {agent.prenom}
                                                                    <Button 
                                                                        variant="link" 
                                                                        className="p-0 ms-1 text-white" 
                                                                        onClick={() => handleAgentSelection(agentId)}
                                                                        title="Retirer"
                                                                    >
                                                                        ×
                                                                    </Button>
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="agents-grid">
                                                {filteredAgents.length > 0 ? (
                                                    <Row>
                                                        {filteredAgents.map(agent => (
                                                            <Col md={4} key={agent.id} className="mb-2">
                                                                <Card 
                                                                    className={`agent-card ${selectedAgents.includes(agent.id) ? 'agent-selected' : ''}`}
                                                                    onClick={() => handleAgentSelection(agent.id)}
                                                                >
                                                                    <Card.Body className="d-flex align-items-center py-2">
                                                                        <div className={`agent-select-indicator me-2 ${selectedAgents.includes(agent.id) ? 'selected' : ''}`}>
                                                                            {selectedAgents.includes(agent.id) && <FaCheck />}
                                                                        </div>
                                                                        <div>
                                                                            {agent.nom} {agent.prenom}
                                                                        </div>
                                                                    </Card.Body>
                                                                </Card>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                ) : (
                                                    <Alert variant="light" className="text-center">
                                                        Aucun agent correspondant à votre recherche
                                                    </Alert>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <Alert variant="info">
                                            Aucun agent disponible pour l'affectation
                                        </Alert>
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                        <div className="d-flex justify-content-center mt-4">
                            <Button type="submit" variant="primary" size="lg" className="px-5">
                                <FaSave className="me-2" /> {title} la zone
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ZoneForm;
