import React, { useState } from "react";
import MissionService from "../../services/MissionService";
import { Button, Modal, Spinner } from 'react-bootstrap';

const DeleteMission = ({ missionId, onDeleteSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleDelete = () => {
    setIsDeleting(true);
    MissionService.deleteMission(missionId)
      .then(() => {
        onDeleteSuccess && onDeleteSuccess(); // Rafraîchir la liste des missions
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression de la mission", error);
        alert("Erreur lors de la suppression de la mission");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <>
      <Button 
        variant="danger" 
        size="sm" 
        onClick={handleShow} 
        className="w-100"
      >
        <i className="bi bi-trash"></i> Supprimer
      </Button>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation de suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Voulez-vous vraiment supprimer cette mission ? Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Suppression...
              </>
            ) : (
              <>Supprimer</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteMission;
