// src/components/sites/CreateSite.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                from "react-router-dom";
import SiteService                    from "../../services/SiteService";
import MissionService                 from "../../services/MissionService";
import Select                         from "react-select";

export default function CreateSite() {
    const nav = useNavigate();

    const [site, setSite] = useState({
        nom: "",
        numero: "",
        rue: "",
        codePostal: "",
        ville: "",
        departement: "",
        region: "",
        pays: "",
        missionsIds: []
    });
    const [missionsOptions, setMissionsOptions] = useState([]);
    const [error, setError]                     = useState("");

    // Charger la liste des missions existantes
    useEffect(() => {
        MissionService.getAllMissions()
            .then(res => {
                const opts = res.data.map(m => ({
                    value: m.id,
                    label: `#${m.id} – ${m.titre || "(sans titre)"}`
                }));
                setMissionsOptions(opts);
            })
            .catch(() => setError("Impossible de charger les missions"));
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setSite(s => ({ ...s, [name]: value }));
    };

    const handleMissionsChange = selected => {
        setSite(s => ({
            ...s,
            missionsIds: selected ? selected.map(opt => opt.value) : []
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        // Vérif minimales
        if (!site.nom.trim()) {
            setError("Le nom est obligatoire");
            return;
        }
        try {
            await SiteService.createSite(site);
            nav("/sites");
        } catch {
            setError("Erreur lors de la création du site");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>➕ Créer un site</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 16
                }}>
                    <input
                        name="nom"
                        placeholder="Nom *"
                        required
                        value={site.nom}
                        onChange={handleChange}
                    />
                    <input
                        name="numero"
                        placeholder="N°"
                        value={site.numero}
                        onChange={handleChange}
                    />
                    <input
                        name="rue"
                        placeholder="Rue"
                        value={site.rue}
                        onChange={handleChange}
                    />
                    <input
                        name="codePostal"
                        placeholder="Code postal"
                        value={site.codePostal}
                        onChange={handleChange}
                    />
                    <input
                        name="ville"
                        placeholder="Ville"
                        value={site.ville}
                        onChange={handleChange}
                    />
                    <input
                        name="departement"
                        placeholder="Département"
                        value={site.departement}
                        onChange={handleChange}
                    />
                    <input
                        name="region"
                        placeholder="Région"
                        value={site.region}
                        onChange={handleChange}
                    />
                    <input
                        name="pays"
                        placeholder="Pays"
                        value={site.pays}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginBottom: 24, minWidth: 300 }}>
                    <label style={{ display: "block", marginBottom: 8 }}>
                        Missions associées
                    </label>
                    <Select
                        isMulti
                        options={missionsOptions}
                        placeholder="Sélectionnez une ou plusieurs missions…"
                        onChange={handleMissionsChange}
                        noOptionsMessage={() => "Aucune mission disponible"}
                    />
                </div>

                <button type="submit">Enregistrer</button>
            </form>
        </div>
    );
}
