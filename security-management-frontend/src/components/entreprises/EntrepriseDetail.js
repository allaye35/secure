import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import EntrepriseService from "../../services/EntrepriseService";

export default function EntrepriseDetail() {
    const { id } = useParams();
    const [entreprise, setEntreprise] = useState(null);

    useEffect(() => {
        EntrepriseService.getEntrepriseById(id)
            .then(res => setEntreprise(res.data))
            .catch(err => console.error("Chargement entreprise :", err));
    }, [id]);

    if (!entreprise) return <p>Chargement…</p>;

    return (
        <section>
            <h2>Détails de l’entreprise</h2>

            <p><b>Nom :</b> {entreprise.nom}</p>
            <p><b>SIRET :</b> {entreprise.siretPrestataire}</p>
            <p><b>Représentant :</b> {entreprise.representantPrestataire}</p>
            <p><b>Adresse :</b> {entreprise.numeroRue} {entreprise.rue},
                {entreprise.codePostal} {entreprise.ville}, {entreprise.pays}</p>
            <p><b>Tél. :</b> {entreprise.telephone}</p>

            {entreprise.devisList?.length ? (
                <>
                    <h3>Devis associés</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Réf.</th><th>Description</th><th>Statut</th>
                        </tr>
                        </thead>
                        <tbody>
                        {entreprise.devisList.map(d => (
                            <tr key={d.id}>
                                <td>{d.referenceDevis}</td>
                                <td>{d.description}</td>
                                <td>{d.statut}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <p>Aucun devis.</p>
            )}

            <Link to="/entreprises">← Retour</Link>
        </section>
    );
}
