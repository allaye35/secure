import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import "../../styles/ZoneDetail.css";

const ZoneDetail = () => {
    const { id } = useParams();
    const [zone, setZone] = useState(null);
    const [error, setError] = useState(null);
    const [agents, setAgents] = useState([]);

    const fetchZone = useCallback(() => {
        ZoneService.getById(id)
            .then(res => setZone(res.data))
            .catch(err => {
                console.error("Erreur lors du chargement de la zone:", err);
                setError("Impossible de charger la zone.");
            });
    }, [id]);

    const fetchAgents = useCallback(() => {
        if (zone) {
            ZoneService.getAgentsForZone(id)
                .then(res => setAgents(res.data))
                .catch(err => {
                    console.error("Erreur lors du chargement des agents:", err);
                });
        }
    }, [id, zone]);

    useEffect(() => { 
        fetchZone(); 
    }, [fetchZone]);

    useEffect(() => {
        if (zone) {
            fetchAgents();
        }
    }, [zone, fetchAgents]);

    if (error) return <p className="error">{error}</p>;
    if (!zone)  return <p>Chargement…</p>;

    return (
        <div className="zone-detail">
            <h2>Zone : {zone.nom}</h2>
            <p><strong>Type :</strong> {zone.typeZone}</p>
            <p><strong>Ville :</strong> {zone.ville || '–'}</p>
            <p><strong>Code postal :</strong> {zone.codePostal || '–'}</p>
            <p><strong>Département :</strong> {zone.departement || '–'}</p>
            <p><strong>Région :</strong> {zone.region || '–'}</p>
            <p><strong>Pays :</strong> {zone.pays || '–'}</p>

            <h3>Agents attachés</h3>
            {agents && agents.length > 0 ? (
                <ul>
                    {agents.map(a => (
                        <li key={a.id}>
                            <Link to={`/agents/${a.id}`}>{a.nom} {a.prenom}</Link>
                        </li>
                    ))}
                </ul>
            ) : <p>— Aucun agent —</p>}

            <div className="button-group">
                <Link to={`/zones/edit/${id}`} className="btn edit-btn">Modifier</Link>
                <Link to="/zones" className="btn back-btn">⬅ Retour</Link>
            </div>
        </div>
    );
};

export default ZoneDetail;