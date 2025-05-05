import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import "../../styles/ZoneDetail.css";

const ZoneDetail = () => {
    const { id } = useParams();
    const [zone, setZone] = useState(null);
    const [error, setError] = useState(null);

    const fetch = useCallback(() => {
        ZoneService.getZoneById(id)
            .then(res => setZone(res.data))
            .catch(() => setError("Impossible de charger la zone."));
    }, [id]);

    useEffect(() => { fetch(); }, [fetch]);
    if (error) return <p className="error">{error}</p>;
    if (!zone)  return <p>Chargement…</p>;

    return (
        <div className="zone-detail">
            <h2>Zone : {zone.nom}</h2>
            <p><strong>Type :</strong> {zone.typeZone}</p>
            <p><strong>Ville :</strong> {zone.ville || '–'}</p>
            <p><strong>Code postal :</strong> {zone.codePostal || '–'}</p>
            <p><strong>Région :</strong> {zone.region || '–'}</p>
            <p><strong>Pays :</strong> {zone.pays || '–'}</p>

            <h3>Agents attachés</h3>
            {zone.agents.length > 0 ? (
                <ul>
                    {zone.agents.map(a => (
                        <li key={a.id}>
                            <Link to={`/agents/${a.id}`}>{a.nom} {a.prenom}</Link>
                        </li>
                    ))}
                </ul>
            ) : <p>— Aucun agent —</p>}

            <Link to="/zones" className="back-btn">⬅ Retour</Link>
        </div>
    );
};

export default ZoneDetail;