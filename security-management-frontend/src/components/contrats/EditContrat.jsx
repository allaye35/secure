// src/components/contrats/EditContrat.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams }     from "react-router-dom";
import ContratService                  from "../../services/ContratService";
import DevisService                    from "../../services/DevisService";
import MissionService                  from "../../services/MissionService";
import ArticleService                  from "../../services/ArticleService";

export default function EditContrat() {
    const { id }     = useParams();
    const navigate   = useNavigate();

    const [data, setData]         = useState(null);
    const [devisList, setDevisList]       = useState([]);
    const [missionsList, setMissionsList] = useState([]);
    const [articlesList, setArticlesList] = useState([]);
    const [error, setError]               = useState("");
    const [loading, setLoading]           = useState({
        contrat: true,
        devis: true,
        missions: true, 
        articles: true
    });

    // charger le contrat existant + listes
    useEffect(() => {
        // Charger le contrat
        ContratService.getById(id)
            .then(r => {
                console.log("Contrat chargé:", r.data);
                const c = r.data;
                setData({
                    referenceContrat:   c.referenceContrat,
                    dateSignature:      c.dateSignature,
                    dureeMois:          c.dureeMois ?? "",
                    taciteReconduction: c.taciteReconduction,
                    preavisMois:        c.preavisMois ?? "",
                    devisId:            c.devisId?.toString() || "",
                    missionIds:         c.missionIds?.map(v => v.toString()) || [],
                    articleIds:         c.articleIds?.map(v => v.toString()) || []
                });
                setLoading(prev => ({...prev, contrat: false}));
            })
            .catch(err => {
                console.error("Erreur lors du chargement du contrat:", err);
                setError("Erreur lors du chargement du contrat");
                setLoading(prev => ({...prev, contrat: false}));
                // navigate("/contrats");
            });

        // Charger les devis
        DevisService.getAll()
            .then(r => {
                console.log("Devis chargés:", r.data);
                setDevisList(r.data);
                setLoading(prev => ({...prev, devis: false}));
            })
            .catch(err => {
                console.error("Erreur lors du chargement des devis:", err);
                setLoading(prev => ({...prev, devis: false}));
            });

        // Charger les missions
        MissionService.getAllMissions()
            .then(r => {
                console.log("Missions chargées:", r.data);
                setMissionsList(r.data);
                setLoading(prev => ({...prev, missions: false}));
            })
            .catch(err => {
                console.error("Erreur lors du chargement des missions:", err);
                setLoading(prev => ({...prev, missions: false}));
            });

        // Charger les articles
        ArticleService.getAll()
            .then(r => {
                console.log("Articles chargés:", r.data);
                setArticlesList(r.data);
                setLoading(prev => ({...prev, articles: false}));
            })
            .catch(err => {
                console.error("Erreur lors du chargement des articles:", err);
                setLoading(prev => ({...prev, articles: false}));
            });
    }, [id, navigate]);

    if (!data) {
        return <p>⏳ Chargement du contrat…</p>;
    }

    const handleChange = e => {
        const { name, value, type, checked, multiple, options } = e.target;
        if (type === "checkbox") {
            setData(d => ({ ...d, [name]: checked }));
        } else if (multiple) {
            const vals = Array.from(options).filter(o => o.selected).map(o => o.value);
            setData(d => ({ ...d, [name]: vals }));
        } else {
            setData(d => ({ ...d, [name]: value }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const payload = {
                ...data,
                dureeMois:   data.dureeMois   ? Number(data.dureeMois)   : null,
                preavisMois: data.preavisMois ? Number(data.preavisMois) : null,
                devisId:     Number(data.devisId),
                missionIds:  data.missionIds.map(v => Number(v)),
                articleIds:  data.articleIds.map(v => Number(v))
            };
            await ContratService.update(id, payload);
            navigate("/contrats");
        } catch (err) {
            console.error(err);
            setError("Impossible de modifier le contrat.");
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            <h2>✏ Modifier le contrat #{id}</h2>
            {error && <p style={{color:"red"}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                {/* mêmes champs que CreateContrat */}
                <div>
                    <label>Référence*<br/>
                        <input
                            name="referenceContrat"
                            value={data.referenceContrat}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>Date de signature*<br/>
                        <input
                            name="dateSignature"
                            type="date"
                            value={data.dateSignature}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>Durée (mois)<br/>
                        <input
                            name="dureeMois"
                            type="number"
                            value={data.dureeMois}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Tacite reconduction&nbsp;
                        <input
                            name="taciteReconduction"
                            type="checkbox"
                            checked={data.taciteReconduction}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>Préavis (mois)<br/>
                        <input
                            name="preavisMois"
                            type="number"
                            value={data.preavisMois}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>Devis*<br/>
                        <select
                            name="devisId"
                            value={data.devisId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">— Sélectionner —</option>
                            {devisList.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.referenceDevis} {d.dateCreation && `(${d.dateCreation.substring(0, 10)})`}
                                </option>
                            ))}
                        </select>
                        {loading.devis && <span style={{marginLeft: "10px"}}>Chargement...</span>}
                    </label>
                </div>
                <div>
                    <label>Missions liées<br/>
                        <select
                            name="missionIds"
                            multiple
                            size={5}
                            value={data.missionIds}
                            onChange={handleChange}
                        >
                            {missionsList.length > 0 ? (
                                missionsList.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.titreMission || m.titre || m.libelle || `Mission #${m.id}`} 
                                        {m.dateDebutMission && ` — ${m.dateDebutMission.substring(0, 10)}`}
                                    </option>
                                ))
                            ) : (
                                <option disabled>Aucune mission disponible</option>
                            )}
                        </select>
                        {loading.missions && <span style={{marginLeft: "10px"}}>Chargement...</span>}
                    </label>
                </div>
                <div>
                    <label>Articles juridiques<br/>
                        <select
                            name="articleIds"
                            multiple
                            size={5}
                            value={data.articleIds}
                            onChange={handleChange}
                        >
                            {articlesList.length > 0 ? (
                                articlesList.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.titreArticle || a.titre || a.numero && `Article ${a.numero}` || `Article #${a.id}`}
                                    </option>
                                ))
                            ) : (
                                <option disabled>Aucun article disponible</option>
                            )}
                        </select>
                        {loading.articles && <span style={{marginLeft: "10px"}}>Chargement...</span>}
                    </label>
                </div>
                <button type="submit" style={{ marginTop: 16 }}>
                    Enregistrer
                </button>
            </form>
        </div>
    );
}
