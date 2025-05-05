import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Importer useNavigate pour la navigation et useParams pour récupérer l'ID

const DeleteAgent = () => {
  const { id } = useParams(); // Récupérer l'ID de l'agent à partir de l'URL
  const navigate = useNavigate(); // Pour naviguer après la suppression
  const [isDeleted, setIsDeleted] = useState(false); // État pour savoir si l'agent est supprimé ou non

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setIsDeleted(true);
        // Rediriger après la suppression
        setTimeout(() => {
          navigate('/agents'); // Par exemple, après suppression, on revient à la liste des agents
        }, 2000); // Attente de 2 secondes pour l'animation
      } else {
        alert('Erreur lors de la suppression de l\'agent');
      }
    } catch (error) {
      console.error('Erreur de suppression:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  return (
    <div>
      {isDeleted ? (
        <h2>Agent supprimé avec succès!</h2>
      ) : (
        <>
          <h2>Êtes-vous sûr de vouloir supprimer cet agent?</h2>
          <button onClick={handleDelete}>Confirmer la suppression</button>
          <button onClick={() => navigate('/agents')}>Annuler</button>
        </>
      )}
    </div>
  );
};

export default DeleteAgent;
