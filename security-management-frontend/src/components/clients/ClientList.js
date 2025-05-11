// src/components/clients/ClientList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClientService from "../../services/ClientService";

export default function ClientList() {
  /* ─── state ────────────────────────────────────────────── */
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ─── fetch all on mount ───────────────────────────────── */
  useEffect(() => {
    let mounted = true;                         // évite le setState après un unmount
    ClientService.getAll()
      .then(res => {
        if (mounted) {
          setClients(res.data);                 // Axios → res.data = ton tableau
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    return () => (mounted = false);             // clean up
  }, []);

  /* ─── delete one client ───────────────────────────────── */
  const handleDelete = async id => {
    if (!window.confirm("Supprimer ce client ?")) return;
    try {
      await ClientService.delete(id);           // .delete existe bien dans le service :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── UI states ───────────────────────────────────────── */
  if (loading)      return <p>Chargement…</p>;
  if (!clients.length)
    return (
      <div>
        <h2>Liste des Clients</h2>
        <p>Aucun client pour l’instant.</p>
        <Link to="/clients/create">Créer un nouveau client</Link>
      </div>
    );

  /* ─── render table ─────────────────────────────────────── */
  return (
    <div>
      <h2>Liste des Clients</h2>
      <Link to="/clients/create">Créer un nouveau client</Link>

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Rôle</th>
            <th>Type</th>
            <th>Email</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Tél.</th>
            <th>Adresse</th>
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
              <td>{c.nom || "—"}</td>
              <td>{c.prenom || "—"}</td>
              <td>{c.telephone || "—"}</td>
              <td>
                {[c.adresse, c.codePostal, c.ville].filter(Boolean).join(" ") ||
                  "—"}
              </td>
              <td>
                <Link to={`/clients/${c.id}`}>Voir</Link>{" • "}
                <Link to={`/clients/edit/${c.id}`}>Modifier</Link>{" • "}
                <button
                  onClick={() => handleDelete(c.id)}
                  className="btn btn-link p-0"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
