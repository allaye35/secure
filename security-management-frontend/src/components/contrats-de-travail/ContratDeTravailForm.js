// src/components/contrats-de-travail/ContratDeTravailForm.jsx
import React, { useEffect, useState } from "react";
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import FicheDePaieService from "../../services/FicheDePaieService";
import Select from 'react-select';

export default function ContratDeTravailForm({
                                                 title, data, setData, onSubmit, error, isLoading,
                                                 missions, agents, entreprises, clauses
                                             }) {
    const [dateError, setDateError] = useState("");
    const [articles, setArticles] = useState([]);
    const [fichesDePaie, setFichesDePaie] = useState([]);
    const [articlesLoading, setArticlesLoading] = useState(false);
    const [fichesLoading, setFichesLoading] = useState(false);
    
    // Options pour les selects
    const [clausesOptions, setClausesOptions] = useState([]);
    const [articlesOptions, setArticlesOptions] = useState([]);
    const [fichesOptions, setFichesOptions] = useState([]);
    const [missionsOptions, setMissionsOptions] = useState([]);
    const [agentsOptions, setAgentsOptions] = useState([]);
    const [entreprisesOptions, setEntreprisesOptions] = useState([]);
    
    // Format date pour l'affichage
    const formatDate = (dateString) => {
        if (!dateString) return "";
        // Conversion explicite au format JJ/MM/AAAA
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    // Chargement des articles de contrat de travail
    useEffect(() => {
        setArticlesLoading(true);
        ArticleContratTravailService.getAll()
            .then(response => {
                setArticles(response.data);
                // Formatage pour React Select
                setArticlesOptions(response.data.map(article => ({
                    value: article.id,
                    label: article.libelle
                })));
            })
            .catch(error => {
                console.error("Erreur lors du chargement des articles:", error);
            })
            .finally(() => {
                setArticlesLoading(false);
            });
    }, []);
    
    // Chargement des fiches de paie
    useEffect(() => {
        setFichesLoading(true);
        FicheDePaieService.getAll()
            .then(response => {
                setFichesDePaie(response.data);
                // Formatage pour React Select
                setFichesOptions(response.data.map(fiche => ({
                    value: fiche.id,
                    label: `${fiche.reference} (${formatDate(fiche.periodeDebut)} - ${formatDate(fiche.periodeFin)})`
                })));
            })
            .catch(error => {
                console.error("Erreur lors du chargement des fiches de paie:", error);
            })
            .finally(() => {
                setFichesLoading(false);
            });
    }, []);
    
    // Préparation des options pour les autres selects
    useEffect(() => {
        // Options pour les clauses
        if (clauses && clauses.length > 0) {
            setClausesOptions(clauses.map(clause => ({
                value: clause.id,
                label: clause.libelle
            })));
        }
        
        // Options pour les missions
        if (missions && missions.length > 0) {
            setMissionsOptions(missions.map(mission => ({
                value: mission.id,
                label: `${mission.titreMission || "Sans titre"} (${formatDate(mission.dateDebutMission)} - ${formatDate(mission.dateFinMission)})`
            })));
        }
        
        // Options pour les agents
        if (agents && agents.length > 0) {
            setAgentsOptions(agents.map(agent => ({
                value: agent.id,
                label: `${agent.nom} ${agent.prenom}`
            })));
        }
        
        // Options pour les entreprises
        if (entreprises && entreprises.length > 0) {
            setEntreprisesOptions(entreprises.map(entreprise => ({
                value: entreprise.id,
                label: entreprise.nom
            })));
        }
    }, [clauses, missions, agents, entreprises]);
    
    // Dès que la mission change, on ajuste dates par défaut
    useEffect(() => {
        if (data.missionId && missions?.length) {
            const m = missions.find(x => x.id === Number(data.missionId));
            if (m) {
                // Utiliser directement les dates de la mission pour le contrat
                setDateError("");
                setData(d => ({
                    ...d,
                    dateDebut: m.dateDebutMission,
                    dateFin: d.typeContrat === "CDI" ? "" : m.dateFinMission
                }));
            }
        }
    }, [data.missionId, data.typeContrat, missions, setData]);

    // Mise à jour de la date de fin lorsque le type de contrat change
    useEffect(() => {
        if (data.missionId && missions?.length && data.typeContrat) {
            const m = missions.find(x => x.id === Number(data.missionId));
            if (m) {
                setData(d => ({
                    ...d,
                    dateFin: d.typeContrat === "CDI" ? "" : m.dateFinMission
                }));
            }
        }
    }, [data.typeContrat, data.missionId, missions, setData]);

    // Gérer les changements dans les champs du formulaire
    const handleChange = e => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === "file") {
            setData(d => ({ ...d, documentPdf: files[0] }));
        } else if (type === "checkbox") {
            setData(d => ({ ...d, [name]: checked }));
        } else if (name === "missionId") {
            // Pour la mission, on met à jour directement et l'effect s'occupera des dates
            setData(d => ({ ...d, [name]: value }));
        } else if (name === "typeContrat") {
            // Pour le type de contrat, on met à jour et l'effect s'occupera de la date de fin
            setData(d => ({ ...d, [name]: value }));
        } else {
            setData(d => ({ ...d, [name]: value }));
        }
    };

    // Gérer les changements dans les sélecteurs React Select
    const handleSelectChange = (selectedOption, { name }) => {
        // Pour les select simples
        if (!Array.isArray(selectedOption)) {
            setData(d => ({
                ...d,
                [name]: selectedOption ? selectedOption.value : ''
            }));
            return;
        }
        
        // Pour les select multiples
        const selectedValues = selectedOption.map(option => option.value);
        setData(d => ({
            ...d,
            [name]: selectedValues
        }));
    };

    // Styles pour les selects
    const customSelectStyles = {
        control: (styles) => ({
            ...styles,
            minHeight: '38px',
            borderRadius: '0.375rem',
            borderColor: '#ced4da',
            '&:hover': {
                borderColor: '#80bdff'
            }
        }),
        multiValue: (styles) => ({
            ...styles,
            backgroundColor: '#e9ecef'
        }),
        multiValueLabel: (styles) => ({
            ...styles,
            color: '#495057'
        }),
        multiValueRemove: (styles) => ({
            ...styles,
            color: '#495057',
            ':hover': {
                backgroundColor: '#dc3545',
                color: 'white',
            },
        }),
    };

    return (
        <div className="container mt-3">
            <form onSubmit={onSubmit} encType="multipart/form-data">
                <h2>{title} un contrat de travail</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                {isLoading && <p>Chargement...</p>}
                <div className="mb-3">
                    <label htmlFor="referenceContrat" className="form-label">Référence*</label>
                    <input 
                        id="referenceContrat"
                        name="referenceContrat" 
                        className="form-control"
                        value={data.referenceContrat || ""}
                        onChange={handleChange} 
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="typeContrat" className="form-label">Type de contrat*</label>
                    <select 
                        id="typeContrat"
                        name="typeContrat" 
                        className="form-select"
                        value={data.typeContrat || "CDD"}
                        onChange={handleChange}
                    >
                        <option value="CDD">CDD</option>
                        <option value="CDI">CDI</option>
                        <option value="INTERIM">Intérim</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="missionId" className="form-label">Mission liée*</label>
                    <Select
                        id="missionId"
                        name="missionId"
                        options={missionsOptions}
                        value={missionsOptions.find(option => option.value === Number(data.missionId))}
                        onChange={(option) => handleSelectChange(option, { name: 'missionId' })}
                        placeholder="Sélectionnez une mission..."
                        noOptionsMessage={() => "Aucune mission disponible"}
                        isLoading={!missions || missions.length === 0}
                        styles={customSelectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        required
                    />
                    <small className="form-text text-muted">
                        Les dates du contrat seront automatiquement alignées avec la mission
                    </small>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="dateDebut" className="form-label">Date de début*</label>
                        <input 
                            id="dateDebut"
                            name="dateDebut" 
                            type="date"
                            className="form-control"
                            value={data.dateDebut || ""}
                            onChange={handleChange} 
                            readOnly={data.missionId ? true : false}
                            required
                        />
                        {data.missionId && (
                            <small className="form-text text-muted">
                                Automatiquement défini selon la date de début de la mission
                            </small>
                        )}
                    </div>

                    {data.typeContrat !== "CDI" && (
                        <div className="col-md-6 mb-3">
                            <label htmlFor="dateFin" className="form-label">Date de fin*</label>
                            <input 
                                id="dateFin"
                                name="dateFin" 
                                type="date"
                                className="form-control"
                                value={data.dateFin || ""}
                                onChange={handleChange} 
                                readOnly={data.missionId ? true : false}
                                required
                            />
                            {data.missionId && (
                                <small className="form-text text-muted">
                                    Automatiquement défini selon la date de fin de la mission
                                </small>
                            )}
                        </div>
                    )}
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="agentDeSecuriteId" className="form-label">Agent*</label>
                        <Select
                            id="agentDeSecuriteId"
                            name="agentDeSecuriteId"
                            options={agentsOptions}
                            value={agentsOptions.find(option => option.value === Number(data.agentDeSecuriteId))}
                            onChange={(option) => handleSelectChange(option, { name: 'agentDeSecuriteId' })}
                            placeholder="Sélectionnez un agent..."
                            noOptionsMessage={() => "Aucun agent disponible"}
                            isLoading={!agents || agents.length === 0}
                            styles={customSelectStyles}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="entrepriseId" className="form-label">Entreprise*</label>
                        <Select
                            id="entrepriseId"
                            name="entrepriseId"
                            options={entreprisesOptions}
                            value={entreprisesOptions.find(option => option.value === Number(data.entrepriseId))}
                            onChange={(option) => handleSelectChange(option, { name: 'entrepriseId' })}
                            placeholder="Sélectionnez une entreprise..."
                            noOptionsMessage={() => "Aucune entreprise disponible"}
                            isLoading={!entreprises || entreprises.length === 0}
                            styles={customSelectStyles}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="clauseIds" className="form-label">Clause(s) juridiques</label>
                    <Select
                        id="clauseIds"
                        name="clauseIds"
                        options={clausesOptions}
                        value={clausesOptions.filter(option => 
                            data.clauseIds && data.clauseIds.includes(option.value)
                        )}
                        onChange={(options) => handleSelectChange(options, { name: 'clauseIds' })}
                        placeholder="Sélectionnez des clauses..."
                        noOptionsMessage={() => "Aucune clause disponible"}
                        isMulti
                        styles={customSelectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="articleIds" className="form-label">Articles de contrat de travail</label>
                    <Select
                        id="articleIds"
                        name="articleIds"
                        options={articlesOptions}
                        value={articlesOptions.filter(option => 
                            data.articleIds && data.articleIds.includes(option.value)
                        )}
                        onChange={(options) => handleSelectChange(options, { name: 'articleIds' })}
                        placeholder="Sélectionnez des articles..."
                        noOptionsMessage={() => "Aucun article disponible"}
                        isMulti
                        isLoading={articlesLoading}
                        styles={customSelectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="ficheDePaieIds" className="form-label">Fiches de paie associées</label>
                    <Select
                        id="ficheDePaieIds"
                        name="ficheDePaieIds"
                        options={fichesOptions}
                        value={fichesOptions.filter(option => 
                            data.ficheDePaieIds && data.ficheDePaieIds.includes(option.value)
                        )}
                        onChange={(options) => handleSelectChange(options, { name: 'ficheDePaieIds' })}
                        placeholder="Sélectionnez des fiches de paie..."
                        noOptionsMessage={() => "Aucune fiche de paie disponible"}
                        isMulti
                        isLoading={fichesLoading}
                        styles={customSelectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="documentPdf" className="form-label">Fichier PDF du contrat signé (optionnel)</label>
                    <input 
                        id="documentPdf"
                        name="documentPdf" 
                        type="file" 
                        className="form-control"
                        accept="application/pdf"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea 
                        id="description"
                        name="description" 
                        rows="4"
                        className="form-control"
                        value={data.description || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="salaireDeBase" className="form-label">Salaire de base*</label>
                        <input 
                            id="salaireDeBase"
                            name="salaireDeBase" 
                            type="number" 
                            step="0.01" 
                            min="0.01"
                            className="form-control"
                            value={data.salaireDeBase || ""}
                            onChange={handleChange} 
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="periodiciteSalaire" className="form-label">Periodicité*</label>
                        <select 
                            id="periodiciteSalaire"
                            name="periodiciteSalaire"
                            className="form-select"
                            value={data.periodiciteSalaire}
                            onChange={handleChange}
                        >
                            <option value="MENSUEL">Mensuelle</option>
                            <option value="HORAIRE">Horaire</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <button type="submit" className="btn btn-success">Enregistrer</button>
                </div>
            </form>
        </div>
    );
}
