import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import DevisService from "../../services/DevisService";
import TarifMissionService from "../../services/TarifMissionService";
import ClientService from "../../services/ClientService";
import EntrepriseService from "../../services/EntrepriseService";
import MissionService from "../../services/MissionService"; // Ajout du service Mission
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
    
    // Configuration de base de mission
    const [missionConfig, setMissionConfig] = useState({
        nombreAgents: 1,
        quantite: 40, // Valeur par défaut (ex: 40h)
        heuresParJour: 8,
        joursParSemaine: 5
    });
    
    // Date du jour pour valeur par défaut
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Formater date pour input type="date"
    const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
    };
    
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
        quantite: 40,
        
        // Dates et heures de la mission
        dateDebut: formatDateForInput(today),
        dateFin: formatDateForInput(tomorrow),
        heureDebut: "08:00",
        heureFin: "18:00",
        
        // IDs
        clientId: "",
        entrepriseId: "",
        tarifMissionId: ""
    });

    // États pour filtrer les tarifs par type de mission
    const [filteredTarifs, setFilteredTarifs] = useState([]);
    const [selectedMissionType, setSelectedMissionType] = useState("");
    
    // États pour chargement et erreurs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Fonction pour charger les données initiales
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError("");
                
                // Charger les clients
                const clientsResponse = await ClientService.getAll();
                const clientOptions = clientsResponse.data.map(client => ({
                    value: client.id,
                    label: `${client.nom || 'Client'} ${client.prenom || ''} (${client.email || 'Pas d\'email'})`,
                    client: client
                }));
                setClients(clientOptions);
                
                // Charger les entreprises
                const entreprisesResponse = await EntrepriseService.getAllEntreprises();
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
                        quantite: devis.quantite || 40,
                        
                        dateDebut: devis.dateDebut || formatDateForInput(today),
                        dateFin: devis.dateFin || formatDateForInput(tomorrow),
                        heureDebut: devis.heureDebut || "08:00",
                        heureFin: devis.heureFin || "18:00",
                        
                        clientId: devis.clientId || "",
                        entrepriseId: devis.entrepriseId || "",
                        tarifMissionId: devis.tarifMissionId || ""
                    });
                    
                    setMissionConfig({
                        nombreAgents: devis.nombreAgents || 1,
                        quantite: devis.quantite || 40,
                        heuresParJour: 8,
                        joursParSemaine: 5
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
                        setSelectedMissionType(devis.typeMission);
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
    }, [id, isEdit]);

    // Fonction pour filtrer les tarifs par type de mission
    const filterTarifsByType = async (typeMission) => {
        if (!typeMission) {
            setFilteredTarifs(tarifs);
            return;
        }
        
        try {
            const response = await TarifMissionService.getByType(typeMission);
            
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
                    setFilteredTarifs([]);
                }
            } else {
                setFilteredTarifs([]);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des tarifs filtrés:", error);
            setFilteredTarifs([]);
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
    
    // Récupérer les montants calculés du backend via une simulation de mission
    const getMontantsCalcules = async (tarifId, quantite, nombreAgents) => {
        if (!tarifId) return { montantHT: 0, montantTVA: 0, montantTTC: 0 };
        
        try {
            // TEMPORAIRE: Calculer les montants directement dans le frontend
            // sans appel au backend pour éviter les erreurs 405
            if (selectedTarif && selectedTarif.tarif) {
                const tarif = selectedTarif.tarif;
                console.log('Tarif sélectionné:', tarif); // Affiche le tarif pour debug
                
                // Vérifier si la mission se déroule pendant un weekend
                const dateDebut = new Date(form.dateDebut);
                const dateFin = new Date(form.dateFin);
                const isWeekend = dateDebut.getDay() === 0 || dateDebut.getDay() === 6 || 
                               dateFin.getDay() === 0 || dateFin.getDay() === 6;
                
                // Vérifier si c'est en soirée (après 20h)
                const heureDebut = form.heureDebut ? parseInt(form.heureDebut.split(':')[0]) : 8;
                const heureFin = form.heureFin ? parseInt(form.heureFin.split(':')[0]) : 18;
                const isNuit = heureDebut >= 20 || heureDebut <= 6 || heureFin >= 20 || heureFin <= 6;
                
                // S'assurer que prixUnitaireHT est défini, sinon utiliser 0
                let prixUnitaire = parseFloat(tarif.prixUnitaireHT) || 0;
                let tauxTVA = parseFloat(tarif.tauxTVA) || 20; // Par défaut 20% si non défini
                
                // Appliquer les majorations si nécessaire (avec gestion des valeurs manquantes)
                let totalMajoration = 0;
                
                if (isNuit && tarif.majorationNuit !== undefined) {
                    totalMajoration += (parseFloat(tarif.majorationNuit) / 100) || 0;
                }
                
                if (isWeekend && tarif.majorationWeekend !== undefined) {
                    totalMajoration += (parseFloat(tarif.majorationWeekend) / 100) || 0;
                }
                
                // Calculer le prix avec majorations
                const prixAvecMajoration = prixUnitaire * (1 + totalMajoration);
                
                // Calculer les montants (en s'assurant qu'ils sont numériques)
                const montantHT = prixAvecMajoration * parseFloat(quantite) * parseFloat(nombreAgents);
                const montantTVA = montantHT * (tauxTVA / 100);
                const montantTTC = montantHT + montantTVA;
                
                console.log('Montants calculés:', { montantHT, montantTVA, montantTTC }); // Debug
                
                return { 
                    montantHT: parseFloat(montantHT.toFixed(2)) || 0, 
                    montantTVA: parseFloat(montantTVA.toFixed(2)) || 0, 
                    montantTTC: parseFloat(montantTTC.toFixed(2)) || 0 
                };
            }
            
            // Si on n'a pas de tarif, retourner des montants à zéro
            return { montantHT: 0, montantTVA: 0, montantTTC: 0 };
            
            /* COMMENTÉ TEMPORAIREMENT - Code original avec appel backend
            // Créer une mission temporaire pour simulation
            const simulationMission = {
                typeMission: form.typeMission,
                quantite: parseInt(quantite),
                nombreAgents: parseInt(nombreAgents),
                tarifMissionId: tarifId,
                // Utiliser les dates et heures du formulaire
                dateDebut: form.dateDebut,
                dateFin: form.dateFin,
                heureDebut: form.heureDebut,
                heureFin: form.heureFin
            };

            // Appeler l'API pour obtenir les montants calculés
            const response = await MissionService.simulateCalculation(simulationMission);
            
            if (response && response.data) {
                return {
                    montantHT: response.data.montantHT || 0,
                    montantTVA: response.data.montantTVA || 0,
                    montantTTC: response.data.montantTTC || 0
                };
            }
            */
        } catch (error) {
            console.error("Erreur lors du calcul des montants:", error);
            // En cas d'erreur, faire un calcul approximatif basé sur le tarif
            if (selectedTarif && selectedTarif.tarif) {
                const tarif = selectedTarif.tarif;
                // S'assurer que toutes les valeurs sont numériques
                const prixUnitaire = parseFloat(tarif.prixUnitaireHT) || 0;
                const quantiteNum = parseFloat(quantite) || 0;
                const nombreAgentsNum = parseFloat(nombreAgents) || 0;
                const tauxTVA = parseFloat(tarif.tauxTVA) || 20;
                
                const montantHT = prixUnitaire * quantiteNum * nombreAgentsNum;
                const montantTVA = montantHT * (tauxTVA / 100);
                const montantTTC = montantHT + montantTVA;
                
                return { 
                    montantHT: parseFloat(montantHT.toFixed(2)) || 0, 
                    montantTVA: parseFloat(montantTVA.toFixed(2)) || 0, 
                    montantTTC: parseFloat(montantTTC.toFixed(2)) || 0 
                };
            }
            return { montantHT: 0, montantTVA: 0, montantTTC: 0 };
        }
    };
    
    const handleTarifChange = async (selectedOption) => {
        setSelectedTarif(selectedOption);
        
        if (selectedOption) {
            const tarif = selectedOption.tarif;
            setForm(prev => ({
                ...prev,
                tarifMissionId: selectedOption.value,
                typeMission: tarif.typeMission
            }));
            
            // Mettre à jour les montants calculés
            updateMontants(selectedOption.value, form.quantite, form.nombreAgents);
        } else {
            setForm(prev => ({
                ...prev,
                tarifMissionId: "",
                montantHT: 0,
                montantTVA: 0,
                montantTTC: 0
            }));
        }
    };
    
    // Fonction pour mettre à jour les montants
    const updateMontants = async (tarifId, quantite, nombreAgents) => {
        if (!tarifId) return;
        
        // Obtenir les montants calculés du backend
        const montants = await getMontantsCalcules(tarifId, quantite, nombreAgents);
        
        // Mettre à jour le formulaire
        setForm(prev => ({
            ...prev,
            montantHT: montants.montantHT,
            montantTVA: montants.montantTVA,
            montantTTC: montants.montantTTC
        }));
    };
    
    // Gestionnaire des changements de formulaire
    const handleChange = async (e) => {
        const { name, value, type } = e.target;
        let parsedValue = value;
        
        if (type === "number") {
            parsedValue = parseFloat(value) || 0;
        }
        
        // Mettre à jour le formulaire
        setForm(prev => ({
            ...prev,
            [name]: parsedValue
        }));
        
        // Si on change certains paramètres qui affectent le calcul, mettre à jour les montants
        if (["quantite", "nombreAgents", "dateDebut", "dateFin", "heureDebut", "heureFin"].includes(name) 
            && form.tarifMissionId) {
            // Si la date/heure change, attendre un peu pour éviter trop d'appels API
            if (["dateDebut", "dateFin", "heureDebut", "heureFin"].includes(name)) {
                setTimeout(() => {
                    updateMontants(form.tarifMissionId, form.quantite, form.nombreAgents);
                }, 500);
            } else {
                const quantite = name === "quantite" ? parsedValue : form.quantite;
                const nombreAgents = name === "nombreAgents" ? parsedValue : form.nombreAgents;
            
                // Mettre à jour missionConfig pour suivre les changements
                setMissionConfig(prev => ({
                    ...prev,
                    [name]: parsedValue
                }));
            
                updateMontants(form.tarifMissionId, quantite, nombreAgents);
            }
        }
    };
    
    // Gestion des changements de configuration de mission
    const handleMissionConfigChange = async (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === "number" ? parseFloat(value) || 0 : value;
        
        // Mettre à jour la configuration
        setMissionConfig(prev => ({
            ...prev,
            [name]: parsedValue
        }));
        
        // Recalculer la quantité totale
        if (["heuresParJour", "joursParSemaine"].includes(name)) {
            const newConfig = {
                ...missionConfig,
                [name]: parsedValue
            };
            
            // Calculer la nouvelle quantité
            const nouvelleQuantite = newConfig.heuresParJour * newConfig.joursParSemaine;
            
            // Mettre à jour form.quantite
            setForm(prev => ({
                ...prev,
                quantite: nouvelleQuantite
            }));
            
            setMissionConfig(prev => ({
                ...prev,
                quantite: nouvelleQuantite
            }));
            
            // Si un tarif est sélectionné, mettre à jour les montants
            if (form.tarifMissionId) {
                updateMontants(form.tarifMissionId, nouvelleQuantite, form.nombreAgents);
            }
        }
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
        
        if (!form.dateDebut || !form.dateFin) {
            setError("Les dates de début et de fin sont requises");
            return;
        }
        
        if (new Date(form.dateDebut) > new Date(form.dateFin)) {
            setError("La date de fin doit être après la date de début");
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
            
            dateDebut: form.dateDebut,
            dateFin: form.dateFin,
            heureDebut: form.heureDebut,
            heureFin: form.heureFin,
            
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
                                options={filteredTarifs.length > 0 ? filteredTarifs : tarifs}
                                value={selectedTarif}
                                onChange={handleTarifChange}
                                placeholder="Sélectionnez un tarif"
                                isSearchable
                                className="react-select-container"
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Aucun tarif trouvé"}
                            />
                            <small>Sélectionnez d'abord le type de mission pour filtrer les tarifs disponibles</small>
                        </div>
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Dates et horaires de mission</h3>
                    <div className="field-group">
                        <div>
                            <label htmlFor="dateDebut">Date de début <span className="required">*</span></label>
                            <input
                                type="date"
                                id="dateDebut"
                                name="dateDebut"
                                value={form.dateDebut}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="dateFin">Date de fin <span className="required">*</span></label>
                            <input
                                type="date"
                                id="dateFin"
                                name="dateFin"
                                value={form.dateFin}
                                onChange={handleChange}
                                required
                                min={form.dateDebut} // Empêche de choisir une date avant la date de début
                            />
                        </div>
                    </div>
                    <div className="field-group">
                        <div>
                            <label htmlFor="heureDebut">Heure de début</label>
                            <input
                                type="time"
                                id="heureDebut"
                                name="heureDebut"
                                value={form.heureDebut}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="heureFin">Heure de fin</label>
                            <input
                                type="time"
                                id="heureFin"
                                name="heureFin"
                                value={form.heureFin}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Configuration de la mission</h3>
                    <div className="field-group">
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
                    
                    <div className="field-group">
                        <div>
                            <label htmlFor="heuresParJour">Heures par jour</label>
                            <input
                                type="number"
                                id="heuresParJour"
                                name="heuresParJour"
                                value={missionConfig.heuresParJour}
                                onChange={handleMissionConfigChange}
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
                                value={missionConfig.joursParSemaine}
                                onChange={handleMissionConfigChange}
                                min="1"
                                max="7"
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
                            <small>Représente le temps total en heures de la mission</small>
                        </div>
                    </div>
                    
                    <div className="info-box">
                        <p>Les montants sont automatiquement calculés par le système en fonction du tarif, de la quantité, du nombre d'agents et des spécificités de la mission (heures de nuit, weekend, etc.).</p>
                        <p>Le système de tarification du backend applique automatiquement les majorations appropriées.</p>
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Montants calculés</h3>
                    <div className="field-group">
                        <div>
                            <label htmlFor="montantHT">Montant HT (€)</label>
                            <input
                                type="number"
                                id="montantHT"
                                name="montantHT"
                                value={form.montantHT || 0}
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
                                value={form.montantTVA || 0}
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
                                value={form.montantTTC || 0}
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
