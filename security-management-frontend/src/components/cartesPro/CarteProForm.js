import React from "react";
import "../../styles/CarteProForm.css";

const CarteProForm = ({ title, data, setData, onSubmit, error }) => (
    <div className="carte-form-container">
        <h2>{title} une carte pro</h2>
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
                Type de carte
                <select
                    name="typeCarte"
                    value={data.typeCarte}
                    onChange={e => setData({ ...data, typeCarte: e.target.value })}
                    required
                >
                    <option>SSP</option>
                    <option>ISSIAP</option>
                    {/* adapte aux valeurs de ton enum TypeCarteProfessionnelle */}
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
                Date début
                <input
                    type="date"
                    name="dateDebut"
                    value={data.dateDebut}
                    onChange={e => setData({ ...data, dateDebut: e.target.value })}
                    required
                />
            </label>

            <label>
                Date fin
                <input
                    type="date"
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

export default CarteProForm;
