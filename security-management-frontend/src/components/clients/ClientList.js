import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClientService from "../../services/ClientService";

export default function ClientList() {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        ClientService.getAll()
            .then(data => setClients(data))
            .catch(console.error);
    }, []);

    const handleDelete = id => {
        if (!window.confirm("Supprimer ce client ?")) return;
        ClientService.remove(id)
            .then(() => setClients(prev => prev.filter(c => c.id !== id)))
            .catch(console.error);
    };

    return (
        <div>
            <h2>Liste des Clients</h2>
            <Link to="/clients/create">Créer un nouveau client</Link>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Tél.</th>
                    <th>Adresse</th>
                    <th>Ville</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {clients.map(c => (
                    <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.username}</td>
                        <td>{c.role}</td>
                        <td>{c.typeClient}</td>
                        <td>{c.email}</td>
                        <td>{c.nom || "-"}</td>
                        <td>{c.prenom || "-"}</td>
                        <td>{c.telephone || "-"}</td>
                        <td>{`${c.adresse || ""} ${c.codePostal || ""} ${c.ville || ""}`.trim() || "-"}</td>
                        <td>
                            <Link to={`/clients/${c.id}`}>Voir</Link>{" • "}
                            <Link to={`/clients/edit/${c.id}`}>Modifier</Link>{" • "}
                            <button onClick={() => handleDelete(c.id)}>Supprimer</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
