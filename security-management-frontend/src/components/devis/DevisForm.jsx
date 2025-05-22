import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import DevisService from "../../services/DevisService";
import TarifMissionService from "../../services/TarifMissionService";
import ClientService from "../../services/ClientService";
import EntrepriseService from "../../services/EntrepriseService";
import MissionService from "../../services/MissionService"; // Ajout du service Mission
import SiteService from "../../services/SiteService"; // Pour sélectionner les sites
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
    const [tarifs, setTarifs] = useState([]);
    const [sites, setSites] = useState([]);
    
    // États pour les éléments sélectionnés
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedEntreprise, setSelectedEntreprise] = useState(null);
    const [selectedTarif, setSelectedTarif] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    
    // Configuration de base de mission
    const [missionConfig, setMissionConfig] = useState({
        nombreAgents: 1,
        quantite: 40, // Valeur par défaut (ex: 40h)
        heuresParJour: 8,
        joursParSemaine: 5
    });
    
    // États pour l'édition des missions
    const [editingMission, setEditingMission] = useState(false);
    const [selectedMissionIndex, setSelectedMissionIndex] = useState(-1);
    
    // État pour les calculs totaux du devis
    const [totauxDevis, setTotauxDevis] = useState({
        montantTotalHT: 0,
        montantTotalTVA: 0,
        montantTotalTTC: 0,
        nombreTotalAgents: 0,
        nombreTotalHeures: 0
    });
    
    // Date du jour pour valeur par défaut
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Formater date pour input type="date"
    const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
    };    // État pour le formulaire
    const [form, setForm] = useState({
        referenceDevis: "",
        description: "",
        statut: "EN_ATTENTE",
        dateValidite: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        conditionsGenerales: "",
        clientId: "",
        entrepriseId: "",
        missions: [],
        // Champs partagés avec la mission courante
        dateDebut: formatDateForInput(today),
        dateFin: formatDateForInput(tomorrow),
        heureDebut: "08:00",
        heureFin: "18:00",
        nombreAgents: 1,
        quantite: 40,
        // Champs pour les montants calculés
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0
    });
    
    // État pour la mission en cours de création
    const [currentMission, setCurrentMission] = useState({
        titre: "",
        description: "",
        typeMission: TYPE_MISSIONS[0],
        statutMission: "EN_ATTENTE_DE_VALIDATION_DEVIS",
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0,
        nombreAgents: 1,
        quantite: 40,
        dateDebut: formatDateForInput(today),
        dateFin: formatDateForInput(tomorrow),
        heureDebut: "08:00",
        heureFin: "18:00",
        tarifMissionId: "",
        siteId: ""
    });    // Effet pour synchroniser les valeurs entre le formulaire principal et la mission courante
    useEffect(() => {
        // Synchroniser les champs communs entre le formulaire et la mission
        const champsCommuns = [
            "dateDebut", "dateFin", "heureDebut", "heureFin", "nombreAgents", "quantite"
        ];
        
        // Cette variable permet de savoir si la synchronisation se fait pour la première fois
        const estPremierChargement = !currentMission.dateDebut || currentMission.dateDebut === formatDateForInput(today);
        
        // Si c'est le premier chargement, on définit uniquement les valeurs manquantes
        if (estPremierChargement) {
            // Mettre à jour uniquement les valeurs qui ne sont pas définies
            const missionUpdate = { ...currentMission };
            let missionNeedsUpdate = false;
            
            champsCommuns.forEach(champ => {
                if (form[champ] && (!currentMission[champ] || currentMission[champ] === '')) {
                    missionUpdate[champ] = form[champ];
                    missionNeedsUpdate = true;
                }
            });
            
            if (missionNeedsUpdate) {
                setCurrentMission(missionUpdate);
            }
        }
    }, []);  // Effet exécuté uniquement au premier chargement
    
    // Effet pour synchroniser automatiquement les dates du devis avec les missions
    useEffect(() => {
        if (form.missions && form.missions.length > 0) {
            // Trouver la date de début la plus tôt et la date de fin la plus tardive
            let minDateDebut = new Date(form.missions[0].dateDebut);
            let maxDateFin = new Date(form.missions[0].dateFin);
            
            form.missions.forEach(mission => {
                const dateDebut = new Date(mission.dateDebut);
                const dateFin = new Date(mission.dateFin);
                
                if (dateDebut < minDateDebut) minDateDebut = dateDebut;
                if (dateFin > maxDateFin) maxDateFin = dateFin;
            });
            
            // Mettre à jour les dates du devis pour couvrir toutes les missions
            setForm(prev => ({
                ...prev,
                dateDebut: formatDateForInput(minDateDebut),
                dateFin: formatDateForInput(maxDateFin)
            }));
        }
    }, [form.missions]); // Exécuté quand la liste des missions change
    
    // États pour filtrer les tarifs par type de mission
    const [filteredTarifs, setFilteredTarifs] = useState([]);
    const [selectedMissionType, setSelectedMissionType] = useState("");
    
    // États pour chargement et erreurs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");    // Effet pour synchroniser les valeurs entre le formulaire principal et la mission courante
    useEffect(() => {
        // Synchroniser les champs communs entre le formulaire et la mission
        const champsCommuns = ["dateDebut", "dateFin", "heureDebut", "heureFin", "nombreAgents", "quantite"];
        
        // Utiliser les valeurs du formulaire pour initialiser la mission si nécessaire
        const missionUpdate = { ...currentMission };
        let missionNeedsUpdate = false;
        
        champsCommuns.forEach(champ => {
            if (form[champ] && !currentMission[champ]) {
                missionUpdate[champ] = form[champ];
                missionNeedsUpdate = true;
            }
        });
        
        if (missionNeedsUpdate) {
            setCurrentMission(missionUpdate);
        }
    }, []);
