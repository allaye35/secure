import React, { useEffect } from "react";
import Select from "react-select";
import "../../styles/DisponibiliteForm.css";

const DisponibiliteForm = ({ title, data, setData, onSubmit, error, agents = [] }) => {
    // Transformer la liste des agents en options pour le select avec informations pertinentes
    const agentOptions = agents.map(agent => ({
        value: agent.id,
        label: `${agent.nom || ""} ${agent.prenom || ""} - ${agent.email || "Sans email"}${agent.telephone ? ` - Tél: ${agent.telephone}` : ""}`
    }));

    // Trouver l'option sélectionnée pour l'agent
    const selectedAgent = agentOptions.find(option => option.value === parseInt(data.agentId));
    
    // Log pour le débogage
    useEffect(() => {
        if (selectedAgent) {
            console.log("Agent sélectionné:", selectedAgent);
            console.log("data.agentId:", data.agentId, "type:", typeof data.agentId);
        }
    }, [selectedAgent, data.agentId]);

    return (
        <div className="dispo-form-container">
            <h2>{title} une disponibilité</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={onSubmit}>
                <label>
                    Agent
                    <Select
                        options={agentOptions}
                        value={selectedAgent}
                        onChange={(selected) => {
                            console.log("Sélection agent:", selected);
                            setData({ ...data, agentId: selected ? selected.value : "" });
                        }}
                        placeholder="Sélectionner un agent"
                        isSearchable
                        noOptionsMessage={() => "Aucun agent disponible"}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        required
                    />
                </label>

                <label>
                    Date de début
                    <input
                        type="datetime-local"
                        name="dateDebut"
                        value={data.dateDebut}
                        onChange={e => setData({ ...data, dateDebut: e.target.value })}
                        required
                    />
                </label>

                <label>
                    Date de fin
                    <input
                        type="datetime-local"
                        name="dateFin"
                        value={data.dateFin}
                        onChange={e => setData({ ...data, dateFin: e.target.value })}
                        required
                    />
                </label>

                <button type="submit" className="btn submit-btn">
                    {title}
                </button>
            </form>
        </div>
    );
};

export default DisponibiliteForm;
