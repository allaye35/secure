// src/components/contrats/ContratList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                 from "react-router-dom";
import ContratService                  from "../../services/ContratService";
import DevisService                    from "../../services/DevisService";
import MissionService                  from "../../services/MissionService";

export default function ContratList() {
    const [contrats, setContrats] = useState([]);
    const [devisMap,    setDevisMap]    = useState({});
    const [missionsMap, setMissionsMap] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        // 1) Charger tous les contrats
        ContratService.getAll()
            .then(res => {
                const list = res.data;
                setContrats(list);

                // Extraire tous les devisId et charger leurs détails
                const devisIds = Array.from(
                    new Set(list.map(c => c.devisId).filter(Boolean))
                );
                Promise.all(devisIds.map(id =>
                    DevisService.getById(id)
                        .then(r => ({ id, dto: r.data }))
                        .catch(() => null)
                ))
                    .then(results => {
                        const map = {};
                        results.forEach(r => { if (r) map[r.id] = r.dto; });
                        setDevisMap(map);
                    });

                // Charger pour chaque contrat ses missions
                Promise.all(list.map(c =>
                    MissionService.getByContratId(c.id)
                        .then(r => ({ contratId: c.id, missions: r.data }))
                        .catch(() => ({ contratId: c.id, missions: [] }))
                ))
                    .then(results => {
                        const map = {};
                        results.forEach(r => { map[r.contratId] = r.missions; });
                        setMissionsMap(map);
                    });
            })
            .catch(err => console.error(err));
    }, []);

    const handleDelete = id => {
        if (window.confirm("Supprimer ce contrat ?")) {
            ContratService.remove(id)
                .then(() => setContrats(c => c.filter(x => x.id !== id)))
                .catch(err => console.error(err));
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>📑 Contrats</h2>
            <button onClick={() => navigate("/contrats/create")}>
                ➕ Créer un contrat
            </button>

            <table
                border="1"
                cellPadding="8"
                style={{ marginTop: 16, width: "100%" }}
            >
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Référence</th>
                    <th>Date signature</th>
                    <th>Durée</th>
                    <th>Devis (réf.)</th>
                    <th>1ᵉʳ Mission</th>
                    <th># Missions</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {contrats.map(c => {
                    const devis     = devisMap[c.devisId];
                    const missions  = missionsMap[c.id] || [];
                    return (
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.referenceContrat}</td>
                            <td>{c.dateSignature}</td>
                            <td>{c.dureeMois || "—"} mois</td>
                            <td>{devis ? devis.referenceDevis : "—"}</td>
                            <td>{missions[0]?.titreMission || "—"}</td>
                            <td>{missions.length}</td>
                            <td>
                                <button onClick={() => navigate(`/contrats/${c.id}`)}>👁</button>{" "}
                                <button onClick={() => navigate(`/contrats/edit/${c.id}`)}>✏</button>{" "}
                                <button onClick={() => handleDelete(c.id)} style={{ color: "red" }}>🗑</button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
