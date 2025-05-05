import React from "react";
import "../../styles/DisponibiliteForm.css";

const DisponibiliteForm = ({ title, data, setData, onSubmit, error }) => (
    <div className="dispo-form-container">
        <h2>{title} une disponibilité</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={onSubmit}>
            <label>
                Agent (ID)
                <input
                    type="number"
                    name="agentId"
                    min="1"
                    value={data.agentId}
                    onChange={e => setData({ ...data, agentId: e.target.value })}
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

export default DisponibiliteForm;
