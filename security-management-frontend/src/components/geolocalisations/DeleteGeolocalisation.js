import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const DeleteGeolocalisation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = () => {
    console.log(`Géolocalisation avec ID ${id} supprimée`);
    navigate("/geolocalisations");
  };

  return (
    <div>
      <h2>Supprimer la Géolocalisation</h2>
      <p>Es-tu sûr de vouloir supprimer cette géolocalisation ?</p>
      <button onClick={handleDelete}>Oui, supprimer</button>
      <button onClick={() => navigate("/geolocalisations")}>Annuler</button>
    </div>
  );
};

export default DeleteGeolocalisation;
