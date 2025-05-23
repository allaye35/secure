import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import DevisService from "../../services/DevisService";
import ClientService from "../../services/ClientService";
import EntrepriseService from "../../services/EntrepriseService";
import "../../styles/DevisForm.css";

// Statuts de devis (correspond à l'enum StatutDevis.java dans le backend)
const STATUTS = ["EN_ATTENTE", "ACCEPTE_PAR_ENTREPRISE", "REFUSE_PAR_ENTREPRISE", "VALIDE_PAR_CLIENT"];

// Types de missions disponibles (correspond à l'enum TypeMission.java dans le backend)
const TYPE_MISSIONS = [
    "SURVEILLANCE",
    "GARDE_DU_CORPS",
    "SSIAP_1",
    "SSIAP_2",
    "SSIAP_3",
    "TELESURVEILLANCE",
    "SECURITE_EVENEMENTIELLE",
    "RONDEUR",
    "CONTROLEUR_ACCES",
    "AGENT_SURVEILLANCE_VIDEO",
    "CQP_APS"
];

// Statuts de mission disponibles
const STATUT_MISSIONS = [
    "PLANIFIEE",
    "EN_COURS",
    "TERMINEE",
    "ANNULEE",
    "EN_ATTENTE_DE_VALIDATION_DEVIS"
];

