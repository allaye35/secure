// src/components/devis/DevisForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import DevisService from "../../services/DevisService";
import ClientService from "../../services/ClientService";
import EntrepriseService from "../../services/EntrepriseService";
import MissionService from "../../services/MissionService";
import "../../styles/DevisForm.css";

const STATUTS = ["EN_ATTENTE", "ACCEPTE_PAR_ENTREPRISE", "REFUSE_PAR_ENTREPRISE", "VALIDE_PAR_CLIENT"];

export default function DevisForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [missionsDisponibles, setMissionsDisponibles] = useState([]);
  const [missionsSelectionnees, setMissionsSelectionnees] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);

  const [form, setForm] = useState({
    referenceDevis: "",
    description: "",
    statut: "EN_ATTENTE",
    dateValidite: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
    conditionsGenerales: "",
    clientId: "",
    entrepriseId: "",
    missionIds: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);

        // Clients
        const clientsResp = await ClientService.getAll();
        const clientOptions = (clientsResp.data || []).map((c) => ({
          value: c.id,
          label: `${c.nom || "Client"} ${c.prenom || ""} (${c.email || "Pas d'email"})`,
          client: c,
        }));
        setClients(clientOptions);

<<<<<<< Updated upstream
        // Entreprises
        const entResp = await EntrepriseService.getAllEntreprises();
        const entOptions = (entResp.data || []).map((e) => ({
          value: e.id,
          label: `${e.nom || "Entreprise"}${e.siret ? ` (${e.siret})` : ""}`,
          entreprise: e,
        }));
        setEntreprises(entOptions);

        // Missions sans devis (global)
        console.log("Chargement des missions sans devis...");
        const sansDevis = await MissionService.getSansDevis().then((r) => r.data);
        console.log("Missions sans devis chargées :", sansDevis);
        const toOption = (m) => ({
          value: m.id,
          label: `${m.titre || "Mission"} (#${m.id})${m.typeMission ? ` - ${m.typeMission}` : ""} - HT: ${m.montantHT ?? 0}€`,
          mission: m,
        });
        const optionsSansDevis = (sansDevis || []).map(toOption);

        if (isEdit && id) {
          const devisResp = await DevisService.getById(id);
          const devis = devisResp.data;

          setForm((prev) => ({
            ...prev,
            referenceDevis: devis.referenceDevis || "",
            description: devis.description || "",
            statut: devis.statut || "EN_ATTENTE",
            dateValidite: devis.dateValidite || prev.dateValidite,
            conditionsGenerales: devis.conditionsGenerales || "",
            clientId: devis.clientId || "",
            entrepriseId: devis.entrepriseId || "",
            missionIds: Array.isArray(devis.missionIds) ? devis.missionIds : [],
          }));

          // Pré-sélections
          if (devis.clientId) {
            setSelectedClient(clientOptions.find((o) => String(o.value) === String(devis.clientId)) || null);
          }
          if (devis.entrepriseId) {
            setSelectedEntreprise(entOptions.find((o) => String(o.value) === String(devis.entrepriseId)) || null);
          }

          // Récupérer toutes les missions pour retrouver celles déjà liées au devis
          const all = await MissionService.getAllMissions().then((r) => r.data);
          const selectedMissions = (all || []).filter((m) =>
            (devis.missionIds || []).map(String).includes(String(m.id))
          );
          const optionsFromSelected = selectedMissions.map(toOption);

          // Merge (sans-devis + déjà liées à ce devis)
          const mapById = new Map();
          [...optionsSansDevis, ...optionsFromSelected].forEach((o) => mapById.set(String(o.value), o));
          const mergedOptions = Array.from(mapById.values());

          setMissionsDisponibles(mergedOptions);
          setMissionsSelectionnees(optionsFromSelected);
=======
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
            setForm(prev => ({
                ...prev,
                tarifMissionId: selectedOption.value,
                typeMission: tarif.typeMission
            }));
            
            // Mettre à jour les montants calculés
            updateMontants(selectedOption.value, form.quantite, form.nombreAgents);
>>>>>>> Stashed changes
        } else {
          // Création : seulement les missions libres
          setMissionsDisponibles(optionsSansDevis);
        }
<<<<<<< Updated upstream
      } catch (e) {
        console.error(e);
        setError("Erreur lors du chargement initial");
      } finally {
        setLoading(false);
      }
