// src/components/sites/SiteDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SiteService from "../../services/SiteService";
import MissionService from "../../services/MissionService";

export default function SiteDetail() {
    const { id } = useParams();
    const nav    = useNavigate();

    const [site, setSite]         = useState(null);
    const [missions, setMissions] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Récupération du site
                const { data: siteData } = await SiteService.getSiteById(id);
                setSite(siteData);

                // Si des missions associées, on les charge
                if (Array.isArray(siteData.missionsIds) && siteData.missionsIds.length > 0) {
                    const fetches = siteData.missionsIds.map(mid =>
                        MissionService.getMissionById(mid).then(res => res.data)
                    );
                    const details = await Promise.all(fetches);
                    setMissions(details);
                } else {
                    setMissions([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleDelete = () => {
        if (!window.confirm("Supprimer ce site ?")) return;
        SiteService.deleteSite(id)
            .then(() => nav("/sites"))
            .catch(console.error);
    };

    if (loading || !site) {
        return <p>Chargement du site…</p>;
    }

    const fmtDate = d => new Date(d).toLocaleDateString();
    const fmtTime = t => t?.slice(0,5) || "-";

    return (
        <div style={{ padding: 20 }}>
            <h2>📍 Détail du site #{site.id}</h2>

            <section style={{ marginBottom: 24 }}>
                <h3>Infos générales</h3>
                <table cellPadding="6">
                    <tbody>
                    <tr><td><strong>Nom</strong></td><td>{site.nom}</td></tr>
                    <tr><td><strong>Adresse</strong></td><td>{site.numero} {site.rue}</td></tr>
                    <tr><td><strong>CP / Ville</strong></td><td>{site.codePostal} {site.ville}</td></tr>
                    <tr><td><strong>Département / Région</strong></td><td>{site.departement} — {site.region}</td></tr>
                    <tr><td><strong>Pays</strong></td><td>{site.pays}</td></tr>
                    <tr><td><strong>Total missions</strong></td><td>{site.missionsIds?.length ?? 0}</td></tr>
                    </tbody>
                </table>
            </section>

            <section style={{ marginBottom: 24 }}>
                <h3>Missions associées</h3>
                {missions.length === 0 ? (
                    <p><em>Aucune mission liée à ce site.</em></p>
                ) : (
                    <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f0f0f0' }}>
                        <tr>
                            <th>ID</th><th>Titre</th><th>Début</th><th>Fin</th><th>Statut</th><th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {missions.map(m => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td>{m.titre}</td>
                                <td>{fmtDate(m.dateDebut)} {fmtTime(m.heureDebut)}</td>
                                <td>{fmtDate(m.dateFin)} {fmtTime(m.heureFin)}</td>
                                <td>{m.statutMission}</td>
                                <td>
                                    <button onClick={() => nav(`/missions/${m.id}`)}>Voir</button>{' '}
                                    <button onClick={() => nav(`/missions/edit/${m.id}`)}>✏️</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>

            <div>
                <Link to="/sites">← Retour à la liste</Link>{' | '}
                <Link to={`/sites/edit/${site.id}`}>Modifier</Link>{' | '}
                <button onClick={handleDelete}>Supprimer</button>
            </div>
        </div>
    );
}
