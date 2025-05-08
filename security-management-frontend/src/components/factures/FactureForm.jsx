import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import FactureService from "../../services/FactureService";
import ClientService from "../../services/ClientService";
import EntrepriseService from "../../services/EntrepriseService";
import DevisService from "../../services/DevisService";
import MissionService from "../../services/MissionService";
import TarifMissionService from "../../services/TarifMissionService";
import "../../styles/FactureForm.css";

const STATUTS = ["EN_ATTENTE", "PAYEE", "EN_RETARD"];

export default function FactureForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [dto, setDto] = useState({
        referenceFacture: "",
        dateEmission: new Date().toISOString().split('T')[0], // Date du jour par défaut
        statut: STATUTS[0],
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0,
        devisId: "",
        entrepriseId: "",
        clientId: "",
        missionIds: [], // missions sélectionnées
        dateDebut: "", // période de facturation début
        dateFin: ""    // période de facturation fin
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Données pour les sélecteurs
    const [clients, setClients] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    const [devis, setDevis] = useState([]);
    const [missions, setMissions] = useState([]);
    const [missionsOptions, setMissionsOptions] = useState([]); // Pour React Select
    const [selectedMissions, setSelectedMissions] = useState([]);
    const [clientEntreprises, setClientEntreprises] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Données calculées
    const [calculatedData, setCalculatedData] = useState({
        totalHT: 0,
        totalTVA: 0,
        totalTTC: 0,
        detailsMissions: [] // Détails pour l'affichage
    });

    // Chargement initial des données
    useEffect(() => {
        setLoading(true);
        
        Promise.all([
            ClientService.getAll(),
            EntrepriseService.getAllEntreprises(),
            DevisService.getAll(),
            MissionService.getAllMissions() // Charger toutes les missions dès le départ
        ])
        .then(([clientsRes, entreprisesRes, devisRes, missionsRes]) => {
            setClients(clientsRes.data || []);
            setEntreprises(entreprisesRes.data || []);
            setDevis(devisRes.data || []);
            setMissions(missionsRes.data || []);
            
            console.log("Entreprises chargées:", entreprisesRes.data);
            console.log("Missions chargées:", missionsRes.data);
        })
        .catch(err => {
            console.error("Erreur lors du chargement des données:", err);
            setError("Erreur lors du chargement des données de référence");
        })
        .finally(() => setLoading(false));

        // En mode édition, charger les données de la facture
        if (isEdit) {
            setLoading(true);
            FactureService.getById(id)
                .then(({ data }) => {
                    setDto({
                        referenceFacture: data.referenceFacture,
                        dateEmission: data.dateEmission,
                        statut: data.statut,
                        montantHT: data.montantHT || 0,
                        montantTVA: data.montantTVA || 0,
                        montantTTC: data.montantTTC || 0,
                        devisId: data.devisId || "",
                        entrepriseId: data.entrepriseId,
                        clientId: data.clientId,
                        missionIds: data.missionIds || [],
                        dateDebut: data.dateDebut || "",
                        dateFin: data.dateFin || ""
                    });
                    
                    // Charger les sélections en mode édition
                    if (data.clientId) {
                        loadClientData(data.clientId, data.missionIds);
                    }
                })
                .catch(err => {
                    console.error("Erreur lors du chargement de la facture:", err);
                    setError("Impossible de charger la facture.");
                })
                .finally(() => setLoading(false));
        } else {
            // Générer une référence de facture par défaut pour les nouvelles factures
            const today = new Date();
            const referenceFacture = `FACT-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            setDto(prev => ({ ...prev, referenceFacture }));
        }
    }, [id, isEdit]);

    // Chargement des données client (entreprises et missions)
    const loadClientData = (clientId, selectedMissionIds = []) => {
        if (!clientId) return;
        
        setLoading(true);
        setError("");
        
        // Au lieu d'appeler l'API, filtrer les missions déjà chargées côté client
        // Cette approche évite les erreurs 404 quand l'endpoint /missions/client/{id} n'existe pas
        console.log("Filtrage des missions pour le client:", clientId);
        const clientMissions = missions.filter(mission => {
            // Si la mission a un champ clientId, vérifier s'il correspond
            // Sinon inclure toutes les missions (à adapter selon votre modèle de données)
            return mission.clientId === parseInt(clientId) || !mission.clientId;
        });
        
        console.log("Missions filtrées pour le client:", clientMissions);
        
        // Créer les options pour React Select
        const options = clientMissions.map(mission => ({
            value: mission.id,
            label: mission.titre || `Mission #${mission.id} - ${mission.typeMission || "N/A"}`,
            mission: mission
        }));
        setMissionsOptions(options);
        
        // Sélectionner les missions si en mode édition
        if (selectedMissionIds && selectedMissionIds.length > 0) {
            const selected = options.filter(option => 
                selectedMissionIds.includes(option.value)
            );
            setSelectedMissions(selected);
            calculateAmounts(selected.map(option => option.mission));
        }
        
        // Si des dates sont définies, filtrer les missions dans cette période
        if (dto.dateDebut && dto.dateFin) {
            filterMissionsByDate(clientMissions, dto.dateDebut, dto.dateFin);
        }
            
        // Utiliser toutes les entreprises disponibles car l'API /clients/{id}/entreprises ne fonctionne pas
        const clientEntreprisesMock = entreprises;
        setClientEntreprises(clientEntreprisesMock);
        
        // Si une seule entreprise est disponible, la sélectionner automatiquement
        if (clientEntreprisesMock.length === 1) {
            setDto(prev => ({ ...prev, entrepriseId: clientEntreprisesMock[0].id }));
        }
        
        setLoading(false);
    };

    // Filtre les missions en fonction des dates
    const filterMissionsByDate = (allMissions, startDate, endDate) => {
        if (!startDate || !endDate || !allMissions.length) return;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const filteredMissions = allMissions.filter(mission => {
            if (!mission.dateDebut || !mission.dateFin) return false;
            const missionStart = new Date(mission.dateDebut);
            const missionEnd = new Date(mission.dateFin);
            return (missionStart <= end && missionEnd >= start);
        });
        
        // Mettre à jour les options et sélectionner automatiquement les missions filtrées
        const filteredOptions = missionsOptions.filter(option => 
            filteredMissions.some(mission => mission.id === option.value)
        );
        
        // Auto-sélectionner les missions dans la période
        setSelectedMissions(filteredOptions);
        
        // Calculer les montants pour ces missions
        calculateAmounts(filteredMissions);
    };
    
    // Calcul des montants en fonction des missions sélectionnées
    const calculateAmounts = async (selectedMissionsList) => {
        if (!selectedMissionsList || selectedMissionsList.length === 0) {
            setCalculatedData({
                totalHT: 0,
                totalTVA: 0,
                totalTTC: 0,
                detailsMissions: []
            });
            setDto(prev => ({
                ...prev,
                montantHT: 0,
                montantTVA: 0,
                montantTTC: 0
            }));
            return;
        }
        
        // Enrichir les missions avec leurs tarifs si nécessaire
        const missionDetails = await Promise.all(
            selectedMissionsList.map(async mission => {
                if (mission.tarif) return mission;
                
                // Récupérer le tarif si non présent
                if (mission.tarifId) {
                    try {
                        const tarifResponse = await TarifMissionService.getById(mission.tarifId);
                        const tarif = tarifResponse.data;
                        
                        const montantHT = mission.montantHT || 
                            (tarif.prixUnitaireHT * (mission.quantite || 1) * (mission.nombreAgents || 1));
                            
                        const tauxTVA = tarif.tauxTVA || 0.2; // 20% par défaut
                        const montantTVA = mission.montantTVA || (montantHT * tauxTVA);
                        const montantTTC = mission.montantTTC || (montantHT + montantTVA);
                        
                        return {
                            ...mission,
                            tarif,
                            montantHT,
                            montantTVA,
                            montantTTC
                        };
                    } catch (err) {
                        console.error("Erreur lors du chargement du tarif:", err);
                        // Valeurs par défaut en cas d'erreur
                        return {
                            ...mission,
                            montantHT: mission.montantHT || 0,
                            montantTVA: mission.montantTVA || 0,
                            montantTTC: mission.montantTTC || 0
                        };
                    }
                }
                
                // Valeurs par défaut si pas de tarif disponible
                return {
                    ...mission,
                    montantHT: mission.montantHT || 0,
                    montantTVA: mission.montantTVA || 0,
                    montantTTC: mission.montantTTC || 0
                };
            })
        );
        
        // Calculer les totaux
        const totalHT = missionDetails.reduce(
            (sum, mission) => sum + parseFloat(mission.montantHT || 0), 0
        );
        const totalTVA = missionDetails.reduce(
            (sum, mission) => sum + parseFloat(mission.montantTVA || 0), 0
        );
        const totalTTC = missionDetails.reduce(
            (sum, mission) => sum + parseFloat(mission.montantTTC || 0), 0
        );
        
        // Mettre à jour les montants calculés
        setCalculatedData({
            totalHT,
            totalTVA,
            totalTTC,
            detailsMissions: missionDetails
        });
        
        // Mettre à jour les montants dans le formulaire
        setDto(prev => ({
            ...prev,
            montantHT: totalHT,
            montantTVA: totalTVA,
            montantTTC: totalTTC
        }));
    };

    // Récupérer les informations du devis pour pré-remplir les montants
    const loadDevisInfo = (devisId) => {
        if (!devisId) return;
        
        setLoading(true);
        DevisService.getById(devisId)
            .then(({ data }) => {
                // Mettre à jour les montants avec ceux du devis
                setDto(prev => ({
                    ...prev,
                    montantHT: data.montantHT || prev.montantHT,
                    montantTVA: data.montantTVA || prev.montantTVA,
                    montantTTC: data.montantTTC || prev.montantTTC,
                    clientId: data.clientId || prev.clientId,
                    entrepriseId: data.entrepriseId || prev.entrepriseId
                }));
                
                // Si le client a changé, charger ses données
                if (data.clientId && data.clientId !== dto.clientId) {
                    loadClientData(data.clientId);
                }
            })
            .catch(err => {
                console.error("Erreur lors du chargement des informations du devis:", err);
                setError("Erreur lors du chargement des informations du devis");
            })
            .finally(() => setLoading(false));
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setDto(d => ({ ...d, [name]: value }));
        
        // Actions spécifiques selon le champ modifié
        if (name === "clientId" && value) {
            loadClientData(value);
            // Réinitialiser l'entreprise car le client a changé
            setDto(d => ({ 
                ...d, 
                entrepriseId: "",
                missionIds: []
            }));
            setSelectedMissions([]);
        }
        
        if (name === "devisId" && value) {
            loadDevisInfo(value);
        }
        
        // Si les dates changent, filtrer les missions
        if ((name === "dateDebut" || name === "dateFin") && missions.length > 0) {
            const startDate = name === "dateDebut" ? value : dto.dateDebut;
            const endDate = name === "dateFin" ? value : dto.dateFin;
            
            if (startDate && endDate) {
                filterMissionsByDate(missions, startDate, endDate);
            }
        }
    };
    
    // Gérer la sélection de missions avec React Select
    const handleMissionsChange = (selectedOptions) => {
        setSelectedMissions(selectedOptions || []);
        
        // Mettre à jour les IDs des missions sélectionnées
        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setDto(prev => ({ ...prev, missionIds: selectedIds }));
        
        // Recalculer les montants
        const selectedMissionsList = selectedOptions ? 
            selectedOptions.map(option => option.mission) : [];
        calculateAmounts(selectedMissionsList);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleSubmit = e => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        if (!dto.clientId) {
            setError("Veuillez sélectionner un client");
            setLoading(false);
            return;
        }
        
        if (!dto.entrepriseId) {
            setError("Veuillez sélectionner une entreprise");
            setLoading(false);
            return;
        }
        
        if (dto.missionIds.length === 0) {
            setError("Veuillez sélectionner au moins une mission");
            setLoading(false);
            return;
        }
        
        const payload = {
            referenceFacture: dto.referenceFacture,
            dateEmission: dto.dateEmission,
            statut: dto.statut,
            montantHT: Number(dto.montantHT),
            montantTVA: Number(dto.montantTVA),
            montantTTC: Number(dto.montantTTC),
            devisId: dto.devisId ? Number(dto.devisId) : undefined,
            entrepriseId: Number(dto.entrepriseId),
            clientId: Number(dto.clientId),
            missionIds: dto.missionIds.map(id => Number(id)),
            dateDebut: dto.dateDebut || undefined,
            dateFin: dto.dateFin || undefined
        };
        
        const call = isEdit
            ? FactureService.update(id, payload)
            : FactureService.create(payload);

        call
            .then(() => navigate("/factures"))
            .catch(err => setError(err.response?.data?.message || "Erreur serveur"))
            .finally(() => setLoading(false));
    };

    // Filtrage des clients basé sur la recherche
    const filteredClients = searchTerm 
        ? clients.filter(client => 
            (client.nom && client.nom.toLowerCase().includes(searchTerm)) || 
            (client.prenom && client.prenom.toLowerCase().includes(searchTerm)) || 
            (client.email && client.email.toLowerCase().includes(searchTerm)) ||
            (client.telephone && client.telephone?.includes(searchTerm))
        )
        : clients;

    return (
        <div className="facture-form">
            <h2>{isEdit ? "Modifier" : "Créer"} une facture</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p className="loading">Chargement en cours...</p>}

            <form onSubmit={handleSubmit}>
                <div className="search-section">
                    <label>
                        Rechercher un client
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Nom, prénom, email ou téléphone"
                            className="form-control"
                        />
                    </label>
                </div>

                <div className="form-grid">
                    <div className="form-column">
                        <label>
                            Client <span className="required">*</span>
                            <select
                                name="clientId"
                                value={dto.clientId}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="">Sélectionnez un client</option>
                                {filteredClients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.nom} {client.prenom || ''} - {client.email || ''}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Entreprise <span className="required">*</span>
                            <select
                                name="entrepriseId"
                                value={dto.entrepriseId}
                                onChange={handleChange}
                                required
                                disabled={loading || !dto.clientId}
                            >
                                <option value="">Sélectionnez une entreprise</option>
                                {(clientEntreprises.length > 0 
                                    ? clientEntreprises 
                                    : entreprises
                                ).map(entreprise => (
                                    <option key={entreprise.id} value={entreprise.id}>
                                        {entreprise.nom} - {entreprise.siren || 'N/A'}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="date-range">
                            <label>
                                Période de facturation - Début
                                <input
                                    type="date"
                                    name="dateDebut"
                                    value={dto.dateDebut}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled={loading || !dto.clientId}
                                />
                            </label>

                            <label>
                                Période de facturation - Fin
                                <input
                                    type="date"
                                    name="dateFin"
                                    value={dto.dateFin}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled={loading || !dto.clientId || !dto.dateDebut}
                                    min={dto.dateDebut}
                                />
                            </label>
                        </div>

                        <label>
                            Réf. facture <span className="required">*</span>
                            <input
                                name="referenceFacture"
                                value={dto.referenceFacture}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </label>

                        <label>
                            Date émission <span className="required">*</span>
                            <input
                                type="date"
                                name="dateEmission"
                                value={dto.dateEmission}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </label>

                        <label>
                            Statut <span className="required">*</span>
                            <select
                                name="statut"
                                value={dto.statut}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                {STATUTS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="form-column">
                        <label>
                            Devis associé
                            <select
                                name="devisId"
                                value={dto.devisId}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Sélectionnez un devis (optionnel)</option>
                                {devis
                                    .filter(d => !dto.clientId || d.clientId === Number(dto.clientId))
                                    .map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.referenceDevis || `Devis #${d.id}`} - {d.montantTTC}€ TTC
                                        </option>
                                    ))}
                            </select>
                        </label>

                        <label>
                            Missions <span className="required">*</span>
                            <div className="select-mission-container">
                                <Select
                                    isMulti
                                    name="missions"
                                    value={selectedMissions}
                                    onChange={handleMissionsChange}
                                    options={missionsOptions}
                                    classNamePrefix="select"
                                    placeholder="Sélectionnez les missions à facturer"
                                    isDisabled={loading || !dto.clientId}
                                    noOptionsMessage={() => "Aucune mission disponible"}
                                />
                                <small className="help-text">
                                    {dto.dateDebut && dto.dateFin 
                                        ? "Les missions dans la période sélectionnée sont automatiquement incluses" 
                                        : "Sélectionnez une période pour filtrer les missions automatiquement"}
                                </small>
                            </div>
                        </label>

                        <div className="montants-section">
                            <h3>Montants calculés automatiquement</h3>
                            <div className="montant-item">
                                <label>Montant HT</label>
                                <div className="montant-value">{parseFloat(dto.montantHT || 0).toFixed(2)} €</div>
                            </div>

                            <div className="montant-item">
                                <label>Montant TVA</label>
                                <div className="montant-value">{parseFloat(dto.montantTVA || 0).toFixed(2)} €</div>
                            </div>

                            <div className="montant-item">
                                <label>Montant TTC</label>
                                <div className="montant-value">{parseFloat(dto.montantTTC || 0).toFixed(2)} €</div>
                            </div>
                        </div>
                    </div>
                </div>

                {calculatedData.detailsMissions.length > 0 && (
                    <div className="missions-details">
                        <h3>Détails des missions sélectionnées</h3>
                        <table className="missions-table">
                            <thead>
                                <tr>
                                    <th>Mission</th>
                                    <th>Type</th>
                                    <th>Période</th>
                                    <th>Agents</th>
                                    <th>Quantité</th>
                                    <th>Montant HT</th>
                                    <th>TVA</th>
                                    <th>Montant TTC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculatedData.detailsMissions.map(mission => (
                                    <tr key={mission.id}>
                                        <td>{mission.titre || `Mission #${mission.id}`}</td>
                                        <td>{mission.typeMission || "N/A"}</td>
                                        <td>{mission.dateDebut ? new Date(mission.dateDebut).toLocaleDateString() : "N/A"} - {mission.dateFin ? new Date(mission.dateFin).toLocaleDateString() : "N/A"}</td>
                                        <td>{mission.nombreAgents || 1}</td>
                                        <td>{mission.quantite || 1}</td>
                                        <td>{parseFloat(mission.montantHT || 0).toFixed(2)} €</td>
                                        <td>{parseFloat(mission.montantTVA || 0).toFixed(2)} €</td>
                                        <td>{parseFloat(mission.montantTTC || 0).toFixed(2)} €</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colSpan="5">Total</th>
                                    <th>{calculatedData.totalHT.toFixed(2)} €</th>
                                    <th>{calculatedData.totalTVA.toFixed(2)} €</th>
                                    <th>{calculatedData.totalTTC.toFixed(2)} €</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={loading || selectedMissions.length === 0}
                    >
                        {loading ? "Traitement en cours..." : (isEdit ? "Mettre à jour" : "Créer")}
                    </button>
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate("/factures")}
                        disabled={loading}
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
