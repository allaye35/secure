// src/components/missions/ActionSelectionModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

/**
 * Composant générique de modal pour sélectionner un élément dans une liste
 * Plutôt que de demander un ID, on propose une liste d'éléments avec des informations pertinentes
 */
const ActionSelectionModal = ({ 
    show, 
    handleClose, 
    title, 
    fetchItems, 
    onSelect,
    displayOption,
    placeHolder = "Sélectionner un élément...",
    itemType = "élément"
}) => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Charger les éléments quand le modal s'ouvre
    useEffect(() => {
        if (show) {
            setLoading(true);
            setError('');
            fetchItems()
                .then(data => {
                    // Si c'est response.data, extraire les données
                    const itemsList = Array.isArray(data) ? data : (data.data || []);
                    setItems(itemsList);
                })
                .catch(err => {
                    console.error('Erreur lors du chargement des données:', err);
                    setError(`Erreur lors du chargement des ${itemType}s: ${err.message || 'Erreur inconnue'}`);
                })
                .finally(() => setLoading(false));
        }
    }, [show, fetchItems, itemType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        // Si c'est une chaîne, on suppose que c'est l'ID. Sinon c'est l'objet complet.
        const itemId = typeof selectedItem === 'string' ? selectedItem : selectedItem.id;
        onSelect(itemId);
        setSelectedItem('');
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </Spinner>
                        <p>Chargement des données...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Sélectionnez un {itemType}</Form.Label>
                            <Form.Select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                required
                            >
                                <option value="">{placeHolder}</option>
                                {items.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {displayOption(item)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Annuler
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading || !selectedItem}
                >
                    Confirmer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ActionSelectionModal;
