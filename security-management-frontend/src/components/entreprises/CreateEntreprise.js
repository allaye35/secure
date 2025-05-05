// src/components/entreprises/CreateEntreprise.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EntrepriseService from "../../services/EntrepriseService";

const CreateEntreprise = () => {
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

  const handleChange = (e) => {
    setEntreprise({
      ...entreprise,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    EntrepriseService.createEntreprise(entreprise)
        .then(() => navigate("/entreprises"))
        .catch(err => console.error("Erreur de création :", err));
  };

  return (
      <div>
        <h2>Créer une Entreprise</h2>
        <form onSubmit={handleSubmit}>
          <label>Nom :</label>
          <input
              type="text"
              name="nom"
              value={entreprise.nom}
              onChange={handleChange}
              required
          />

          <label>SIRET :</label>
          <input
              type="text"
              name="siretPrestataire"
              value={entreprise.siretPrestataire}
              onChange={handleChange}
              required
          />

          <label>Représentant :</label>
          <input
              type="text"
              name="representantPrestataire"
              value={entreprise.representantPrestataire}
              onChange={handleChange}
              required
          />

          <label>N° Rue :</label>
          <input
              type="text"
              name="numeroRue"
              value={entreprise.numeroRue}
              onChange={handleChange}
              required
          />

          <label>Rue :</label>
          <input
              type="text"
              name="rue"
              value={entreprise.rue}
              onChange={handleChange}
              required
          />

          <label>Code Postal :</label>
          <input
              type="text"
              name="codePostal"
              value={entreprise.codePostal}
              onChange={handleChange}
              required
          />

          <label>Ville :</label>
          <input
              type="text"
              name="ville"
              value={entreprise.ville}
              onChange={handleChange}
              required
          />

          <label>Pays :</label>
          <input
              type="text"
              name="pays"
              value={entreprise.pays}
              onChange={handleChange}
              required
          />

          <label>Téléphone :</label>
          <input
              type="text"
              name="telephone"
              value={entreprise.telephone}
              onChange={handleChange}
              required
          />

          <button type="submit">Créer</button>
        </form>
      </div>
  );
};

export default CreateEntreprise;
