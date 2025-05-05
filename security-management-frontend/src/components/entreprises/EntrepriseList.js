// src/components/entreprises/EntrepriseList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EntrepriseService from "../../services/EntrepriseService";

export default function EntrepriseList() {
    const [entreprises, setEntreprises] = useState([]);

    /* chargement initial */
    useEffect(() => {
        EntrepriseService.getAllEntreprises()
            .then(res => setEntreprises(res.data))
            .catch(err => console.error("Erreur chargement entreprises :", err));
    }, []);

    /* suppression */
    const handleDelete = id => {
        if (!window.confirm("Supprimer cette entreprise ?")) return;
        EntrepriseService.deleteEntreprise(id)
            .then(() => setEntreprises(old => old.filter(e => e.id !== id)))
            .catch(err => console.error("Erreur suppression :", err));
    };

    return (
        <div>
            <h2>Liste des Entreprises</h2>
            <Link to="/entreprises/create">
                <button>Ajouter une Entreprise</button>
            </Link>

            <table>
                <thead>
                <tr>
                    <th>Nom</th><th>SIRET</th><th>Représentant</th><th>N° Rue</th>
                    <th>Rue</th><th>Code Postal</th><th>Ville</th><th>Pays</th>
                    <th>Téléphone</th><th>Nb de Devis</th><th>Actions</th>
                </tr>
                </thead>

                <tbody>
                {Array.isArray(entreprises) && entreprises.length ? (
                    entreprises.map(e => (
                        <tr key={e.id}>
                            <td>{e.nom}</td>
                            <td>{e.siretPrestataire}</td>
                            <td>{e.representantPrestataire}</td>
                            <td>{e.numeroRue}</td>
                            <td>{e.rue}</td>
                            <td>{e.codePostal}</td>
                            <td>{e.ville}</td>
                            <td>{e.pays}</td>
                            <td>{e.telephone}</td>
                            <td>{e.devisList?.length ?? 0}</td>
                            <td>
                                <Link to={`/entreprises/${e.id}`}>Voir</Link>{" | "}
                                <Link to={`/entreprises/edit/${e.id}`}>Modifier</Link>{" | "}
                                <button onClick={() => handleDelete(e.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="11">Aucune entreprise disponible.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
