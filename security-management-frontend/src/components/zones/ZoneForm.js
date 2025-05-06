import React from "react";
import "../../styles/ZoneForm.css";

const ZoneForm = ({ title, data, setData, onSubmit, error, agents, selectedAgents, setSelectedAgents }) => {
    // Fonction pour gérer la sélection/désélection des agents
    const handleAgentSelection = (agentId) => {
        if (selectedAgents.includes(agentId)) {
            setSelectedAgents(selectedAgents.filter(id => id !== agentId));
        } else {
            setSelectedAgents([...selectedAgents, agentId]);
        }
    };

    return (
        <div className="zone-form-container">
            <h2>{title} une zone</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={onSubmit}>
                <label>
                    Nom
                    <input
                        name="nom"
                        value={data.nom}
                        onChange={e => setData({ ...data, nom: e.target.value })}
                        required
                    />
                </label>

                <label>
                    Type
                    <select
                        name="typeZone"
                        value={data.typeZone}
                        onChange={e => setData({ ...data, typeZone: e.target.value })}
                    >
                        <option value="VILLE">VILLE</option>
                        <option value="DEPARTEMENT">DEPARTEMENT</option>
                        <option value="REGION">REGION</option>
                        <option value="CODE_POSTAL">CODE_POSTAL</option>
                    </select>
                </label>

                <label>
                    Code Postal
                    <input
                        name="codePostal"
                        value={data.codePostal}
                        onChange={e => setData({ ...data, codePostal: e.target.value })}
                    />
                </label>

                <label>
                    Ville
                    <input
                        name="ville"
                        value={data.ville}
                        onChange={e => setData({ ...data, ville: e.target.value })}
                    />
                </label>

                <label>
                    Département
                    <input
                        name="departement"
                        value={data.departement}
                        onChange={e => setData({ ...data, departement: e.target.value })}
                    />
                </label>

                <label>
                    Région
                    <input
                        name="region"
                        value={data.region}
                        onChange={e => setData({ ...data, region: e.target.value })}
                    />
                </label>

                <label>
                    Pays
                    <input
                        name="pays"
                        value={data.pays}
                        onChange={e => setData({ ...data, pays: e.target.value })}
                    />
                </label>

                {/* Section pour affecter des agents */}
                <div className="agents-section">
                    <h3>Affecter des agents à cette zone</h3>
                    {agents && agents.length > 0 ? (
                        <div className="agents-list">
                            {agents.map(agent => (
                                <div key={agent.id} className="agent-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`agent-${agent.id}`}
                                        checked={selectedAgents.includes(agent.id)}
                                        onChange={() => handleAgentSelection(agent.id)}
                                    />
                                    <label htmlFor={`agent-${agent.id}`}>
                                        {agent.nom} {agent.prenom}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Aucun agent disponible</p>
                    )}
                </div>

                <button type="submit" className="btn submit-btn">
                    {title}
                </button>
            </form>
        </div>
    );
};

export default ZoneForm;