export default function DevisForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    // États pour les listes de données
    const [clients, setClients] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    const [missionsDisponibles, setMissionsDisponibles] = useState([]);
    
    // États pour les éléments sélectionnés
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedEntreprise, setSelectedEntreprise] = useState(null);
    const [selectedMissions, setSelectedMissions] = useState([]);
    
    // États pour chargement et erreurs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");    // État pour le formulaire principal
    const [form, setForm] = useState({
        referenceDevis: "",
        description: "",
        statut: "EN_ATTENTE",
        dateValidite: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        conditionsGenerales: "",
        clientId: "",
        entrepriseId: "",
        missions: []
    });    // État pour les totaux du devis
    const [totauxDevis, setTotauxDevis] = useState({
        montantTotalHT: 0,
        montantTotalTVA: 0,
        montantTotalTTC: 0,
        nombreTotalAgents: 0,
        nombreTotalHeures: 0
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError("");

                // Charger les clients
                const clientsResponse = await ClientService.getAll();
                const clientOptions = clientsResponse.map(client => ({
                    value: client.id,
                    label: `${client.nom || 'Client'} ${client.prenom || ''} (${client.email || 'Pas d\'email'})`,
                    client: client
                }));
                setClients(clientOptions);
                
                // Charger les entreprises
                const entreprisesResponse = await EntrepriseService.getAllEntreprises();
                const entrepriseOptions = entreprisesResponse.map(entreprise => ({
                    value: entreprise.id,
                    label: `${entreprise.nom || 'Entreprise'} ${entreprise.siret ? `(${entreprise.siret})` : ''}`,
                    entreprise: entreprise
                }));
                setEntreprises(entrepriseOptions);

                // Charger les missions disponibles
                const missionsResponse = await DevisService.getMissionsDisponibles();
                setMissionsDisponibles(missionsResponse);
                
                if (isEdit && id) {
                    const devisResponse = await DevisService.getById(id);
                    const devis = devisResponse;
                    
                    // Remplir le formulaire avec les données du devis
                    setForm({
                        referenceDevis: devis.referenceDevis || "",
                        description: devis.description || "",
                        statut: devis.statut || "EN_ATTENTE",
                        dateValidite: devis.dateValidite || new Date().toISOString().split('T')[0],
                        conditionsGenerales: devis.conditionsGenerales || "",
                        clientId: devis.clientId || "",
                        entrepriseId: devis.entrepriseId || "",
                        missions: devis.missions || []
                    });
                    
                    // Sélectionner les éléments correspondants
                    if (devis.clientId) {
                        const client = clientOptions.find(c => c.value === devis.clientId);
                        setSelectedClient(client);
                    }
                    
                    if (devis.entrepriseId) {
                        const entreprise = entrepriseOptions.find(e => e.value === devis.entrepriseId);
                        setSelectedEntreprise(entreprise);
                    }

                    if (devis.missions) {
                        setSelectedMissions(devis.missions.map(m => ({
                            value: m.id,
                            label: `${m.titre} - ${m.typeMission}`,
                            mission: m
                        })));
                    }
                }
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Erreur lors du chargement des données");
            } finally {
                setLoading(false);
            }
        };
        
        loadInitialData();
    }, [id, isEdit]);    // Effet pour calculer les totaux quand les missions changent
    useEffect(() => {
        if (!form.missions || form.missions.length === 0) {
            setTotauxDevis({
                montantTotalHT: 0,
                montantTotalTVA: 0,
                montantTotalTTC: 0,
                nombreTotalAgents: 0,
                nombreTotalHeures: 0
            });
            return;
        }
        
        const totals = form.missions.reduce((acc, mission) => ({
            montantTotalHT: acc.montantTotalHT + (parseFloat(mission.montantHT) || 0),
            montantTotalTVA: acc.montantTotalTVA + (parseFloat(mission.montantTVA) || 0),
            montantTotalTTC: acc.montantTotalTTC + (parseFloat(mission.montantTTC) || 0),
            nombreTotalAgents: acc.nombreTotalAgents + (parseInt(mission.nombreAgents) || 0),
            nombreTotalHeures: acc.nombreTotalHeures + (parseInt(mission.quantite) || 0)
        }), {
            montantTotalHT: 0,
            montantTotalTVA: 0,
            montantTotalTTC: 0,
            nombreTotalAgents: 0,
            nombreTotalHeures: 0
        });
        
        setTotauxDevis(totals);
    }, [form.missions]);    // Gestionnaires des changements de sélections
    const handleClientChange = (selectedOption) => {
        setSelectedClient(selectedOption);
        setForm({
            ...form,
            clientId: selectedOption ? selectedOption.value : ""
        });
    };
    
    const handleEntrepriseChange = (selectedOption) => {
        setSelectedEntreprise(selectedOption);
        setForm({
            ...form,
            entrepriseId: selectedOption ? selectedOption.value : ""
        });
    };
    
    const handleMissionsChange = (selectedOptions) => {
        setSelectedMissions(selectedOptions);
        setForm(prev => ({
            ...prev,
            missions: selectedOptions ? selectedOptions.map(option => option.mission) : []
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fonction pour générer une référence de devis automatique
    const genererReferenceDevis = () => {
        const date = new Date();
        const annee = date.getFullYear();
        const mois = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        const reference = `DEV-${annee}${mois}-${random}`;
        
        setForm(prev => ({
            ...prev,
            referenceDevis: reference
        }));
    };

    // Soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!form.clientId) {
            setError("Veuillez sélectionner un client");
            return;
        }
        
        if (!form.entrepriseId) {
            setError("Veuillez sélectionner une entreprise");
            return;
        }
        
        if (form.missions.length === 0) {
            setError("Veuillez sélectionner au moins une mission");
            return;
        }

        // Préparation des données pour l'envoi
        const devisData = {
            referenceDevis: form.referenceDevis,
            description: form.description,
            statut: form.statut,
            dateValidite: form.dateValidite,
            conditionsGenerales: form.conditionsGenerales,
            entrepriseId: form.entrepriseId,
            clientId: form.clientId,
            missionExistanteIds: form.missions.map(m => m.id)
        };

        setLoading(true);
        setError("");

        const apiCall = isEdit 
            ? DevisService.update(id, devisData)
            : DevisService.create(devisData);
            
        apiCall
            .then(() => {
                navigate('/devis');
            })
            .catch(err => {
                console.error("Erreur lors de la sauvegarde:", err);
                setError(err.response?.data?.message || "Erreur lors de la sauvegarde du devis");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (loading) return (
        <div className="loading-container">
            <p>Chargement des données en cours...</p>
            <div className="loading-spinner"></div>
        </div>
    );

    return (
        <div className="devis-form">
            <h2>{isEdit ? "Modifier" : "Créer"} un devis</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Informations générales</h3>
                    <div className="field-group">
                        <div>
                            <label htmlFor="referenceDevis">Référence</label>
                            <div className="input-with-button">
                                <input
                                    type="text"
                                    id="referenceDevis"
                                    name="referenceDevis"
                                    value={form.referenceDevis}
                                    onChange={handleChange}
                                    placeholder="ex: DEV-2025-001"
                                />
                                <button
                                    type="button"
                                    className="btn-inline"
                                    onClick={genererReferenceDevis}
                                    title="Générer une référence automatique"
                                >
                                    Auto
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="statut">Statut</label>
                            <select
                                id="statut"
                                name="statut"
                                value={form.statut}
                                onChange={handleChange}
                            >
                                {STATUTS.map(status => (
                                    <option key={status} value={status}>
                                        {status.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Description du devis..."
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="dateValidite">Date de validité</label>
                        <input
                            type="date"
                            id="dateValidite"
                            name="dateValidite"
                            value={form.dateValidite}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Client et Entreprise</h3>
                    <div className="field-group">
                        <div style={{ width: '100%' }}>
                            <label htmlFor="client">Client <span className="required">*</span></label>
                            <Select
                                id="client"
                                options={clients}
                                value={selectedClient}
                                onChange={handleClientChange}
                                placeholder="Sélectionnez un client"
                                isSearchable
                                isLoading={loading}
                            />
                        </div>
                        <div style={{ width: '100%' }}>
                            <label htmlFor="entreprise">Entreprise <span className="required">*</span></label>
                            <Select
                                id="entreprise"
                                options={entreprises}
                                value={selectedEntreprise}
                                onChange={handleEntrepriseChange}
                                placeholder="Sélectionnez une entreprise"
                                isSearchable
                                isLoading={loading}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Missions disponibles</h3>
                    <div>
                        <Select
                            isMulti
                            name="missions"
                            value={selectedMissions}
                            onChange={handleMissionsChange}
                            options={missionsDisponibles.map(mission => ({
                                value: mission.id,
                                label: `${mission.titre} - ${mission.typeMission} (${mission.montantTTC}€)`,
                                mission: mission
                            }))}
                            placeholder="Sélectionnez les missions à inclure dans le devis..."
                        />
                    </div>

                    {form.missions.length > 0 && (
                        <div className="totaux-section">
                            <h4>Totaux du devis</h4>
                            <div className="totaux-grid">
                                <div>
                                    <label>Total HT</label>
                                    <span>{totauxDevis.montantTotalHT.toFixed(2)} €</span>
                                </div>
                                <div>
                                    <label>Total TVA</label>
                                    <span>{totauxDevis.montantTotalTVA.toFixed(2)} €</span>
                                </div>
                                <div>
                                    <label>Total TTC</label>
                                    <span>{totauxDevis.montantTotalTTC.toFixed(2)} €</span>
                                </div>
                                <div>
                                    <label>Nombre d'agents</label>
                                    <span>{totauxDevis.nombreTotalAgents}</span>
                                </div>
                                <div>
                                    <label>Nombre d'heures</label>
                                    <span>{totauxDevis.nombreTotalHeures}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h3>Conditions générales</h3>
                    <div>
                        <textarea
                            id="conditionsGenerales"
                            name="conditionsGenerales"
                            value={form.conditionsGenerales}
                            onChange={handleChange}
                            rows={6}
                            placeholder="Conditions générales du devis..."
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                        {isEdit ? "Mettre à jour" : "Créer"} le devis
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/devis')}>
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
