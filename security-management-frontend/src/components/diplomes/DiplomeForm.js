import React, { useEffect } from "react";
import Select from "react-select";
import "../../styles/DiplomeForm.css";

const DiplomeForm = ({ title, data, setData, onSubmit, error, agents = [] }) => {
    // Transformer la liste des agents en options pour le select avec plus d'informations pertinentes
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
        <div className="diplome-form-container">
            <h2>{title} un diplôme SSIAP</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={onSubmit}>
                <label>
                    Agent *
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
                    Niveau SSIAP *
                    <select
                        name="niveau"
                        value={data.niveau}
                        onChange={e => setData({ ...data, niveau: e.target.value })}
                        required
                    >
                        <option value="SSIAP_1">SSIAP 1</option>
                        <option value="SSIAP_2">SSIAP 2</option>
                        <option value="SSIAP_3">SSIAP 3</option>
                    </select>
                </label>

                <label>
                    Date d'obtention
                    <input
                        type="date"
                        name="dateObtention"
                        value={data.dateObtention}
                        onChange={e => setData({ ...data, dateObtention: e.target.value })}
                    />
                </label>

                <label>
                    Date d'expiration
                    <input
                        type="date"
                        name="dateExpiration"
                        value={data.dateExpiration}
                        onChange={e => setData({ ...data, dateExpiration: e.target.value })}
                    />
                </label>

                <button type="submit" className="btn submit-btn">
                    {title}
                </button>
            </form>
        </div>
    );
};

export default DiplomeForm;
