import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ZoneService from "../../services/ZoneService";
import "../../styles/ZoneList.css";

const ZoneList = () => {
    const [zones, setZones] = useState([]);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        ZoneService.getAllZones()
            .then(res => setZones(res.data))
            .catch(err => setError("Impossible de charger les zones."));
    }, []);

    const filtered = zones.filter(z =>
        z.nom.toLowerCase().includes(filter.toLowerCase())
    );

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="zone-list-container">
            <div className="controls">
                <h2>Zones de travail</h2>
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Recherche nom..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <Link to="/zones/create" className="btn add-btn">
                    ➕ Nouvelle zone
                </Link>
            </div>

            <div className="table-wrapper">
                <table className="zone-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Ville</th>
                        <th>Code postal</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((z, i) => (
                        <tr key={z.id}>
                            <td>{i + 1}</td>
                            <td>{z.nom}</td>
                            <td>{z.typeZone}</td>
                            <td>{z.ville || "–"}</td>
                            <td>{z.codePostal || "–"}</td>
                            <td className="actions">
                                <Link to={`/zones/${z.id}`} className="btn view">Voir</Link>
                                <Link to={`/zones/edit/${z.id}`} className="btn edit">Modifier</Link>
                                <button
                                    className="btn delete"
                                    onClick={() => {
                                        if (window.confirm(`Supprimer la zone « ${z.nom} » ?`)) {
                                            ZoneService.deleteZone(z.id)
                                                .then(() => setZones(zones.filter(x => x.id !== z.id)));
                                        }
                                    }}
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr><td colSpan="6" className="no-data">Aucune zone trouvée</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ZoneList;