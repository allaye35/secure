import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ClientService from "../../services/ClientService";

export default function ClientDetail() {
    const { id } = useParams();
    const [client, setClient] = useState(null);

    useEffect(() => {
        ClientService.getById(id)
            .then(data => setClient(data))
            .catch(console.error);
    }, [id]);

    if (!client) return <p>Chargement…</p>;

    return (
        <div>
            <h2>Détails du client #{client.id}</h2>
            <ul>
                <li><strong>Username:</strong> {client.username}</li>
                <li><strong>Role:</strong> {client.role}</li>
                <li><strong>Type:</strong> {client.typeClient}</li>
                <li><strong>Nom:</strong> {client.nom || '-'}</li>
                <li><strong>Prénom:</strong> {client.prenom || '-'}</li>
                <li><strong>Entreprise:</strong> {client.siege || '-'}</li>
                <li><strong>Représentant:</strong> {client.representant || '-'}</li>
                <li><strong>SIRET:</strong> {client.numeroSiret || '-'}</li>
                <li><strong>Email:</strong> {client.email}</li>
                <li><strong>Téléphone:</strong> {client.telephone || '-'}</li>
                <li><strong>Adresse:</strong> {client.adresse || '-'}, {client.codePostal || ''} {client.ville || ''}</li>
                <li><strong>Pays:</strong> {client.pays || '-'}</li>
                <li><strong>Numéro Rue:</strong> {client.numeroRue || '-'}</li>
                <li><strong>Mode contact préféré:</strong> {client.modeContactPrefere || '-'}</li>
            </ul>
            <Link to="/clients">← Retour à la liste</Link>
        </div>
    );
}
