// src/components/sites/EditSite.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams }      from "react-router-dom";
import SiteService                     from "../../services/SiteService";
import MissionService                  from "../../services/MissionService";
import Select                          from "react-select";

export default function EditSite() {
    const { id }   = useParams();
    const navigate = useNavigate();

    // 1) État local pour le site (avec missionsIds, même nom que dans SiteCreateDto)
    const [site, setSite] = useState({
        nom:         "",
        numero:      "",
        rue:         "",
        codePostal:  "",
        ville:       "",
        departement: "",
        region:      "",
        pays:        "",
        missionsIds: []
    });

    // 2) Les options pour React‑Select
    const [missionsOptions, setMissionsOptions] = useState([]);

    useEffect(() => {
        // a) Charger le site existant
        SiteService.getSiteById(id)
            .then(res => {
                const dto = res.data;
                setSite({
                    nom:         dto.nom,
                    numero:      dto.numero,
                    rue:         dto.rue,
                    codePostal:  dto.codePostal,
                    ville:       dto.ville,
                    departement: dto.departement,
                    region:      dto.region,
                    pays:        dto.pays,
                    missionsIds: dto.missionsIds || []    // <-- impératif : missionsIds
                });
            })
            .catch(() => navigate("/sites"));

        // b) Charger toutes les missions pour peupler le select
        MissionService.getAllMissions()
            .then(res => {
                const opts = res.data.map(m => ({
                    value: m.id,
                    label: m.intitule || `Mission #${m.id}`
                }));
                setMissionsOptions(opts);
            })
            .catch(console.error);
    }, [id, navigate]);

    // Handler pour les champs texte
    const handleChange = e => {
        const { name, value } = e.target;
        setSite(s => ({ ...s, [name]: value }));
    };

    // Handler pour React‑Select (multi)
    const handleMissionsChange = selectedOptions => {
        setSite(s => ({
            ...s,
            missionsIds: selectedOptions
                ? selectedOptions.map(opt => opt.value)
                : []
        }));
    };

    // Soumission du formulaire
    const handleSubmit = e => {
        e.preventDefault();
        SiteService.updateSite(id, site)
            .then(() => navigate("/sites"))
            .catch(console.error);
    };

    // Valeurs par défaut pour React‑Select
    const defaultMissionValues = missionsOptions.filter(opt =>
        site.missionsIds.includes(opt.value)
    );

    return (
        <div style={{ padding: 20 }}>
            <h2>✏️ Modifier le site #{id}</h2>
            <form onSubmit={handleSubmit}>

                {/* Nom (requis) */}
                <div>
                    <label>
                        Nom*<br/>
                        <input
                            name="nom"
                            value={site.nom}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>

                {/* Les autres champs texte */}
                <div>
                    <label>
                        Numéro<br/>
                        <input
                            name="numero"
                            value={site.numero}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Rue<br/>
                        <input
                            name="rue"
                            value={site.rue}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Code postal<br/>
                        <input
                            name="codePostal"
                            value={site.codePostal}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Ville<br/>
                        <input
                            name="ville"
                            value={site.ville}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Département<br/>
                        <input
                            name="departement"
                            value={site.departement}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Région<br/>
                        <input
                            name="region"
                            value={site.region}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Pays<br/>
                        <input
                            name="pays"
                            value={site.pays}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                {/* Sélecteur multi‑missions */}
                <div style={{ marginTop: 16, minWidth: 300 }}>
                    <label style={{ display: "block", marginBottom: 8 }}>
                        Missions associées
                    </label>
                    <Select
                        isMulti
                        options={missionsOptions}
                        value={defaultMissionValues}
                        onChange={handleMissionsChange}
                        placeholder="Sélectionnez une ou plusieurs missions…"
                        noOptionsMessage={() => "Aucune mission disponible"}
                    />
                </div>

                <button type="submit" style={{ marginTop: 20 }}>
                    Enregistrer
                </button>
            </form>
        </div>
    );
}
