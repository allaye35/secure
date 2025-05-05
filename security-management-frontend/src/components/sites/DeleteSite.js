import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const DeleteSite = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = () => {
    console.log(`Site avec ID ${id} supprimé`);
    navigate("/sites");
  };

  return (
    <div>
      <h2>Supprimer le Site</h2>
      <p>Es-tu sûr de vouloir supprimer ce site ?</p>
      <button onClick={handleDelete}>Oui, supprimer</button>
      <button onClick={() => navigate("/sites")}>Annuler</button>
    </div>
  );
};

export default DeleteSite;
