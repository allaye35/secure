import React, { useState, useEffect } from "react";
import "../../styles/CarteProForm.css";
import AgentService from "../../services/AgentService";

const CarteProForm = ({ title, data, setData, onSubmit, error }) => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Chargement de la liste des agents au montage du composant
    useEffect(() => {
        setLoading(true);
        AgentService.getAllAgents()
            .then(res => {
                setAgents(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="carte-form-container">
            <h2>{title} une carte pro</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={onSubmit}>
                <label>
                    Agent
                    <select
                        name="agentId"
                        value={data.agentId}
                        onChange={e => setData({ ...data, agentId: e.target.value })}
                        required
                    >
                        <option value="">Sélectionnez un agent</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                                {agent.nom} {agent.prenom} (ID: {agent.id})
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Type de carte
                    <select
                        name="typeCarte"
                        value={data.typeCarte}
                        onChange={e => setData({ ...data, typeCarte: e.target.value })}
                        required
                    >
                        <option value="CQP_APS">CQP APS</option>
                        <option value="GARDE_DU_CORPS">Garde du corps</option>
                        <option value="SECURITE_EVENEMENTIELLE">Sécurité événementielle</option>
                        <option value="SURVEILLANCE_TECHNIQUE">Surveillance technique</option>
                        <option value="RONDEUR">Rondeur</option>
                        <option value="CONTROLEUR_ACCÈS">Contrôleur d'accès</option>
                        <option value="AGENT_SURVEILLANCE_VIDEO">Agent surveillance vidéo</option>
                    </select>
                </label>

                <label>
                    Numéro de carte
                    <input
                        type="text"
                        name="numeroCarte"
                        value={data.numeroCarte}
                        onChange={e => setData({ ...data, numeroCarte: e.target.value })}
                        required
                    />
                </label>

                <label>
                    Date de début
                    <input
                        type="date"
                        name="dateDebut"
                        value={data.dateDebut}
                        onChange={e => setData({ ...data, dateDebut: e.target.value })}
                        required
                    />
                </label>

                <label>
                    Date de fin
                    <input
                        type="date"
                        name="dateFin"
                        value={data.dateFin}
                        onChange={e => setData({ ...data, dateFin: e.target.value })}
                        required
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? 'Chargement...' : `${title} la carte`}
                </button>
            </form>
        </div>
    );
};

export default CarteProForm;
