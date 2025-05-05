import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RapportService from "../../services/RapportService";

const DeleteRapport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rapport, setRapport] = useState(null);

  useEffect(() => {
    const fetchRapport = async () => {
      try {
        const response = await RapportService.getRapportById(id);
        setRapport(response.data);
      } catch (error) {
        console.error(" Erreur lors de la récupération du rapport :", error);
      }
    };

    fetchRapport();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer ce rapport ?")) {
      try {
        await RapportService.deleteRapport(id);
        alert(" Rapport supprimé avec succès !");
        navigate("/rapports");
      } catch (error) {
        console.error(" Erreur lors de la suppression du rapport :", error);
        alert(" Erreur lors de la suppression");
      }
    }
  };

  if (!rapport) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h2>Supprimer le Rapport</h2>
      <p><strong>Description :</strong> {rapport.description}</p>
      <p><strong>Agent :</strong> {rapport.agentNom}</p>
      <p><strong>Date d'Intervention :</strong> {rapport.dateIntervention}</p>

      <button onClick={handleDelete}>Confirmer la Suppression</button>
      <button onClick={() => navigate("/rapports")}>Annuler</button>
    </div>
  );
};

export default DeleteRapport;
