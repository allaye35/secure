import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EntrepriseService from "../../services/EntrepriseService";

const EditEntreprise = () => {
  const { id } = useParams();
  const [entreprise, setEntreprise] = useState({
    nom: "",
    siretPrestataire: "",
    representantPrestataire: "",
    numeroRue: "",
    rue: "",
    codePostal: "",
    ville: "",
    pays: "",
    telephone: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    EntrepriseService.getEntrepriseById(id)
        .then(response => setEntreprise(response.data))
        .catch(error => console.error("Erreur de chargement", error));
  }, [id]);

  const handleChange = (e) => {
    setEntreprise({ ...entreprise, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    EntrepriseService.updateEntreprise(id, entreprise)
        .then(() => navigate("/entreprises"))
        .catch(error => console.error("Erreur de mise à jour", error));
  };

  return (
      <div>
        <h2>Modifier une Entreprise</h2>
        <form onSubmit={handleSubmit}>
          <label>Nom:</label>
          <input type="text" name="nom" value={entreprise.nom} onChange={handleChange} required />
          <label>SIRET:</label>
          <input type="text" name="siretPrestataire" value={entreprise.siretPrestataire} onChange={handleChange} />
          <label>Représentant:</label>
          <input type="text" name="representantPrestataire" value={entreprise.representantPrestataire} onChange={handleChange} />
          <label>Numéro Rue:</label>
          <input type="text" name="numeroRue" value={entreprise.numeroRue} onChange={handleChange} />
          <label>Rue:</label>
          <input type="text" name="rue" value={entreprise.rue} onChange={handleChange} />
          <label>Code Postal:</label>
          <input type="text" name="codePostal" value={entreprise.codePostal} onChange={handleChange} />
          <label>Ville:</label>
          <input type="text" name="ville" value={entreprise.ville} onChange={handleChange} />
          <label>Pays:</label>
          <input type="text" name="pays" value={entreprise.pays} onChange={handleChange} />
          <label>Téléphone:</label>
          <input type="text" name="telephone" value={entreprise.telephone} onChange={handleChange} required />

          <button type="submit">Mettre à jour</button>
        </form>
      </div>
  );
};

export default EditEntreprise;