useEffect(() => {
        // Fonction pour charger les données initiales
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
                }));                setEntreprises(entrepriseOptions);
                
                // Charger les tarifs de mission
                const tarifsResponse = await TarifMissionService.getAll();
                const tarifOptions = tarifsResponse.map(tarif => ({
                    value: tarif.id,
                    label: `${tarif.typeMission} - ${tarif.prixUnitaireHT}€ HT`,
                    tarif: tarif
                }));
                setTarifs(tarifOptions);
                
                // Charger les sites
                const sitesResponse = await SiteService.getAllSites();
                const siteOptions = sitesResponse.map(site => ({
                    value: site.id,
                    label: `${site.nom || 'Site'} - ${site.ville || ''} ${site.adresse || ''}`,
                    site: site
                }));
                setSites(siteOptions);
                
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
                        clientId: devis.clientId || "",
                        entrepriseId: devis.entrepriseId || "",
                        missions: [] // Sera rempli ci-dessous
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
                    
                    // Charger les missions associées au devis
                    if (devis.missionIds && devis.missionIds.length > 0) {
                        const missionsPromises = devis.missionIds.map(missionId => 
                            MissionService.getById(missionId)
                        );
                        
                        const missionsResponses = await Promise.all(missionsPromises);
                        const missions = missionsResponses.map(response => response.data);
                        
                        setForm(prev => ({
                            ...prev,
                            missions: missions
                        }));
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
    }, [id, isEdit]);    // Fonction pour filtrer les tarifs par type de mission
    const filterTarifsByType = async (typeMission) => {
        if (!typeMission) {
            setFilteredTarifs(tarifs);
            return;
        }
        
        try {
            // Afficher un message de chargement pendant la récupération des tarifs
            setLoading(true);            const response = await TarifMissionService.getByType(typeMission);
            
            if (response) {
                // Si response est un tableau
                if (Array.isArray(response)) {
                    const filteredOptions = response.map(tarif => ({
                        value: tarif.id,
                        label: `${tarif.typeMission} - ${tarif.prixUnitaireHT}€ HT`,
                        tarif: tarif
                    }));
                    setFilteredTarifs(filteredOptions);
                    
                    // Si un seul tarif est disponible, le sélectionner automatiquement
                    if (filteredOptions.length === 1) {
                        setSelectedTarif(filteredOptions[0]);
                        setCurrentMission(prev => ({
                            ...prev,
                            tarifMissionId: filteredOptions[0].value,
                            typeMission: filteredOptions[0].tarif.typeMission
                        }));
                        
                        // Mettre à jour les montants avec le tarif sélectionné
                        updateCurrentMissionMontants({
                            ...currentMission,
                            tarifMissionId: filteredOptions[0].value,
                            typeMission: filteredOptions[0].tarif.typeMission
                        });
                    }                } 
                // Si response est un objet unique
                else if (typeof response === 'object' && response !== null) {
                    const tarif = response;
                    const tarifOption = {
                        value: tarif.id,
                        label: `${tarif.typeMission} - ${tarif.prixUnitaireHT}€ HT`,
                        tarif: tarif
                    };
                    
                    setFilteredTarifs([tarifOption]);
                    
                    // Sélectionner automatiquement ce tarif unique
                    setSelectedTarif(tarifOption);
                    setCurrentMission(prev => ({
                        ...prev,
                        tarifMissionId: tarif.id,
                        typeMission: tarif.typeMission
                    }));
                    
                    // Mettre à jour les montants avec le tarif sélectionné
                    updateCurrentMissionMontants({
                        ...currentMission,
                        tarifMissionId: tarif.id,
                        typeMission: tarif.typeMission
                    });
                } else {
                    setFilteredTarifs([]);
                }
            } else {
                setFilteredTarifs([]);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des tarifs filtrés:", error);
            setFilteredTarifs([]);
            setError("Impossible de récupérer les tarifs pour ce type de mission");
        } finally {
            setLoading(false);
        }
    };// Gestionnaire de changement de type de mission
    const handleMissionTypeChange = (e) => {
        const typeMission = e.target.value;
        setSelectedMissionType(typeMission);
        filterTarifsByType(typeMission);
        
        // Mettre à jour la mission courante
        setCurrentMission(prev => ({
            ...prev,
            typeMission: typeMission,
            tarifMissionId: "" // Réinitialiser le tarif
        }));
        
        // Réinitialiser le tarif sélectionné
        setSelectedTarif(null);
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
    };    // Récupérer les montants calculés du backend via une simulation de mission
    const getMontantsCalcules = async (tarifId, quantite, nombreAgents, missionData = null) => {
        if (!tarifId) return { montantHT: 0, montantTVA: 0, montantTTC: 0 };
        
        try {
            // Utiliser soit les données de mission fournies, soit les données du formulaire courant
            const simulationMission = {
                typeMission: missionData?.typeMission || currentMission.typeMission,
                quantite: parseInt(quantite),
                nombreAgents: parseInt(nombreAgents),
                tarifMissionId: tarifId,
                // Utiliser les dates et heures de la mission ou du currentMission
                dateDebut: missionData?.dateDebut || currentMission.dateDebut,
                dateFin: missionData?.dateFin || currentMission.dateFin,
                heureDebut: missionData?.heureDebut || currentMission.heureDebut,
                heureFin: missionData?.heureFin || currentMission.heureFin
            };

            // Appeler l'API pour obtenir les montants calculés
            const response = await MissionService.simulateCalculation(simulationMission);
            
            if (response && response.data) {
                console.log('Montants calculés par backend:', response.data); // Debug
                return {
                    montantHT: response.data.montantHT || 0,
                    montantTVA: response.data.montantTVA || 0,
                    montantTTC: response.data.montantTTC || 0
                };
            }            
            // Si réponse incorrecte, retourner des montants à zéro
            return { montantHT: 0, montantTVA: 0, montantTTC: 0 };
        } catch (error) {
            console.error("Erreur lors du calcul des montants:", error);
            alert("Impossible de récupérer les montants calculés depuis le serveur. Veuillez réessayer ultérieurement.");
            return { montantHT: 0, montantTVA: 0, montantTTC: 0 };
        }
    };
      const handleTarifChange = async (selectedOption) => {
        setSelectedTarif(selectedOption);
        
        if (selectedOption) {
            const tarif = selectedOption.tarif;
            // Mettre à jour la mission courante
            setCurrentMission(prev => ({
                ...prev,
                tarifMissionId: selectedOption.value,
                typeMission: tarif.typeMission
            }));
            
            // Mettre à jour les montants calculés pour la mission courante
            const updatedMission = {
                ...currentMission,
                tarifMissionId: selectedOption.value,
                typeMission: tarif.typeMission
            };
            
            updateCurrentMissionMontants(updatedMission);
        } else {
            // Réinitialiser le tarif et les montants dans la mission courante
            setCurrentMission(prev => ({
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
        
        // Synchroniser automatiquement avec la mission en cours pour les champs communs
        if (["dateDebut", "dateFin", "heureDebut", "heureFin", "nombreAgents", "quantite"].includes(name)) {
            // Mettre à jour également la mission courante pour garder les valeurs synchronisées
            setCurrentMission(prev => ({
                ...prev,
                [name]: parsedValue
            }));
        }
        
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
            
            // Si un tarif est sélectionné, demander au backend de recalculer les montants
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
        
        if (form.missions.length === 0) {
            setError("Veuillez ajouter au moins une mission au devis");
            return;
        }
          // Préparation des données pour l'envoi
        const devisData = {
            referenceDevis: form.referenceDevis,
            description: form.description,
            statut: form.statut,
            dateValidite: form.dateValidite,
            conditionsGenerales: form.conditionsGenerales,
            
            // Valeurs totales calculées
            montantHT: totauxDevis.montantTotalHT,
            montantTVA: totauxDevis.montantTotalTVA,
            montantTTC: totauxDevis.montantTotalTTC,
            nombreAgents: totauxDevis.nombreTotalAgents,
            // Utiliser la quantité calculée à partir du total des heures de mission
            quantite: totauxDevis.nombreTotalHeures,
            
            // Relations
            clientId: form.clientId,
            entrepriseId: form.entrepriseId,
            
            // Informations de mission
            missions: form.missions.map(mission => ({
                titre: mission.titre,
                description: mission.description,
                typeMission: mission.typeMission,
                statutMission: mission.statutMission,
                montantHT: mission.montantHT,
                montantTVA: mission.montantTVA,
                montantTTC: mission.montantTTC,
                nombreAgents: mission.nombreAgents,
                quantite: mission.quantite,
                dateDebut: mission.dateDebut,
                dateFin: mission.dateFin,
                heureDebut: mission.heureDebut,
                heureFin: mission.heureFin,
                tarifMissionId: mission.tarifMissionId,
                siteId: mission.siteId || null
            }))
        };
        
        // Log des données envoyées (pour le débogage)
        console.log("Données du devis à envoyer:", devisData);
        
        // Appel API
        const apiCall = isEdit 
            ? DevisService.update(id, devisData)
            : DevisService.create(devisData);
            
        apiCall
            .then((response) => {
                console.log("Réponse du serveur:", response.data);
                alert(isEdit ? "Devis mis à jour avec succès!" : "Devis créé avec succès!");
                navigate("/devis");
            })
            .catch(err => {
                console.error("Erreur lors de la sauvegarde:", err);
                setError(err.response?.data?.message || "Une erreur est survenue lors de la sauvegarde du devis");
            });
    };    // Fonction pour mettre à jour les totaux du devis
    const updateDevisTotals = () => {
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
        
        // Calculer les totaux à partir des missions
        const totals = form.missions.reduce((acc, mission) => {
            return {
                montantTotalHT: acc.montantTotalHT + (parseFloat(mission.montantHT) || 0),
                montantTotalTVA: acc.montantTotalTVA + (parseFloat(mission.montantTVA) || 0),
                montantTotalTTC: acc.montantTotalTTC + (parseFloat(mission.montantTTC) || 0),
                nombreTotalAgents: acc.nombreTotalAgents + (parseInt(mission.nombreAgents) || 0),
                nombreTotalHeures: acc.nombreTotalHeures + (parseInt(mission.quantite) || 0)
            };
        }, {
            montantTotalHT: 0,
            montantTotalTVA: 0,
            montantTotalTTC: 0,
            nombreTotalAgents: 0,
            nombreTotalHeures: 0
        });
        
        // Mettre à jour l'état des totaux
        setTotauxDevis(totals);
        
        // Mettre à jour la quantité totale du devis principal pour refléter la somme des quantités des missions
        setForm(prev => ({
            ...prev,
            quantite: totals.nombreTotalHeures
        }));
    };// Ajouter la mission courante à la liste des missions
    const ajouterMission = async () => {
        // Validation de la mission courante
        if (!currentMission.titre) {
            setError("Le titre de la mission est requis");
            return;
        }
        
        if (!currentMission.tarifMissionId) {
            setError("Veuillez sélectionner un tarif pour la mission");
            return;
        }
        
        if (new Date(currentMission.dateDebut) > new Date(currentMission.dateFin)) {
            setError("La date de fin doit être après la date de début");
            return;
        }
        
        // Synchroniser les champs manquants de la mission avec le formulaire principal
        const champsSync = ["dateDebut", "dateFin", "heureDebut", "heureFin", "nombreAgents", "quantite"];
        
        // Créer une copie de la mission en cours avec les données synchronisées
        let missionAvecDonneesSync = { ...currentMission };
        
        // S'assurer que tous les champs partagés sont correctement définis
        champsSync.forEach(champ => {
            if (!missionAvecDonneesSync[champ] && form[champ]) {
                missionAvecDonneesSync[champ] = form[champ];
            }
        });
        
        // Vérifier si les montants ont déjà été calculés
        let missionAvecMontants = { ...missionAvecDonneesSync };
        
        // Si les montants n'ont pas encore été calculés, les calculer maintenant
        if (missionAvecDonneesSync.montantHT === 0 && missionAvecDonneesSync.montantTTC === 0) {
            const montants = await getMontantsCalcules(
                missionAvecDonneesSync.tarifMissionId, 
                missionAvecDonneesSync.quantite, 
                missionAvecDonneesSync.nombreAgents,
                missionAvecDonneesSync
            );
            
            missionAvecMontants = {
                ...missionAvecDonneesSync,
                montantHT: montants.montantHT,
                montantTVA: montants.montantTVA,
                montantTTC: montants.montantTTC
            };
        }
        
        // Créer une nouvelle mission avec les montants calculés
        const nouvelleMission = {
            ...missionAvecMontants,
            id: Date.now() // ID temporaire pour identification dans l'interface
        };
        
        // Ajouter la mission au formulaire
        setForm(prev => ({
            ...prev,
            missions: [...prev.missions, nouvelleMission]
        }));
        
        // Réinitialiser le formulaire de mission courante
        setCurrentMission({
            titre: "",
            description: "",
            typeMission: TYPE_MISSIONS[0],
            statutMission: "EN_ATTENTE_DE_VALIDATION_DEVIS",
            montantHT: 0,
            montantTVA: 0,
            montantTTC: 0,
            nombreAgents: 1,
            quantite: 40,
            dateDebut: formatDateForInput(today),
            dateFin: formatDateForInput(tomorrow),
            heureDebut: "08:00",
            heureFin: "18:00",
            tarifMissionId: "",
            siteId: ""
        });
        
        // Réinitialiser les sélections
        setSelectedTarif(null);
        setSelectedSite(null);
        
        // Mettre à jour les totaux du devis
        setTimeout(() => {
            updateDevisTotals();
        }, 100);
    };
      // Supprimer une mission du devis
    const supprimerMission = (index) => {
        setForm(prev => ({
            ...prev,
            missions: prev.missions.filter((_, i) => i !== index)
        }));
        
        // Mettre à jour les totaux du devis
        setTimeout(() => {
            updateDevisTotals();
        }, 100);
    };
    
    // Modifier une mission existante
    const modifierMission = (index, missionsData) => {
        // Mettre à jour la mission à l'index spécifié
        setForm(prev => ({
            ...prev,
            missions: prev.missions.map((mission, i) => {
                if (i === index) {
                    return { ...mission, ...missionsData };
                }
                return mission;
            })
        }));
        
        // Mettre à jour les totaux du devis
        setTimeout(() => {
            updateDevisTotals();
        }, 100);
    };

    // Fonctions pour l'import/export de devis au format JSON
    const exportDevisToJson = () => {
        // Préparation des données pour l'export
        const devisData = {
            referenceDevis: form.referenceDevis,
            description: form.description,
            statut: form.statut,
            dateValidite: form.dateValidite,
            conditionsGenerales: form.conditionsGenerales,
            
            // Valeurs totales calculées
            montantHT: totauxDevis.montantTotalHT,
            montantTVA: totauxDevis.montantTotalTVA,
            montantTTC: totauxDevis.montantTotalTTC,
            nombreAgents: totauxDevis.nombreTotalAgents,
            quantite: totauxDevis.nombreTotalHeures,
            
            // Relations
            clientId: form.clientId,
            entrepriseId: form.entrepriseId,
            
            // Informations de mission
            missions: form.missions.map(mission => ({
                titre: mission.titre,
                description: mission.description,
                typeMission: mission.typeMission,
                statutMission: mission.statutMission,
                montantHT: mission.montantHT,
                montantTVA: mission.montantTVA,
                montantTTC: mission.montantTTC,
                nombreAgents: mission.nombreAgents,
                quantite: mission.quantite,
                dateDebut: mission.dateDebut,
                dateFin: mission.dateFin,
                heureDebut: mission.heureDebut,
                heureFin: mission.heureFin,
                tarifMissionId: mission.tarifMissionId,
                siteId: mission.siteId || null
            }))
        };
        
        // Conversion en JSON et création d'un blob
        const jsonData = JSON.stringify(devisData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // Création d'un lien pour le téléchargement
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `devis_${form.referenceDevis || 'export'}.json`;
        document.body.appendChild(link);
        link.click();
        
        // Nettoyage
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const importDevisFromJson = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Vérification des données minimales requises
                if (!importedData.referenceDevis || !importedData.clientId || !importedData.entrepriseId) {
                    setError("Le fichier importé ne contient pas toutes les informations nécessaires");
                    return;
                }
                
                // Mise à jour du formulaire avec les données importées
                setForm({
                    referenceDevis: importedData.referenceDevis,
                    description: importedData.description || "",
                    statut: importedData.statut || "EN_ATTENTE",
                    dateValidite: importedData.dateValidite || new Date().toISOString().split('T')[0],
                    conditionsGenerales: importedData.conditionsGenerales || "",
                    clientId: importedData.clientId,
                    entrepriseId: importedData.entrepriseId,
                    missions: importedData.missions || []
                });
                
                // Sélectionner le client et l'entreprise correspondants
                const client = clients.find(c => c.value === importedData.clientId);
                if (client) setSelectedClient(client);
                
                const entreprise = entreprises.find(e => e.value === importedData.entrepriseId);
                if (entreprise) setSelectedEntreprise(entreprise);
                
                // Mise à jour des totaux
                setTimeout(() => {
                    updateDevisTotals();
                }, 100);
                
                alert("Données importées avec succès!");
            } catch (error) {
                console.error("Erreur lors de l'importation:", error);
                setError("Erreur lors de l'importation du fichier JSON. Vérifiez le format.");
            }
        };
        reader.readAsText(file);
        
        // Réinitialiser l'input file pour permettre de sélectionner le même fichier à nouveau
        event.target.value = null;
    };    // Gestionnaire des changements pour la mission en cours
    const handleCurrentMissionChange = async (e) => {
        const { name, value, type } = e.target;
        let parsedValue = value;
        
        if (type === "number") {
            parsedValue = parseFloat(value) || 0;
        }
        
        // Mettre à jour la mission en cours
        setCurrentMission(prev => ({
            ...prev,
            [name]: parsedValue
        }));
        
        // Synchroniser certains champs avec le formulaire principal pour maintenir la cohérence
        if (["dateDebut", "dateFin", "heureDebut", "heureFin", "nombreAgents", "quantite"].includes(name)) {
            // Mettre à jour le formulaire principal pour ces champs communs
            setForm(prev => ({
                ...prev,
                [name]: parsedValue
            }));
        }
        
        // Si on change certains paramètres qui affectent le calcul, mettre à jour les montants
        if (["quantite", "nombreAgents", "dateDebut", "dateFin", "heureDebut", "heureFin", "typeMission"].includes(name) 
            && currentMission.tarifMissionId) {
            // Si la date/heure change, attendre un peu pour éviter trop d'appels API
            if (["dateDebut", "dateFin", "heureDebut", "heureFin"].includes(name)) {
                const updatedMission = { ...currentMission, [name]: parsedValue };
                
                setTimeout(() => {
                    // Calculer les montants avec les données mises à jour
                    updateCurrentMissionMontants(updatedMission);
                }, 500);
            } else {
                const quantite = name === "quantite" ? parsedValue : currentMission.quantite;
                const nombreAgents = name === "nombreAgents" ? parsedValue : currentMission.nombreAgents;
                const updatedMission = { 
                    ...currentMission, 
                    [name]: parsedValue,
                    quantite: quantite,
                    nombreAgents: nombreAgents
                };
                
                updateCurrentMissionMontants(updatedMission);
            }
        }
    };
    
    // Fonction pour mettre à jour les montants de la mission en cours
    const updateCurrentMissionMontants = async (missionData) => {
        if (!missionData.tarifMissionId) return;
        
        // Obtenir les montants calculés du backend
        const montants = await getMontantsCalcules(
            missionData.tarifMissionId, 
            missionData.quantite, 
            missionData.nombreAgents,
            missionData
        );
        
        // Mettre à jour la mission courante
        setCurrentMission(prev => ({
            ...prev,
            montantHT: montants.montantHT,
            montantTVA: montants.montantTVA,
            montantTTC: montants.montantTTC
        }));
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
                        <p>Les montants sont automatiquement calculés par le backend en fonction du tarif, de la quantité, du nombre d'agents et des spécificités de la mission (heures de nuit, weekend, etc.).</p>
                        <p>Le système de tarification applique automatiquement les majorations appropriées en fonction de la configuration de la mission.</p>
                    </div>
                </div>
                  <div className="form-section calculated-amounts">
                    <h3>Montants calculés (par le serveur)</h3>
                    <div className="field-group">
                        <div>
                            <label htmlFor="montantHT">Montant HT (€)</label>
                            <input
                                type="number"
                                id="montantHT"
                                name="montantHT"
                                value={form.montantHT || 0}
                                step="0.01"
                                className="readonly-field highlight-calculated"
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
                                className="readonly-field highlight-calculated"
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
                                className="readonly-field highlight-calculated"
                                readOnly
                            />
                        </div>
                    </div>
                    <p className="text-info small mt-2">
                        <strong>Note:</strong> Ces montants sont calculés automatiquement par le serveur selon les règles métier et les tarifs configurés.
                    </p>
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
                
                <div className="form-section">
                    <h3>Missions associées</h3>
                    
                    {/* Liste des missions ajoutées */}
                    {form.missions && form.missions.length > 0 ? (
                        <div className="missions-list">
                            <h4>Missions incluses dans ce devis :</h4>
                            <table className="missions-table">
                                <thead>
                                    <tr>
                                        <th>Titre</th>
                                        <th>Type</th>
                                        <th>Dates</th>
                                        <th>Heures</th>
                                        <th>Agents</th>
                                        <th>Montant TTC</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.missions.map((mission, index) => (
                                        <tr key={mission.id || index}>
                                            <td>{mission.titre}</td>
                                            <td>{mission.typeMission}</td>
                                            <td>
                                                {new Date(mission.dateDebut).toLocaleDateString()} - {new Date(mission.dateFin).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {mission.heureDebut} - {mission.heureFin}
                                            </td>
                                            <td>{mission.nombreAgents}</td>                                            <td>{mission.montantTTC?.toFixed(2) || 0} €</td>
                                            <td>
                                                <button 
                                                    type="button"
                                                    className="btn-primary"
                                                    style={{ marginRight: '5px' }}
                                                    onClick={() => {
                                                        // Charger la mission dans le formulaire d'édition
                                                        setCurrentMission({...mission});
                                                        setSelectedMissionIndex(index);
                                                        
                                                        // Si la mission a un tarif, le sélectionner
                                                        if (mission.tarifMissionId) {
                                                            const tarifOption = tarifs.find(t => t.value === mission.tarifMissionId);
                                                            if (tarifOption) setSelectedTarif(tarifOption);
                                                        }
                                                        
                                                        // Si la mission a un site, le sélectionner
                                                        if (mission.siteId) {
                                                            const siteOption = sites.find(s => s.value === mission.siteId);
                                                            if (siteOption) setSelectedSite(siteOption);
                                                        }
                                                        
                                                        // Définir le mode édition
                                                        setEditingMission(true);
                                                    }}
                                                >
                                                    Modifier
                                                </button>
                                                <button 
                                                    type="button"
                                                    className="btn-danger"
                                                    onClick={() => supprimerMission(index)}
                                                >
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="totals-row">
                                        <td colSpan="4"><strong>Totaux</strong></td>
                                        <td><strong>{totauxDevis.nombreTotalAgents}</strong></td>
                                        <td><strong>{totauxDevis.montantTotalTTC.toFixed(2)} €</strong></td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="info-message">
                            Aucune mission n'a encore été ajoutée à ce devis. Utilisez le formulaire ci-dessous pour ajouter des missions.
                        </div>
                    )}
                    
                    {/* Formulaire d'ajout de mission */}
                    <div className="mission-form-section">
                        <h4>Ajouter une nouvelle mission</h4>
                        
                        <div className="field-group">
                            <div>
                                <label htmlFor="mission-titre">Titre de la mission</label>
                                <input
                                    type="text"
                                    id="mission-titre"
                                    value={currentMission.titre}
                                    onChange={handleCurrentMissionChange}
                                    placeholder="ex: Surveillance événement"
                                    name="titre"
                                />
                            </div>
                            <div>
                                <label htmlFor="mission-typeMission">Type de mission</label>
                                <select
                                    id="mission-typeMission"
                                    value={currentMission.typeMission}
                                    onChange={(e) => {
                                        handleCurrentMissionChange(e);
                                        filterTarifsByType(e.target.value);
                                    }}
                                    name="typeMission"
                                >
                                    {TYPE_MISSIONS.map(type => (
                                        <option key={type} value={type}>
                                            {type.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="mission-description">Description</label>
                            <textarea
                                id="mission-description"
                                value={currentMission.description}
                                onChange={handleCurrentMissionChange}
                                rows={3}
                                placeholder="Description détaillée de la mission..."
                                name="description"
                            />
                        </div>
                        
                        <div className="field-group">
                            <div>
                                <label htmlFor="mission-dateDebut">Date de début</label>
                                <input
                                    type="date"
                                    id="mission-dateDebut"
                                    value={currentMission.dateDebut}
                                    onChange={handleCurrentMissionChange}
                                    name="dateDebut"
                                />
                            </div>
                            <div>
                                <label htmlFor="mission-dateFin">Date de fin</label>
                                <input
                                    type="date"
                                    id="mission-dateFin"
                                    value={currentMission.dateFin}
                                    onChange={handleCurrentMissionChange}
                                    name="dateFin"
                                />
                            </div>
                            <div>
                                <label htmlFor="mission-heureDebut">Heure de début</label>
                                <input
                                    type="time"
                                    id="mission-heureDebut"
                                    value={currentMission.heureDebut}
                                    onChange={handleCurrentMissionChange}
                                    name="heureDebut"
                                />
                            </div>
                            <div>
                                <label htmlFor="mission-heureFin">Heure de fin</label>
                                <input
                                    type="time"
                                    id="mission-heureFin"
                                    value={currentMission.heureFin}
                                    onChange={handleCurrentMissionChange}
                                    name="heureFin"
                                />
                            </div>
                        </div>
                        
                        <div className="field-group">
                            <div>
                                <label htmlFor="mission-nombreAgents">Nombre d'agents</label>
                                <input
                                    type="number"
                                    id="mission-nombreAgents"
                                    value={currentMission.nombreAgents}
                                    onChange={handleCurrentMissionChange}
                                    min="1"
                                    name="nombreAgents"
                                />
                            </div>
                            <div>
                                <label htmlFor="mission-quantite">Quantité (heures)</label>
                                <input
                                    type="number"
                                    id="mission-quantite"
                                    value={currentMission.quantite}
                                    onChange={handleCurrentMissionChange}
                                    min="1"
                                    name="quantite"
                                />
                            </div>
                            <div>
                                <label htmlFor="mission-tarif">Tarif</label>
                                <Select
                                    id="mission-tarif"
                                    value={selectedTarif}
                                    onChange={(option) => {
                                        setSelectedTarif(option);
                                        setCurrentMission({...currentMission, tarifMissionId: option?.value || ""});
                                    }}
                                    options={filteredTarifs.length > 0 ? filteredTarifs : tarifs}
                                    placeholder="Sélectionner un tarif..."
                                    isClearable
                                />
                            </div>
                            <div>
                                <label htmlFor="mission-site">Site (optionnel)</label>
                                <Select
                                    id="mission-site"
                                    value={selectedSite}
                                    onChange={(option) => {
                                        setSelectedSite(option);
                                        setCurrentMission({...currentMission, siteId: option?.value || ""});
                                    }}
                                    options={sites}
                                    placeholder="Sélectionner un site..."
                                    isClearable
                                />
                            </div>
                        </div>
                        
                        <div className="field-group">
                            <div>
                                <label htmlFor="mission-statutMission">Statut de la mission</label>
                                <select
                                    id="mission-statutMission"
                                    value={currentMission.statutMission}
                                    onChange={handleCurrentMissionChange}
                                    name="statutMission"
                                >
                                    {STATUT_MISSIONS.map(statut => (
                                        <option key={statut} value={statut}>
                                            {statut.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                          <div className="buttons-group">
                            <button 
                                type="button" 
                                className="btn-add-mission"
                                onClick={() => {
                                    if (editingMission && selectedMissionIndex !== -1) {
                                        // Mode édition d'une mission existante
                                        modifierMission(selectedMissionIndex, currentMission);
                                        setEditingMission(false);
                                        setSelectedMissionIndex(-1);
                                        
                                        // Réinitialiser le formulaire de mission
                                        setCurrentMission({
                                            titre: "",
                                            description: "",
                                            typeMission: TYPE_MISSIONS[0],
                                            statutMission: "EN_ATTENTE_DE_VALIDATION_DEVIS",
                                            montantHT: 0,
                                            montantTVA: 0,
                                            montantTTC: 0,
                                            nombreAgents: 1,
                                            quantite: 40,
                                            dateDebut: formatDateForInput(today),
                                            dateFin: formatDateForInput(tomorrow),
                                            heureDebut: "08:00",
                                            heureFin: "18:00",
                                            tarifMissionId: "",
                                            siteId: ""
                                        });
                                        setSelectedTarif(null);
                                        setSelectedSite(null);
                                    } else {
                                        // Mode ajout d'une nouvelle mission
                                        ajouterMission();
                                    }
                                }}
                            >
                                {editingMission ? "Enregistrer les modifications" : "Ajouter cette mission au devis"}
                            </button>
                            {editingMission && (
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => {
                                        setEditingMission(false);
                                        setSelectedMissionIndex(-1);
                                        
                                        // Réinitialiser le formulaire de mission
                                        setCurrentMission({
                                            titre: "",
                                            description: "",
                                            typeMission: TYPE_MISSIONS[0],
                                            statutMission: "EN_ATTENTE_DE_VALIDATION_DEVIS",
                                            montantHT: 0,
                                            montantTVA: 0,
                                            montantTTC: 0,
                                            nombreAgents: 1,
                                            quantite: 40,
                                            dateDebut: formatDateForInput(today),
                                            dateFin: formatDateForInput(tomorrow),
                                            heureDebut: "08:00",
                                            heureFin: "18:00",
                                            tarifMissionId: "",
                                            siteId: ""
                                        });
                                        setSelectedTarif(null);
                                        setSelectedSite(null);
                                    }}
                                >
                                    Annuler l'édition
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn-reset"
                                onClick={() => {
                                    setCurrentMission({
                                        titre: "",
                                        description: "",
                                        typeMission: TYPE_MISSIONS[0],
                                        statutMission: "EN_ATTENTE_DE_VALIDATION_DEVIS",
                                        montantHT: 0,
                                        montantTVA: 0,
                                        montantTTC: 0,
                                        nombreAgents: 1,
                                        quantite: 40,
                                        dateDebut: formatDateForInput(today),
                                        dateFin: formatDateForInput(tomorrow),
                                        heureDebut: "08:00",
                                        heureFin: "18:00",
                                        tarifMissionId: "",
                                        siteId: ""
                                    });
                                    setSelectedTarif(null);
                                    setSelectedSite(null);
                                    setSelectedMissionType("");
                                }}
                            >
                                Réinitialiser
                            </button>
                        </div>
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
            <div className="form-section">
                <h3>Import/Export de devis</h3>
                <div className="field-group">
                    <button type="button" className="btn-primary" onClick={exportDevisToJson}>
                        Exporter en JSON
                    </button>
                    <input
                        type="file"
                        accept=".json"
                        onChange={importDevisFromJson}
                        style={{ display: 'none' }}
                        id="importDevisInput"
                    />
                    <label htmlFor="importDevisInput" className="btn-primary">
                        Importer depuis JSON
                    </label>
                </div>
            </div>
        </div>
    );
}
