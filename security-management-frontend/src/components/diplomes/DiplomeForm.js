import React from "react";
import "../../styles/DiplomeForm.css";

const DiplomeForm = ({ title, data, setData, onSubmit, error }) => (
    <div className="diplome-form-container">
        <h2>{title} un diplôme SSIAP</h2>
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
                Niveau SSIAP
                <select
                    name="niveau"
                    value={data.niveau}
                    onChange={e => setData({ ...data, niveau: e.target.value })}
                    required
                >
                    <option>SSIAP1</option>
                    <option>SSIAP2</option>
                    <option>SSIAP3</option>
                </select>
            </label>

            <label>
                Date d’obtention
                <input
                    type="date"
                    name="dateObtention"
                    value={data.dateObtention}
                    onChange={e => setData({ ...data, dateObtention: e.target.value })}
                />
            </label>

            <label>
                Date d’expiration
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

export default DiplomeForm;
