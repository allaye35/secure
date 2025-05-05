import React from "react";
import "../../styles/ZoneForm.css";

const ZoneForm = ({ title, data, setData, onSubmit, error }) => (
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

            <button type="submit" className="btn submit-btn">
                {title}
            </button>
        </form>
    </div>
);

export default ZoneForm;
