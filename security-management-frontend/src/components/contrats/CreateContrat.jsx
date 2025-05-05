// src/components/contrats/CreateContrat.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContratService from "../../services/ContratService";
import DevisService   from "../../services/DevisService";
import MissionService from "../../services/MissionService";
import ArticleService from "../../services/ArticleService";

export default function CreateContrat() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        referenceContrat:   "",
        dateSignature:      "",
        dureeMois:          "",
        taciteReconduction: false,
        preavisMois:        "",
        documentPdf:        null,
        devisId:            "",
        missionIds:         [],
        articleIds:         []
    });
    const [devisList,    setDevisList]    = useState([]);
    const [missionsList, setMissionsList] = useState([]);
    const [articlesList, setArticlesList] = useState([]);
    const [error,        setError]        = useState("");
    const [loading,      setLoading]      = useState(false);

    useEffect(() => {
        // Charger les données nécessaires avec gestion d'erreur
        const loadData = async () => {
            setLoading(true);
            try {
                const [devis, missions, articles] = await Promise.all([
                    DevisService.getAll(),
                    MissionService.getAllMissions(),
                    ArticleService.getAll()
                ]);
                
                setDevisList(devis.data || []);
                setMissionsList(missions.data || []);
                setArticlesList(articles.data || []);
            } catch (err) {
                console.error("Erreur chargement des données:", err);
                setError("Impossible de charger les données. Veuillez rafraîchir la page.");
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    const handleChange = e => {
        const { name, type, checked, files, options, value } = e.target;

        if (type === "file") {
            setForm(f => ({ ...f, documentPdf: files[0] }));
        } else if (type === "checkbox") {
            setForm(f => ({ ...f, [name]: checked }));
        } else if (type === "select-multiple") {
            const vals = Array.from(options)
                .filter(o => o.selected)
                .map(o => Number(o.value));
            setForm(f => ({ ...f, [name]: vals }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Créer l'objet JSON pour l'envoi
            const contratData = {
                referenceContrat: form.referenceContrat,
                dateSignature: form.dateSignature,
                dureeMois: form.dureeMois ? parseInt(form.dureeMois, 10) : null,
                taciteReconduction: form.taciteReconduction,
                preavisMois: form.preavisMois ? parseInt(form.preavisMois, 10) : null,
                devisId: parseInt(form.devisId, 10),
                missionIds: form.missionIds,
                articleIds: form.articleIds
            };

            // Si nous avons un fichier PDF, nous devons le convertir en base64
            if (form.documentPdf) {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(form.documentPdf);
                
                fileReader.onload = async () => {
                    try {
                        // Extrait la partie base64 du résultat (supprime le préfixe "data:application/pdf;base64,")
                        const base64Data = fileReader.result.split(',')[1];
                        
                        // Ajoute la représentation base64 du fichier à l'objet contrat
                        contratData.documentPdf = base64Data;
                        
                        // Envoi des données avec le document PDF encodé
                        await ContratService.create(contratData);
                        navigate("/contrats");
                    } catch (innerErr) {
                        console.error("Création contrat avec PDF :", innerErr.response || innerErr);
                        setError("Impossible de créer le contrat. Vérifiez les données et réessayez.");
                        setLoading(false);
                    }
                };
                
                fileReader.onerror = () => {
                    setError("Erreur lors de la lecture du fichier PDF.");
                    setLoading(false);
                };
            } else {
                // Sans fichier PDF, envoi direct de l'objet
                await ContratService.create(contratData);
                navigate("/contrats");
            }
        } catch (err) {
            console.error("Création contrat :", err.response || err);
            setError("Impossible de créer le contrat. Vérifiez les données et réessayez.");
            setLoading(false);
        }
    };

    if (loading && !articlesList.length && !devisList.length) {
        return <div>Chargement des données...</div>;
    }

    return (
        <div style={{ padding:20, maxWidth:600, margin:"0 auto" }}>
            <h2>➕ Créer un contrat</h2>
            {error && <p style={{ color:"red" }}>{error}</p>}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* Référence */}
                <label>Référence*<br/>
                    <input
                        name="referenceContrat"
                        value={form.referenceContrat}
                        onChange={handleChange}
                        required
                    />
                </label><br/>

                {/* Date de signature */}
                <label>Date de signature*<br/>
                    <input
                        name="dateSignature"
                        type="date"
                        value={form.dateSignature}
                        onChange={handleChange}
                        required
                    />
                </label><br/>

                {/* Durée */}
                <label>Durée (mois)<br/>
                    <input
                        name="dureeMois"
                        type="number"
                        value={form.dureeMois}
                        onChange={handleChange}
                    />
                </label><br/>

                {/* Tacite reconduction */}
                <label>
                    Tacite reconduction&nbsp;
                    <input
                        name="taciteReconduction"
                        type="checkbox"
                        checked={form.taciteReconduction}
                        onChange={handleChange}
                    />
                </label><br/>

                {/* Préavis */}
                <label>Préavis (mois)<br/>
                    <input
                        name="preavisMois"
                        type="number"
                        value={form.preavisMois}
                        onChange={handleChange}
                    />
                </label><br/>

                {/* PDF signé */}
                <label>Document PDF signé<br/>
                    <input
                        name="documentPdf"
                        type="file"
                        accept="application/pdf"
                        onChange={handleChange}
                    />
                </label><br/>

                {/* Devis */}
                <label>Devis*<br/>
                    <select
                        name="devisId"
                        value={form.devisId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">— Sélectionner —</option>
                        {devisList.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.referenceDevis} ({d.dateDevis})
                            </option>
                        ))}
                    </select>
                </label><br/>

                {/* Missions liées */}
                <label>Missions liées<br/>
                    <select
                        name="missionIds"
                        multiple size={5}
                        value={form.missionIds}
                        onChange={handleChange}
                    >
                        {missionsList.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.titreMission || m.titre || m.libelle || `Mission #${m.id}`} — {m.dateDebutMission || m.dateDebut || 'N/A'}
                            </option>
                        ))}
                    </select>
                </label><br/>

                {/* Articles juridiques */}
                <label>Articles juridiques<br/>
                    <select
                        name="articleIds"
                        multiple size={5}
                        value={form.articleIds}
                        onChange={handleChange}
                    >
                        {articlesList.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.titre || a.libelle || `Article #${a.id}`}
                            </option>
                        ))}
                    </select>
                </label><br/>

                <button type="submit" style={{ marginTop:16 }} disabled={loading}>
                    {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
            </form>
        </div>
    );
}
