import React from "react";
import MissionService from "../../services/MissionService"; // Import du service des missions
import { useNavigate } from "react-router-dom";

const DeleteMission = ({ missionId, onDeleteSuccess }) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    if (window.confirm("Voulez-vous vraiment supprimer cette mission ?")) {
      MissionService.deleteMission(missionId)
        .then(() => {
          alert("Mission supprimée avec succès !");
          onDeleteSuccess(); // Rafraîchir la liste des missions
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression de la mission", error);
        });
    }
  };

  return (
    <button onClick={handleDelete} style={{ backgroundColor: "red", color: "white" }}>
      Supprimer
    </button>
  );
};

export default DeleteMission;