=======
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
>>>>>>> Stashed changes
    };

    loadInitial();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (opt) => {
    setSelectedClient(opt);
    setForm((prev) => ({ ...prev, clientId: opt ? opt.value : prev.clientId }));
  };

  const handleEntrepriseChange = (opt) => {
    setSelectedEntreprise(opt);
    setForm((prev) => ({ ...prev, entrepriseId: opt ? opt.value : prev.entrepriseId }));
  };

  const handleSelectMissions = (selected) => {
    setMissionsSelectionnees(selected || []);
    setForm((prev) => ({ ...prev, missionIds: (selected || []).map((o) => o.value) }));
  };

  const genererReferenceDevis = () => {
    const d = new Date();
    const ref = `DEV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
    setForm((prev) => ({ ...prev, referenceDevis: ref }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.clientId) return setError("Sélectionnez un client");
    if (!form.entrepriseId) return setError("Sélectionnez une entreprise");
    if (!form.missionIds.length) return setError("Sélectionnez au moins une mission");

    const data = {
      referenceDevis: form.referenceDevis,
      description: form.description,
      statut: form.statut,
      dateValidite: form.dateValidite,
      conditionsGenerales: form.conditionsGenerales,
      clientId: form.clientId,
      entrepriseId: form.entrepriseId,
      missionIds: form.missionIds,
    };

    const call = isEdit ? DevisService.update(id, data) : DevisService.create(data);
    call
      .then(() => navigate("/devis"))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || err.response?.data?.error || "Erreur lors de l'enregistrement");
      });
  };

  if (loading) {
    return (
<<<<<<< Updated upstream
      <div className="loading-container">
        <p>Chargement...</p>
        <div className="loading-spinner" />
      </div>
=======
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
>>>>>>> Stashed changes
    );
  }

  return (
    <div className="devis-form">
      <h2>{isEdit ? "Modifier" : "Créer"} un devis</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Informations générales</h3>
          <div className="field-group">
            <div>
              <label>Référence</label>
              <div className="input-with-button">
                <input
                  name="referenceDevis"
                  value={form.referenceDevis}
                  onChange={handleChange}
                  placeholder="DEV-2025-001"
                />
                <button type="button" className="btn-inline" onClick={genererReferenceDevis}>Auto</button>
              </div>
            </div>
            <div>
              <label>Statut</label>
              <select name="statut" value={form.statut} onChange={handleChange}>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div>
            <label>Date de validité</label>
            <input type="date" name="dateValidite" value={form.dateValidite} onChange={handleChange} />
          </div>
        </div>

        <div className="form-section">
          <h3>Client & Entreprise</h3>
          <div className="field-group">
            <div style={{ width: "100%" }}>
              <label>Client *</label>
              <Select value={selectedClient} onChange={handleClientChange} options={clients} placeholder="Sélectionner un client" />
            </div>
          </div>

          <div className="field-group">
            <div style={{ width: "100%" }}>
              <label>Entreprise *</label>
              <Select value={selectedEntreprise} onChange={handleEntrepriseChange} options={entreprises} placeholder="Sélectionner une entreprise" />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Missions à inclure</h3>
          <p>Seules les missions <strong>non rattachées à un devis</strong> sont listées.</p>

          <Select
            isMulti
            options={missionsDisponibles}
            value={missionsSelectionnees}
            onChange={handleSelectMissions}
            placeholder={"Sélectionner des missions"}
          />

          {missionsDisponibles.length === 0 && (
            <div className="info-message">Aucune mission disponible.</div>
          )}
        </div>

        <div className="form-section">
          <h3>Conditions générales</h3>
          <textarea name="conditionsGenerales" value={form.conditionsGenerales} onChange={handleChange} rows={5} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate("/devis")}>Annuler</button>
          <button type="submit" className="btn-primary">{isEdit ? "Mettre à jour" : "Créer"} le devis</button>
        </div>
      </form>
    </div>
  );
}
