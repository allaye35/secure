// src/components/missions/MissionDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MissionService from "../../services/MissionService";

export default function MissionDetail() {
    const { id } = useParams();
    const [mission, setMission] = useState(null);
    const [error, setError]     = useState("");

    useEffect(() => {
        MissionService.getMissionById(id)
            .then(({ data }) => setMission(data))
            .catch(() => setError("Impossible de charger la mission."));
    }, [id]);

    if (error)   return <p style={{ color: "red" }}>{error}</p>;
    if (!mission) return <p>Chargement…</p>;

    return (
        <div style={{ padding: 16 }}>
            <h2>📄 Détails de la Mission #{mission.id}</h2>

            <section>
                <h3>Infos générales</h3>
                <p><strong>Titre :</strong> {mission.titre}</p>
                <p><strong>Description :</strong> {mission.description}</p>
                <p>
                    <strong>Période :</strong>{" "}
                    {mission.dateDebut ?? "-"} ⏱ {mission.heureDebut ?? "-"}
                    &nbsp;→&nbsp;
                    {mission.dateFin   ?? "-"} ⏱ {mission.heureFin   ?? "-"}
                </p>
                <p><strong>Statut :</strong> {mission.statutMission}</p>
                <p><strong>Type :</strong> {mission.typeMission}</p>
                <p><strong>Nombre d’agents prévus :</strong> {mission.nombreAgents}</p>
                <p><strong>Quantité :</strong> {mission.quantite}</p>
            </section>

            <section>
                <h3>Tarification</h3>
                <p><strong>Tarif unitaire (HT) :</strong> {mission.tarif?.prixUnitaireHT ?? "-"} €</p>
                <p><strong>Montant HT :</strong> {mission.montantHT ?? "-"} €</p>
                <p><strong>Montant TVA :</strong> {mission.montantTVA ?? "-"} €</p>
                <p><strong>Montant TTC :</strong> {mission.montantTTC ?? "-"} €</p>
                <p><strong>Devis associé :</strong>
                    {mission.devis ? <Link to={`/devis/${mission.devis.id}`}>#{mission.devis.id}</Link> : "-"}
                </p>
            </section>

            <section>
                <h3>Relations</h3>
                <p>
                    <strong>Planning :</strong>{" "}
                    {mission.planning
                        ? <Link to={`/plannings/${mission.planning.id}`}>#{mission.planning.id}</Link>
                        : "-"}
                </p>
                <p>
                    <strong>Site :</strong>{" "}
                    {mission.site
                        ? <Link to={`/sites/${mission.site.id}`}>#{mission.site.id} – {mission.site.nom}</Link>
                        : "-"}
                </p>
                <p>
                    <strong>Géolocalisation :</strong>{" "}
                    {mission.geolocalisationGPS
                        ? `Lat ${mission.geolocalisationGPS.position.lat}, Lng ${mission.geolocalisationGPS.position.lng}`
                        : "-"}
                </p>
                <p>
                    <strong>Contrat :</strong>{" "}
                    {mission.contrat
                        ? <Link to={`/contrats/${mission.contrat.id}`}>#{mission.contrat.id}</Link>
                        : "-"}
                </p>
                <p>
                    <strong>Factures associées :</strong>{" "}
                    {mission.factures?.length > 0
                        ? mission.factures.map(f => <Link key={f.id} to={`/factures/${f.id}`}>#{f.id}</Link>).reduce((prev, curr) => [prev, ", ", curr])
                        : "-"}
                </p>
            </section>

            <section>
                <h3>Agents assignés</h3>
                {mission.agents?.length > 0 ? (
                    <ul>
                        {mission.agents.map(a => (
                            <li key={a.id}>
                                {a.nom} {a.prenom} – 📧 {a.email} – ☎ {a.telephone}{" "}
                                <Link to={`/agents/${a.id}`}>👀</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucun agent affecté</p>
                )}
            </section>

            <section>
                <h3>Rapports (intervention)</h3>
                {mission.rapports?.length > 0 ? (
                    <ul>
                        {mission.rapports.map(r => (
                            <li key={r.id}>
                                Rapport #{r.id} – {r.dateIntervention}{" "}
                                <Link to={`/rapports/${r.id}`}>👀</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucun rapport</p>
                )}
            </section>

            <section>
                <h3>Pointages</h3>
                {mission.pointages?.length > 0 ? (
                    <ul>
                        {mission.pointages.map(p => (
                            <li key={p.id}>
                                Pointage #{p.id} – {p.date} – {p.heureDebut} → {p.heureFin}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucun pointage</p>
                )}
            </section>

            <Link to="/missions">⬅ Retour à la liste des missions</Link>
        </div>
    );
}
