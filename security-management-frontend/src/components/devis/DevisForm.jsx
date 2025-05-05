import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import DevisService from "../../services/DevisService";
import TarifMissionService from "../../services/TarifMissionService";
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

export default function DevisForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    // États pour les listes de données
    const [clients, setClients] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    const [tarifs, setTarifs] = useState([]);
    
    // États pour les éléments sélectionnés
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedEntreprise, setSelectedEntreprise] = useState(null);
    const [selectedTarif, setSelectedTarif] = useState(null);
    
    // Nouvelles variables pour les calculs avancés
    const [calculDetails, setCalculDetails] = useState({
        tauxHoraire: 0,
        heuresParJour: 8,
        joursParSemaine: 5,
        semainesDuree: 4,
        majorations: {
            nuit: 0,
            weekend: 0, 
            dimanche: 0,
            ferie: 0
        },
        appliquerMajoration: {
            nuit: false,
            weekend: false,
            dimanche: false,
            ferie: false
        },
        // Nouveaux champs pour détails des jours spécifiques
        joursSemaine: {
            lundi: { selected: true, heures: 8 },
            mardi: { selected: true, heures: 8 },
            mercredi: { selected: true, heures: 8 },
            jeudi: { selected: true, heures: 8 },
            vendredi: { selected: true, heures: 8 },
            samedi: { selected: false, heures: 0 },
            dimanche: { selected: false, heures: 0 }
        },
        // Plages horaires pour les calculs de majoration automatique
        plagesHoraires: {
            debut: "08:00",
            fin: "18:00",
            debutNuit: "22:00",
            finNuit: "06:00"
        },
        // Jours fériés sélectionnés
        joursFeries: []
    });
    
    // État pour le formulaire
    const [form, setForm] = useState({
        referenceDevis: "",
        description: "",
        statut: "EN_ATTENTE",
        dateValidite: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        conditionsGenerales: "",
        
        // Champs requis par le backend
        typeMission: TYPE_MISSIONS[0],
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0,
        nombreAgents: 1,
        quantite: 1,
        
        // IDs
        clientId: "",
        entrepriseId: "",
        tarifMissionId: ""
    });

    // États pour chargement et erreurs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // État pour filtrer les tarifs par type de mission
    const [filteredTarifs, setFilteredTarifs] = useState([]);
    const [selectedMissionType, setSelectedMissionType] = useState("");

    useEffect(() => {
        // Fonction pour charger les données initiales
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError("");
                
                // Charger les clients
                const clientsResponse = await ClientService.getAll();
                console.log("Clients chargés:", clientsResponse.data);
                
                if (!clientsResponse.data || clientsResponse.data.length === 0) {
                    console.warn("Aucun client n'a été trouvé");
                }
                
                const clientOptions = clientsResponse.data.map(client => ({
                    value: client.id,
                    label: `${client.nom || 'Client'} ${client.prenom || ''} (${client.email || 'Pas d\'email'})`,
                    client: client
                }));
                setClients(clientOptions);
                
                // Charger les entreprises
                const entreprisesResponse = await EntrepriseService.getAllEntreprises();
                console.log("Entreprises chargées:", entreprisesResponse.data);
                const entrepriseOptions = entreprisesResponse.data.map(entreprise => ({
                    value: entreprise.id,
                    label: `${entreprise.nom || 'Entreprise'} ${entreprise.siret ? `(${entreprise.siret})` : ''}`,
                    entreprise: entreprise
                }));
                setEntreprises(entrepriseOptions);
                
                // Charger les tarifs de mission
                const tarifsResponse = await TarifMissionService.getAll();
                const tarifOptions = tarifsResponse.data.map(tarif => ({
                    value: tarif.id,
                    label: `${tarif.typeMission} - ${tarif.prixUnitaireHT}€ HT`,
                    tarif: tarif
                }));
                setTarifs(tarifOptions);
                
                // Si mode édition, charger le devis existant
                if (isEdit && id) {
                    const devisResponse = await DevisService.getById(id);
                    const devis = devisResponse.data;
                    
                    // Remplir le formulaire avec les données du devis
                    setForm({
                        referenceDevis: devis.referenceDevis || "",
                        description: devis.description || "",
                        statut: devis.statut || "EN_ATTENTE",
                        dateValidite: devis.dateValidite || new Date().toISOString().split('T')[0],
                        conditionsGenerales: devis.conditionsGenerales || "",
                        
                        typeMission: devis.typeMission || TYPE_MISSIONS[0],
                        montantHT: devis.montantHT || 0,
                        montantTVA: devis.montantTVA || 0,
                        montantTTC: devis.montantTTC || 0,
                        nombreAgents: devis.nombreAgents || 1,
                        quantite: devis.quantite || 1,
                        
                        clientId: devis.clientId || "",
                        entrepriseId: devis.entrepriseId || "",
                        tarifMissionId: devis.tarifMissionId || ""
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
                    
                    if (devis.tarifMissionId) {
                        const tarif = tarifOptions.find(t => t.value === devis.tarifMissionId);
                        setSelectedTarif(tarif);
                    }
                }
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Erreur lors du chargement des données. Veuillez réessayer.");
                
                // Informations de débogage détaillées
                if (err.response) {
                    console.error("Réponse d'erreur:", err.response.data);
                    console.error("Statut:", err.response.status);
                } else if (err.request) {
                    console.error("Requête sans réponse:", err.request);
                } else {
                    console.error("Erreur de configuration:", err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        
        loadInitialData();
    }, [id, isEdit]);
    
    // Fonction pour filtrer les tarifs par type de mission
    const filterTarifsByType = async (typeMission) => {
        if (!typeMission) {
            setFilteredTarifs(tarifs);
            return;
        }
        
        try {
            const response = await TarifMissionService.getByType(typeMission);
            console.log("Réponse du service pour les tarifs filtrés:", response);
            
            // Vérifier si les données sont dans un format attendu
            if (response && response.data) {
                // Si response.data est un tableau
                if (Array.isArray(response.data)) {
                    const filteredOptions = response.data.map(tarif => ({
                        value: tarif.id,
                        label: `${tarif.typeMission} - ${tarif.prixUnitaireHT}€ HT`,
                        tarif: tarif
                    }));
                    setFilteredTarifs(filteredOptions);
                } 
                // Si response.data est un objet unique
                else if (typeof response.data === 'object' && response.data !== null) {
                    const tarif = response.data;
                    setFilteredTarifs([{
                        value: tarif.id,
                        label: `${tarif.typeMission} - ${tarif.prixUnitaireHT}€ HT`,
                        tarif: tarif
                    }]);
                } else {
                    console.error("Format de données inattendu:", response.data);
                    setFilteredTarifs([]);
                }
            } else {
                console.error("Aucune donnée reçue pour les tarifs filtrés");
                setFilteredTarifs([]);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des tarifs filtrés:", error);
            setFilteredTarifs([]);
            
            // Log détaillé de l'erreur pour le débogage
            if (error.response) {
                console.error('Erreur de réponse:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Pas de réponse reçue:', error.request);
            } else {
                console.error('Erreur de configuration:', error.message);
            }
        }
    };

    // Gestionnaire de changement de type de mission
    const handleMissionTypeChange = (e) => {
        const typeMission = e.target.value;
        setSelectedMissionType(typeMission);
        filterTarifsByType(typeMission);
        
        // Réinitialiser le tarif sélectionné
        setSelectedTarif(null);
        setForm(prev => ({
            ...prev,
            tarifMissionId: "",
            typeMission: typeMission
        }));
    };

    // Gestionnaires des changements de sélections
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
    
    // Fonction de calcul des montants
    const calculerMontants = (tarif, quantite, nombreAgents, majorationsAppliquees) => {
        if (!tarif) return;
        
        let prixUnitaire = tarif.prixUnitaireHT;
        let totalMajoration = 0;
        
        // Appliquer les majorations si activées
        if (majorationsAppliquees.nuit) {
            totalMajoration += (tarif.majorationNuit / 100);
        }
        if (majorationsAppliquees.weekend) {
            totalMajoration += (tarif.majorationWeekend / 100);
        }
        if (majorationsAppliquees.dimanche) {
            totalMajoration += (tarif.majorationDimanche / 100);
        }
        if (majorationsAppliquees.ferie) {
            totalMajoration += (tarif.majorationFerie / 100);
        }
        
        // Calculer le prix avec majorations
        const prixAvecMajoration = prixUnitaire * (1 + totalMajoration);
        
        // Calculer les montants
        const montantHT = prixAvecMajoration * quantite * nombreAgents;
        const montantTVA = montantHT * (tarif.tauxTVA / 100);
        const montantTTC = montantHT + montantTVA;
        
        // Mettre à jour le formulaire
        setForm(prev => ({
            ...prev,
            montantHT: parseFloat(montantHT.toFixed(2)),
            montantTVA: parseFloat(montantTVA.toFixed(2)),
            montantTTC: parseFloat(montantTTC.toFixed(2))
        }));
    };
    
    const handleTarifChange = (selectedOption) => {
        setSelectedTarif(selectedOption);
        
        if (selectedOption) {
            const tarif = selectedOption.tarif;
            
            // Mettre à jour les détails de calcul avec les majorations du tarif
            setCalculDetails(prev => ({
                ...prev,
                tauxHoraire: tarif.prixUnitaireHT,
                majorations: {
                    nuit: tarif.majorationNuit,
                    weekend: tarif.majorationWeekend,
                    dimanche: tarif.majorationDimanche,
                    ferie: tarif.majorationFerie
                }
            }));
            
            // Calculer automatiquement les montants en fonction du tarif
            calculerMontants(tarif, form.quantite, form.nombreAgents, calculDetails.appliquerMajoration);
            
            setForm(prev => ({
                ...prev,
                tarifMissionId: selectedOption.value,
                typeMission: tarif.typeMission
            }));
        } else {
            setForm(prev => ({
                ...prev,
                tarifMissionId: "",
                montantHT: 0,
                montantTVA: 0,
                montantTTC: 0
            }));
            
            setCalculDetails(prev => ({
                ...prev,
                tauxHoraire: 0,
                majorations: {
                    nuit: 0,
                    weekend: 0, 
                    dimanche: 0,
                    ferie: 0
                }
            }));
        }
    };
    
    // Gestionnaire des changements de majorations
    const handleMajorationChange = (e) => {
        const { name, checked } = e.target;
        const majorationType = name.replace('appliquer', '').toLowerCase();
        
        const newMajorations = {
            ...calculDetails.appliquerMajoration,
            [majorationType]: checked
        };
        
        setCalculDetails(prev => ({
            ...prev,
            appliquerMajoration: newMajorations
        }));
        
        if (selectedTarif) {
            calculerMontants(
                selectedTarif.tarif, 
                form.quantite, 
                form.nombreAgents, 
                newMajorations
            );
        }
    };
    
    // Gestionnaire des changements de formulaire
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let parsedValue = value;
        
        if (type === "number") {
            parsedValue = parseFloat(value) || 0;
            
            // Si on change la quantité ou le nombre d'agents, recalculer les montants
            if ((name === "quantite" || name === "nombreAgents") && selectedTarif) {
                const quantite = name === "quantite" ? parsedValue : form.quantite;
                const nombreAgents = name === "nombreAgents" ? parsedValue : form.nombreAgents;
                
                calculerMontants(
                    selectedTarif.tarif, 
                    quantite, 
                    nombreAgents, 
                    calculDetails.appliquerMajoration
                );
            }
        }
        
        setForm(prev => ({
            ...prev,
            [name]: parsedValue
        }));
    };
    
    // Gestionnaire pour les changements dans les paramètres de calcul
    const handleCalculDetailsChange = (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === "number" ? parseFloat(value) || 0 : value;
        
        setCalculDetails(prev => ({
            ...prev,
            [name]: parsedValue
        }));
        
        // Recalculer les montants si un tarif est sélectionné
        if (selectedTarif) {
            const newDetails = {
                ...calculDetails,
                [name]: parsedValue
            };
            
            // Si modification des durées, recalculer la quantité
            if (["heuresParJour", "joursParSemaine", "semainesDuree"].includes(name)) {
                const nouvelleQuantite = newDetails.heuresParJour * newDetails.joursParSemaine * newDetails.semainesDuree;
                
                setForm(prev => ({
                    ...prev,
                    quantite: nouvelleQuantite
                }));
                
                calculerMontants(
                    selectedTarif.tarif,
                    nouvelleQuantite,
                    form.nombreAgents,
                    calculDetails.appliquerMajoration
                );
            }
        }
    };
    
    // Fonction pour générer une référence de devis automatique
    const genererReferenceDevis = () => {
        const date = new Date();
        const annee = date.getFullYear();
        const mois = String(date.getMonth() + 1).padStart(2, '0');
        const jour = String(date.getDate()).padStart(2, '0');
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
        
        // Validation
        if (!form.clientId) {
            setError("Veuillez sélectionner un client");
            return;
        }
        
        if (!form.entrepriseId) {
            setError("Veuillez sélectionner une entreprise");
            return;
        }
        
        if (!form.tarifMissionId) {
            setError("Veuillez sélectionner un tarif");
            return;
        }
        
        if (form.nombreAgents < 1) {
            setError("Le nombre d'agents doit être au moins 1");
            return;
        }
        
        if (form.quantite < 1) {
            setError("La quantité doit être au moins 1");
            return;
        }
        
        // Préparation des données pour l'envoi
        const devisData = {
            referenceDevis: form.referenceDevis,
            description: form.description,
            statut: form.statut,
            dateValidite: form.dateValidite,
            conditionsGenerales: form.conditionsGenerales,
            
            typeMission: form.typeMission,
            montantHT: form.montantHT,
            montantTVA: form.montantTVA,
            montantTTC: form.montantTTC,
            nombreAgents: form.nombreAgents,
            quantite: form.quantite,
            
            clientId: form.clientId,
            entrepriseId: form.entrepriseId,
            tarifMissionId: form.tarifMissionId
        };
        
        // Appel API
        const apiCall = isEdit 
            ? DevisService.update(id, devisData)
            : DevisService.create(devisData);
            
        apiCall
            .then(() => {
                navigate("/devis");
            })
            .catch(err => {
                console.error("Erreur lors de la sauvegarde:", err);
                setError(err.response?.data?.message || "Une erreur est survenue");
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
                                className="react-select-container"
                                classNamePrefix="react-select"
                                noOptionsMessage={() => clients.length === 0 ? "Aucun client disponible" : "Aucun client correspondant"}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: form.clientId ? '#ccc' : '#ff0000',
                                        boxShadow: 'none'
                                    })
                                }}
                            />
                            {clients.length === 0 && !loading && (
                                <div className="info-message">
                                    Aucun client disponible. Veuillez d'abord <a href="/clients/create">créer un client</a>.
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="field-group">
                        <div style={{ width: '100%' }}>
                            <label htmlFor="entreprise">Entreprise <span className="required">*</span></label>
                            <Select
                                id="entreprise"
                                options={entreprises}
                                value={selectedEntreprise}
                                onChange={handleEntrepriseChange}
                                placeholder="Sélectionnez une entreprise"
                                isSearchable
                                className="react-select-container"
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Aucune entreprise trouvée"}
                            />
                        </div>
                    </div>

                    {/* Affichage des détails de l'entreprise sélectionnée */}
                    {selectedEntreprise && selectedEntreprise.entreprise && (
                        <div className="selected-entreprise-details">
                            <h4>Détails de l'entreprise sélectionnée</h4>
                            <div className="entreprise-card">
                                <p><strong>Nom:</strong> {selectedEntreprise.entreprise.nom || 'Non spécifié'}</p>
                                <p><strong>SIRET:</strong> {selectedEntreprise.entreprise.siret || 'Non spécifié'}</p>
                                <p><strong>Adresse:</strong> {selectedEntreprise.entreprise.adresse || 'Non spécifiée'}</p>
                                <p><strong>Email:</strong> {selectedEntreprise.entreprise.email || 'Non spécifié'}</p>
                                <p><strong>Téléphone:</strong> {selectedEntreprise.entreprise.telephone || 'Non spécifié'}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="form-section">
                    <h3>Mission et tarification</h3>
                    <div className="field-group">
                        <div style={{ width: '100%' }}>
                            <label htmlFor="typeMission">Type de mission <span className="required">*</span></label>
                            <select
                                id="typeMission"
                                name="typeMission"
                                value={selectedMissionType}
                                onChange={handleMissionTypeChange}
                            >
                                <option value="">Sélectionnez un type de mission</option>
                                {TYPE_MISSIONS.map(type => (
                                    <option key={type} value={type}>
                                        {type.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="field-group">
                        <div style={{ width: '100%' }}>
                            <label htmlFor="tarif">Tarif de mission <span className="required">*</span></label>
                            <Select
                                id="tarif"
                                options={filteredTarifs}
                                value={selectedTarif}
                                onChange={handleTarifChange}
                                placeholder="Sélectionnez un tarif"
                                isSearchable
                                className="react-select-container"
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Aucun tarif trouvé"}
                            />
                            <small>Le type de mission sera défini automatiquement selon le tarif sélectionné</small>
                        </div>
                    </div>
                    
                    <div className="field-group">
                        <div>
                            <label htmlFor="typeMission">Type de mission</label>
                            <input
                                type="text"
                                id="typeMission"
                                value={form.typeMission}
                                readOnly
                                className="readonly-field"
                            />
                        </div>
                        <div>
                            <label htmlFor="nombreAgents">Nombre d'agents <span className="required">*</span></label>
                            <input
                                type="number"
                                id="nombreAgents"
                                name="nombreAgents"
                                value={form.nombreAgents}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                    </div>
                </div>
                
                {/* Section pour les calculs de quantité */}
                <div className="form-section">
                    <h3>Calcul de la quantité</h3>
                    <div className="field-group">
                        <div>
                            <label htmlFor="heuresParJour">Heures par jour</label>
                            <input
                                type="number"
                                id="heuresParJour"
                                name="heuresParJour"
                                value={calculDetails.heuresParJour}
                                onChange={handleCalculDetailsChange}
                                min="1"
                                max="24"
                                step="1"
                            />
                        </div>
                        <div>
                            <label htmlFor="joursParSemaine">Jours par semaine</label>
                            <input
                                type="number"
                                id="joursParSemaine"
                                name="joursParSemaine"
                                value={calculDetails.joursParSemaine}
                                onChange={handleCalculDetailsChange}
                                min="1"
                                max="7"
                                step="1"
                            />
                        </div>
                        <div>
                            <label htmlFor="semainesDuree">Nombre de semaines</label>
                            <input
                                type="number"
                                id="semainesDuree"
                                name="semainesDuree"
                                value={calculDetails.semainesDuree}
                                onChange={handleCalculDetailsChange}
                                min="1"
                                step="1"
                            />
                        </div>
                        <div>
                            <label htmlFor="quantite">Quantité totale (h) <span className="required">*</span></label>
                            <input
                                type="number"
                                id="quantite"
                                name="quantite"
                                value={form.quantite}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                    </div>
                </div>
                
                {/* Section améliorée pour la planification détaillée des jours */}
                <div className="form-section">
                    <h3>Planification détaillée</h3>
                    
                    <div className="day-planning-container">
                        <h4>Jours de la semaine</h4>
                        <div className="days-grid">
                            {Object.entries(calculDetails.joursSemaine).map(([jour, details]) => (
                                <div key={jour} className="day-item">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={details.selected}
                                            onChange={(e) => {
                                                const newJoursSemaine = {
                                                    ...calculDetails.joursSemaine,
                                                    [jour]: {
                                                        ...details,
                                                        selected: e.target.checked,
                                                        heures: e.target.checked ? 8 : 0
                                                    }
                                                };
                                                
                                                // Calculer le nouveau nombre de jours par semaine
                                                const joursActifs = Object.values(newJoursSemaine)
                                                    .filter(j => j.selected).length;
                                                
                                                // Calculer la nouvelle quantité totale
                                                const totalHeuresHebdo = Object.values(newJoursSemaine)
                                                    .reduce((sum, j) => sum + (j.selected ? j.heures : 0), 0);
                                                
                                                const nouvelleQuantite = totalHeuresHebdo * calculDetails.semainesDuree;
                                                
                                                setCalculDetails(prev => ({
                                                    ...prev,
                                                    joursSemaine: newJoursSemaine,
                                                    joursParSemaine: joursActifs
                                                }));
                                                
                                                setForm(prev => ({
                                                    ...prev,
                                                    quantite: nouvelleQuantite
                                                }));
                                                
                                                if (selectedTarif) {
                                                    calculerMontants(
                                                        selectedTarif.tarif,
                                                        nouvelleQuantite,
                                                        form.nombreAgents,
                                                        calculDetails.appliquerMajoration
                                                    );
                                                }
                                            }}
                                        />
                                        {jour.charAt(0).toUpperCase() + jour.slice(1)}
                                    </label>
                                    
                                    {details.selected && (
                                        <div className="hours-input">
                                            <input
                                                type="number"
                                                min="1"
                                                max="24"
                                                value={details.heures}
                                                onChange={(e) => {
                                                    const heures = Math.max(1, Math.min(24, parseInt(e.target.value) || 0));
                                                    const newJoursSemaine = {
                                                        ...calculDetails.joursSemaine,
                                                        [jour]: {
                                                            ...details,
                                                            heures
                                                        }
                                                    };
                                                    
                                                    // Calculer la nouvelle quantité totale
                                                    const totalHeuresHebdo = Object.values(newJoursSemaine)
                                                        .reduce((sum, j) => sum + (j.selected ? j.heures : 0), 0);
                                                    
                                                    const nouvelleQuantite = totalHeuresHebdo * calculDetails.semainesDuree;
                                                    
                                                    setCalculDetails(prev => ({
                                                        ...prev,
                                                        joursSemaine: newJoursSemaine
                                                    }));
                                                    
                                                    setForm(prev => ({
                                                        ...prev,
                                                        quantite: nouvelleQuantite
                                                    }));
                                                    
                                                    if (selectedTarif) {
                                                        calculerMontants(
                                                            selectedTarif.tarif,
                                                            nouvelleQuantite,
                                                            form.nombreAgents,
                                                            calculDetails.appliquerMajoration
                                                        );
                                                    }
                                                }}
                                            /> h
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="plages-horaires-container">
                        <h4>Plages horaires</h4>
                        <div className="time-ranges">
                            <div>
                                <label>Début de journée</label>
                                <input
                                    type="time"
                                    value={calculDetails.plagesHoraires.debut}
                                    onChange={(e) => {
                                        setCalculDetails(prev => ({
                                            ...prev,
                                            plagesHoraires: {
                                                ...prev.plagesHoraires,
                                                debut: e.target.value
                                            }
                                        }));
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label>Fin de journée</label>
                                <input
                                    type="time"
                                    value={calculDetails.plagesHoraires.fin}
                                    onChange={(e) => {
                                        setCalculDetails(prev => ({
                                            ...prev,
                                            plagesHoraires: {
                                                ...prev.plagesHoraires,
                                                fin: e.target.value
                                            }
                                        }));
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={calculDetails.appliquerMajoration.nuit}
                                        onChange={handleMajorationChange}
                                        name="appliquerNuit"
                                    />
                                    Travail de nuit
                                </label>
                                {calculDetails.appliquerMajoration.nuit && (
                                    <div className="night-hours">
                                        <div>
                                            <label>Début</label>
                                            <input
                                                type="time"
                                                value={calculDetails.plagesHoraires.debutNuit}
                                                onChange={(e) => {
                                                    setCalculDetails(prev => ({
                                                        ...prev,
                                                        plagesHoraires: {
                                                            ...prev.plagesHoraires,
                                                            debutNuit: e.target.value
                                                        }
                                                    }));
                                                }}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label>Fin</label>
                                            <input
                                                type="time"
                                                value={calculDetails.plagesHoraires.finNuit}
                                                onChange={(e) => {
                                                    setCalculDetails(prev => ({
                                                        ...prev,
                                                        plagesHoraires: {
                                                            ...prev.plagesHoraires,
                                                            finNuit: e.target.value
                                                        }
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="jours-feries-section">
                        <h4>Jours fériés</h4>
                        <div className="jours-feries-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={calculDetails.appliquerMajoration.ferie}
                                    onChange={handleMajorationChange}
                                    name="appliquerFerie"
                                />
                                Inclure des jours fériés dans la mission
                            </label>
                        </div>
                        
                        {calculDetails.appliquerMajoration.ferie && (
                            <div className="jours-feries-picker">
                                <label>Ajouter un jour férié</label>
                                <div className="date-picker-container">
                                    <input
                                        type="date"
                                        onChange={(e) => {
                                            const selectedDate = e.target.value;
                                            if (selectedDate && !calculDetails.joursFeries.includes(selectedDate)) {
                                                setCalculDetails(prev => ({
                                                    ...prev,
                                                    joursFeries: [...prev.joursFeries, selectedDate]
                                                }));
                                            }
                                        }}
                                    />
                                </div>
                                
                                {calculDetails.joursFeries.length > 0 && (
                                    <div className="selected-holidays">
                                        <p>Jours fériés sélectionnés:</p>
                                        <ul>
                                            {calculDetails.joursFeries.map((date, index) => (
                                                <li key={index}>
                                                    {new Date(date).toLocaleDateString('fr-FR')}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newJoursFeries = [...calculDetails.joursFeries];
                                                            newJoursFeries.splice(index, 1);
                                                            setCalculDetails(prev => ({
                                                                ...prev,
                                                                joursFeries: newJoursFeries
                                                            }));
                                                        }}
                                                        className="btn-remove"
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Section pour les majorations */}
                <div className="form-section">
                    <h3>Majorations applicables</h3>
                    {selectedTarif ? (
                        <div className="majorations-container">
                            <div className="majoration-info">
                                <p>Les majorations suivantes sont disponibles avec ce tarif :</p>
                                <ul>
                                    <li>Nuit : <strong>+{calculDetails.majorations.nuit}%</strong></li>
                                    <li>Weekend : <strong>+{calculDetails.majorations.weekend}%</strong></li>
                                    <li>Dimanche : <strong>+{calculDetails.majorations.dimanche}%</strong></li>
                                    <li>Férié : <strong>+{calculDetails.majorations.ferie}%</strong></li>
                                </ul>
                            </div>
                            
                            <div className="majoration-checkboxes">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="appliquerNuit"
                                        checked={calculDetails.appliquerMajoration.nuit}
                                        onChange={handleMajorationChange}
                                    />
                                    Appliquer majoration nuit
                                </label>
                                
                                <label>
                                    <input
                                        type="checkbox"
                                        name="appliquerWeekend"
                                        checked={calculDetails.appliquerMajoration.weekend}
                                        onChange={handleMajorationChange}
                                    />
                                    Appliquer majoration weekend
                                </label>
                                
                                <label>
                                    <input
                                        type="checkbox"
                                        name="appliquerDimanche"
                                        checked={calculDetails.appliquerMajoration.dimanche}
                                        onChange={handleMajorationChange}
                                    />
                                    Appliquer majoration dimanche
                                </label>
                                
                                <label>
                                    <input
                                        type="checkbox"
                                        name="appliquerFerie"
                                        checked={calculDetails.appliquerMajoration.ferie}
                                        onChange={handleMajorationChange}
                                    />
                                    Appliquer majoration jour férié
                                </label>
                            </div>
                        </div>
                    ) : (
                        <p className="info-message">Sélectionnez d'abord un tarif pour voir les majorations applicables</p>
                    )}
                </div>
                
                <div className="form-section">
                    <h3>Montants</h3>
                    <div className="field-group">
                        <div>
                            <label htmlFor="tauxHoraire">Taux horaire (€)</label>
                            <input
                                type="number"
                                id="tauxHoraire"
                                value={calculDetails.tauxHoraire}
                                step="0.01"
                                className="readonly-field"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="field-group">
                        <div>
                            <label htmlFor="montantHT">Montant HT (€)</label>
                            <input
                                type="number"
                                id="montantHT"
                                name="montantHT"
                                value={form.montantHT}
                                onChange={handleChange}
                                step="0.01"
                                className="readonly-field"
                                readOnly
                            />
                        </div>
                        <div>
                            <label htmlFor="montantTVA">Montant TVA (€)</label>
                            <input
                                type="number"
                                id="montantTVA"
                                name="montantTVA"
                                value={form.montantTVA}
                                onChange={handleChange}
                                step="0.01"
                                className="readonly-field"
                                readOnly
                            />
                        </div>
                        <div>
                            <label htmlFor="montantTTC">Montant TTC (€)</label>
                            <input
                                type="number"
                                id="montantTTC"
                                name="montantTTC"
                                value={form.montantTTC}
                                onChange={handleChange}
                                step="0.01"
                                className="readonly-field"
                                readOnly
                            />
                        </div>
                    </div>
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
                    <button type="button" onClick={() => navigate("/devis")} className="btn-secondary">
                        Annuler
                    </button>
                    <button type="submit" className="btn-primary">
                        {isEdit ? "Modifier" : "Créer"} le devis
                    </button>
                </div>
            </form>
        </div>
    );
}
