// src/components/agents/AgentDetail.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import AgentService from "../../services/AgentService";
import "../../styles/AgentDetail.css";

const AgentDetail = () => {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [error, setError] = useState(null);

    const fetchAgent = useCallback(() => {
        AgentService.getAgentById(id)
            .then(({ data }) => setAgent(data))
            .catch(() => setError("Impossible de charger l'agent."));
    }, [id]);

    useEffect(() => { fetchAgent(); }, [fetchAgent]);

    if (error)  return <p className="error">{error}</p>;
    if (!agent) return <p>Chargement…</p>;

    return (
        <div className="agent-detail">
            <h2>👮 Profil de {agent.nom} {agent.prenom}</h2>

            <div className="info-block">
                <p><strong>Email :</strong> {agent.email}</p>
                <p><strong>Téléphone :</strong> {agent.telephone || "N/A"}</p>
                <p><strong>Adresse :</strong> {agent.adresse || "N/A"}</p>
                <p><strong>Date de naissance :</strong> {agent.dateNaissance || "N/A"}</p>
                <p><strong>Statut :</strong> {agent.statut}</p>
                <p><strong>Rôle :</strong> {agent.role}</p>
            </div>

            <section>
                <h3>📍 Zones de travail (IDs)</h3>
                {agent.zonesDeTravailIds?.length > 0 ? (
                    <ul>
                        {agent.zonesDeTravailIds.map(zId => (
                            <li key={zId}>Zone #{zId}</li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucune zone assignée</p>
                )}
            </section>

            <section>
                <h3>📋 Missions (IDs)</h3>
                {agent.missionsIds?.length > 0 ? (
                    <ul>
                        {agent.missionsIds.map(mId => (
                            <li key={mId}>
                                Mission #{mId}{" "}
                                <Link to={`/missions/${mId}`}>🔍 détails</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucune mission assignée</p>
                )}
            </section>

            <section>
                <h3>⏱ Disponibilités (IDs)</h3>
                {agent.disponibilitesIds?.length > 0 ? (
                    <ul>
                        {agent.disponibilitesIds.map(dId => (
                            <li key={dId}>Disponibilité #{dId}</li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucune disponibilité</p>
                )}
            </section>

            <section>
                <h3>💳 Cartes professionnelles (IDs)</h3>
                {agent.cartesProfessionnellesIds?.length > 0 ? (
                    <ul>
                        {agent.cartesProfessionnellesIds.map(cId => (
                            <li key={cId}>Carte #{cId}</li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucune carte pro</p>
                )}
            </section>

            <section>
                <h3>🎓 Diplômes SSIAP (IDs)</h3>
                {agent.diplomesSSIAPIds?.length > 0 ? (
                    <ul>
                        {agent.diplomesSSIAPIds.map(dId => (
                            <li key={dId}>Diplôme #{dId}</li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucun diplôme SSIAP</p>
                )}
            </section>

            <section>
                <h3>📄 Contrats de travail (IDs)</h3>
                {agent.contratsDeTravailIds?.length > 0 ? (
                    <ul>
                        {agent.contratsDeTravailIds.map(ctId => (
                            <li key={ctId}>Contrat #{ctId}</li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucun contrat</p>
                )}
            </section>

            <section>
                <h3>🔔 Notifications (IDs)</h3>
                {agent.notificationsIds?.length > 0 ? (
                    <ul>
                        {agent.notificationsIds.map(nId => (
                            <li key={nId}>Notification #{nId}</li>
                        ))}
                    </ul>
                ) : (
                    <p>🚫 Aucune notification</p>
                )}
            </section>

            <Link to="/agents" className="back-link">⬅ Retour à la liste</Link>
        </div>
    );
};

export default AgentDetail;
