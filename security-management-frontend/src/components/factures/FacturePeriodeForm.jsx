import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FactureService from '../../services/FactureService';
import ClientService from '../../services/ClientService';
import EntrepriseService from '../../services/EntrepriseService';
import MissionService from '../../services/MissionService';
import TarifMissionService from '../../services/TarifMissionService';
import '../../styles/FactureForm.css';

export default function FacturePeriodeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientId: '',
    entrepriseId: '',
    dateDebut: '',
    dateFin: '',
  });
  const [clients, setClients] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [missions, setMissions] = useState([]);
  const [selectedMissions, setSelectedMissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [clientEntreprises, setClientEntreprises] = useState([]);
  const [autoSelectAll, setAutoSelectAll] = useState(true); // Option pour sélectionner automatiquement toutes les missions

  // Charger la liste des clients au chargement du composant
  useEffect(() => {
    setLoading(true);
    
    // Chargement des clients
    ClientService.getAll()
      .then(response => {
        setClients(response.data);
      })
      .catch(err => {
        setError('Impossible de charger la liste des clients: ' + (err.response?.data?.message || err.message));
      });
    
    // Chargement de toutes les entreprises
    EntrepriseService.getAllEntreprises()
      .then(response => {
        setEntreprises(response.data);
      })
      .catch(err => {
        console.error('Erreur lors du chargement des entreprises:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Effet pour charger les missions quand on sélectionne un client
  useEffect(() => {
    if (formData.clientId) {
      setLoading(true);
      setError('');
      
      // Récupérer les entreprises associées au client
      ClientService.getEntreprises(formData.clientId)
        .then(response => {
          const clientEnts = response.data;
          setClientEntreprises(clientEnts);
          
          // S'il n'y a qu'une seule entreprise, la sélectionner automatiquement
          if (clientEnts.length === 1) {
            setFormData(prev => ({
              ...prev,
              entrepriseId: clientEnts[0].id
            }));
          }
        })
        .catch(err => {
          console.error('Erreur lors du chargement des entreprises du client:', err);
        });
      
      // Récupérer les missions actives du client
      ClientService.getMissionsActives(formData.clientId)
        .then(response => {
          console.log('Missions récupérées:', response.data);
          
          // Enrichir chaque mission avec les détails de son tarif
          const missionPromises = response.data.map(mission => 
            mission.tarifId ? 
              TarifMissionService.getById(mission.tarifId)
                .then(tarifResponse => {
                  const tarif = tarifResponse.data;
                  // Calculer automatiquement les montants basés sur les informations de la mission
                  const montantHT = mission.montantHT || 
                    (tarif.prixUnitaireHT * (mission.quantite || 1) * (mission.nombreAgents || 1));
                  const tauxTVA = tarif.tauxTVA || 0.2;
                  const montantTVA = mission.montantTVA || (montantHT * tauxTVA);
                  const montantTTC = mission.montantTTC || (montantHT + montantTVA);
                  
                  return {
                    ...mission,
                    tarif,
                    montantHT,
                    montantTVA,
                    montantTTC
                  };
                }) : 
              // Si pas de tarifId, retourner la mission telle quelle
              Promise.resolve(mission)
          );
          
          Promise.all(missionPromises)
            .then(missionsWithTarifs => {
              console.log('Missions avec tarifs:', missionsWithTarifs);
              setMissions(missionsWithTarifs);
              
              // Si on a des missions, préremplir les dates avec la plus ancienne et la plus récente
              if (missionsWithTarifs.length > 0) {
                const startDates = missionsWithTarifs
                  .filter(m => m.dateDebut)
                  .map(m => new Date(m.dateDebut));
                const endDates = missionsWithTarifs
                  .filter(m => m.dateFin)
                  .map(m => new Date(m.dateFin));
                
                if (startDates.length > 0 && endDates.length > 0) {
                  const minDate = new Date(Math.min(...startDates));
                  const maxDate = new Date(Math.max(...endDates));
                  
                  setFormData(prev => ({
                    ...prev,
                    dateDebut: minDate.toISOString().split('T')[0],
                    dateFin: maxDate.toISOString().split('T')[0]
                  }));
                }
                
                // Sélection automatique de toutes les missions si l'option est activée
                if (autoSelectAll) {
                  setSelectedMissions(missionsWithTarifs.map(m => m.id));
                }
              }
            })
            .catch(err => {
              console.error('Erreur lors du traitement des tarifs:', err);
              setError('Erreur lors du traitement des tarifs: ' + err.message);
            });
        })
        .catch(err => {
          console.error('Erreur lors du chargement des missions:', err);
          setError('Impossible de charger les missions: ' + (err.response?.data?.message || err.message));
        })
        .finally(() => setLoading(false));
    } else {
      // Réinitialiser les missions si aucun client n'est sélectionné
      setMissions([]);
      setSelectedMissions([]);
    }
  }, [formData.clientId, autoSelectAll]);

  // Filtrer les missions en fonction des dates sélectionnées
  useEffect(() => {
    if (formData.dateDebut && formData.dateFin && missions.length > 0) {
      const periodeDebut = new Date(formData.dateDebut);
      const periodeFin = new Date(formData.dateFin);
      
      // Filtrer les missions qui sont dans la période sélectionnée
      const filteredMissions = missions
        .filter(mission => {
          if (!mission.dateDebut || !mission.dateFin) return false;
          
          const missionDebut = new Date(mission.dateDebut);
          const missionFin = new Date(mission.dateFin);
          
          // Vérifie si la mission chevauche la période
          return (missionDebut <= periodeFin && missionFin >= periodeDebut);
        });
      
      const filteredMissionIds = filteredMissions.map(m => m.id);
      
      // Mettre à jour la sélection des missions en ne gardant que celles dans la période
      if (autoSelectAll) {
        setSelectedMissions(filteredMissionIds);
      } else {
        setSelectedMissions(prev => 
          prev.filter(id => filteredMissionIds.includes(id))
        );
      }
    }
  }, [formData.dateDebut, formData.dateFin, missions, autoSelectAll]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si on change le client, on réinitialise les missions sélectionnées et l'entreprise
    if (name === 'clientId') {
      setSelectedMissions([]);
      setFormData(prev => ({
        ...prev,
        clientId: value,
        entrepriseId: ''
      }));
      
      // Réinitialiser l'aperçu
      setPreviewData(null);
    }
  };
  
  const handleAutoSelectChange = (e) => {
    const isChecked = e.target.checked;
    setAutoSelectAll(isChecked);
    
    if (isChecked && missions.length > 0) {
      // Sélectionner toutes les missions dans la période
      const filteredMissions = missions.filter(mission => {
        if (!mission.dateDebut || !mission.dateFin || !formData.dateDebut || !formData.dateFin) return false;
        
        const missionDebut = new Date(mission.dateDebut);
        const missionFin = new Date(mission.dateFin);
        const periodeDebut = new Date(formData.dateDebut);
        const periodeFin = new Date(formData.dateFin);
        
        return (missionDebut <= periodeFin && missionFin >= periodeDebut);
      });
      
      setSelectedMissions(filteredMissions.map(m => m.id));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleMissionSelect = (missionId) => {
    // Vérifier si la mission est déjà sélectionnée
    const isSelected = selectedMissions.includes(missionId);
    
    if (isSelected) {
      // Désélectionner la mission
      setSelectedMissions(prev => prev.filter(id => id !== missionId));
    } else {
      // Sélectionner la mission
      setSelectedMissions(prev => [...prev, missionId]);
    }
    
    // Réinitialiser l'aperçu car la sélection a changé
    setPreviewData(null);
  };

  const handleSelectAllMissions = () => {
    if (selectedMissions.length === missions.length) {
      // Si toutes les missions sont déjà sélectionnées, tout désélectionner
      setSelectedMissions([]);
    } else {
      // Sinon sélectionner toutes les missions
      setSelectedMissions(missions.map(m => m.id));
    }
    
    // Réinitialiser l'aperçu car la sélection a changé
    setPreviewData(null);
  };
  
  const handlePreview = () => {
    if (selectedMissions.length === 0) {
      setError('Veuillez sélectionner au moins une mission');
      return;
    }
    
    if (!formData.entrepriseId) {
      setError('Veuillez sélectionner une entreprise');
      return;
    }
    
    setLoading(true);
    
    // Calculer le total des montants HT, TVA et TTC pour les missions sélectionnées
    const selectedMissionData = missions.filter(mission => selectedMissions.includes(mission.id));
    
    const totalHT = selectedMissionData.reduce((sum, mission) => sum + parseFloat(mission.montantHT || 0), 0);
    const totalTVA = selectedMissionData.reduce((sum, mission) => sum + parseFloat(mission.montantTVA || 0), 0);
    const totalTTC = selectedMissionData.reduce((sum, mission) => sum + parseFloat(mission.montantTTC || 0), 0);
    
    // Récupérer le client et l'entreprise
    const client = clients.find(c => c.id === parseInt(formData.clientId));
    const entreprise = entreprises.find(e => e.id === parseInt(formData.entrepriseId));
    
    // Générer une référence unique pour la facture
    const referenceFacture = `FACT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    setPreviewData({
      client,
      entreprise,
      missions: selectedMissionData,
      totalHT,
      totalTVA,
      totalTTC,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      referenceFacture
    });
    
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedMissions.length === 0) {
      setError('Veuillez sélectionner au moins une mission');
      return;
    }
    
    if (!formData.entrepriseId) {
      setError('Veuillez sélectionner une entreprise');
      return;
    }
    
    setLoading(true);
    setError('');

    // Préparation des données pour la création de la facture
    const factureData = {
      referenceFacture: previewData ? previewData.referenceFacture : `FACT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      clientId: parseInt(formData.clientId),
      entrepriseId: parseInt(formData.entrepriseId),
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      missionIds: selectedMissions
    };

    // Appel au service de facturation pour créer une facture sur la période
    FactureService.createForPeriod(factureData)
      .then(response => {
        console.log('Facture créée:', response.data);
        // Redirection vers le détail de la facture créée
        navigate(`/factures/${response.data.id}`);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setError('Erreur lors de la création de la facture: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  };

  // Filtrage des clients basé sur la recherche
  const filteredClients = searchTerm 
    ? clients.filter(client => 
        (client.nom && client.nom.toLowerCase().includes(searchTerm)) || 
        (client.prenom && client.prenom.toLowerCase().includes(searchTerm)) || 
        (client.email && client.email.toLowerCase().includes(searchTerm)) ||
        (client.telephone && client.telephone.includes(searchTerm)) ||
        (client.entreprise?.nom && client.entreprise.nom.toLowerCase().includes(searchTerm))
      )
    : clients;

  // Calculer le total des missions sélectionnées
  const selectedCount = selectedMissions.length;
  const totalCount = missions.length;

  return (
    <div className="facture-form">
      <h2>Créer une facture pour un client</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="search-section">
          <div className="form-group">
            <label htmlFor="searchTerm">Rechercher un client</label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Nom, prénom, email, téléphone ou entreprise"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="clientId">Client <span className="required">*</span></label>
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            required
            className="form-control"
            disabled={loading}
          >
            <option value="">Sélectionnez un client</option>
            {filteredClients.map(client => (
              <option key={client.id} value={client.id}>
                {client.nom} {client.prenom || ''} - {client.email || ''} {client.entreprise?.nom ? `- ${client.entreprise.nom}` : ''}
              </option>
            ))}
          </select>
        </div>

        {formData.clientId && (
          <>
            <div className="form-group">
              <label htmlFor="entrepriseId">Entreprise <span className="required">*</span></label>
              <select
                id="entrepriseId"
                name="entrepriseId"
                value={formData.entrepriseId}
                onChange={handleChange}
                required
                className="form-control"
                disabled={loading}
              >
                <option value="">Sélectionnez une entreprise</option>
                {clientEntreprises.length > 0
                  ? clientEntreprises.map(entreprise => (
                      <option key={entreprise.id} value={entreprise.id}>
                        {entreprise.nom} - {entreprise.siren || 'N/A'} 
                      </option>
                    ))
                  : entreprises.map(entreprise => (
                      <option key={entreprise.id} value={entreprise.id}>
                        {entreprise.nom} - {entreprise.siren || 'N/A'} 
                      </option>
                    ))
                }
              </select>
            </div>

            <div className="date-range">
              <div className="form-group">
                <label htmlFor="dateDebut">Date de début <span className="required">*</span></label>
                <input
                  type="date"
                  id="dateDebut"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  required
                  className="form-control"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateFin">Date de fin <span className="required">*</span></label>
                <input
                  type="date"
                  id="dateFin"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  required
                  className="form-control"
                  disabled={loading}
                  min={formData.dateDebut}
                />
              </div>
            </div>
            
            <div className="form-group auto-select-option">
              <label>
                <input
                  type="checkbox"
                  checked={autoSelectAll}
                  onChange={handleAutoSelectChange}
                />
                Sélectionner automatiquement toutes les missions dans la période
              </label>
            </div>
          </>
        )}

        {missions.length > 0 && (
          <div className="missions-section">
            <div className="missions-header">
              <h3>Missions disponibles</h3>
              <div className="missions-actions">
                <button 
                  type="button" 
                  className="btn-select-all"
                  onClick={handleSelectAllMissions}
                >
                  {selectedCount === totalCount ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
                <div className="missions-count">
                  {selectedCount} sur {totalCount} sélectionnée{selectedCount > 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {missions.length === 0 ? (
              <p className="no-missions">Aucune mission disponible pour ce client dans la période sélectionnée</p>
            ) : (
              <div className="missions-list">
                {missions.map(mission => {
                  // Vérifier si la mission est dans la période sélectionnée
                  let isInPeriod = true;
                  if (formData.dateDebut && formData.dateFin) {
                    const missionDebut = new Date(mission.dateDebut);
                    const missionFin = new Date(mission.dateFin);
                    const periodeDebut = new Date(formData.dateDebut);
                    const periodeFin = new Date(formData.dateFin);
                    
                    isInPeriod = (missionDebut <= periodeFin && missionFin >= periodeDebut);
                  }
                  
                  return (
                    <div 
                      key={mission.id} 
                      className={`mission-item ${selectedMissions.includes(mission.id) ? 'selected' : ''} ${!isInPeriod ? 'outside-period' : ''}`}
                      onClick={() => isInPeriod && handleMissionSelect(mission.id)}
                    >
                      <div className="mission-header">
                        <h4>{mission.titre || `Mission ${mission.id}`}</h4>
                        <div className="mission-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedMissions.includes(mission.id)}
                            onChange={() => {}}
                            disabled={!isInPeriod}
                          />
                        </div>
                      </div>
                      <div className="mission-details">
                        <p><strong>Type:</strong> {mission.typeMission}</p>
                        <p><strong>Dates:</strong> {new Date(mission.dateDebut).toLocaleDateString()} - {new Date(mission.dateFin).toLocaleDateString()}</p>
                        <p><strong>Heures:</strong> {mission.heureDebut || 'N/A'} - {mission.heureFin || 'N/A'}</p>
                        <p><strong>Nombre d'agents:</strong> {mission.nombreAgents || 1}</p>
                        <p><strong>Quantité:</strong> {mission.quantite || 1}</p>
                        <div className="mission-financials">
                          <p><strong>Tarif unitaire HT:</strong> {mission.tarif?.prixUnitaireHT?.toFixed(2) || 'N/A'} €</p>
                          <p><strong>Montant HT:</strong> {mission.montantHT?.toFixed(2) || 'N/A'} €</p>
                          <p><strong>TVA ({(mission.tarif?.tauxTVA * 100 || 20).toFixed(0)}%):</strong> {mission.montantTVA?.toFixed(2) || 'N/A'} €</p>
                          <p><strong>Montant TTC:</strong> {mission.montantTTC?.toFixed(2) || 'N/A'} €</p>
                        </div>
                        {mission.tarif && (
                          <div className="majorations">
                            <p><strong>Majorations:</strong></p>
                            <ul>
                              <li>Nuit: +{(parseFloat(mission.tarif?.majorationNuit || 0) * 100).toFixed(0)}%</li>
                              <li>Weekend: +{(parseFloat(mission.tarif?.majorationWeekend || 0) * 100).toFixed(0)}%</li>
                              <li>Dimanche: +{(parseFloat(mission.tarif?.majorationDimanche || 0) * 100).toFixed(0)}%</li>
                              <li>Jours fériés: +{(parseFloat(mission.tarif?.majorationFerie || 0) * 100).toFixed(0)}%</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {previewData && (
          <div className="facture-preview">
            <h3>Aperçu de la facture</h3>
            <div className="facture-header">
              <div className="client-info">
                <h4>Client</h4>
                <p>{previewData.client?.nom} {previewData.client?.prenom}</p>
                <p>{previewData.client?.email}</p>
                <p>{previewData.client?.telephone}</p>
                <p>{previewData.client?.adresse}</p>
                <p>{previewData.client?.codePostal} {previewData.client?.ville}</p>
                {previewData.client?.numeroSiret && <p>SIRET: {previewData.client?.numeroSiret}</p>}
              </div>
              <div className="entreprise-info">
                <h4>Entreprise</h4>
                <p>{previewData.entreprise?.nom}</p>
                <p>SIREN: {previewData.entreprise?.siren || 'N/A'}</p>
                <p>{previewData.entreprise?.adresse}</p>
                <p>{previewData.entreprise?.codePostal} {previewData.entreprise?.ville}</p>
                <p>{previewData.entreprise?.email}</p>
                <p>{previewData.entreprise?.telephone}</p>
              </div>
              <div className="facture-details">
                <h4>Détails de la facture</h4>
                <p><strong>Référence:</strong> {previewData.referenceFacture}</p>
                <p><strong>Période:</strong> {new Date(previewData.dateDebut).toLocaleDateString()} - {new Date(previewData.dateFin).toLocaleDateString()}</p>
                <p><strong>Date d'émission:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <table className="facture-table">
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
                {previewData.missions.map(mission => (
                  <tr key={mission.id}>
                    <td>{mission.titre || `Mission ${mission.id}`}</td>
                    <td>{mission.typeMission}</td>
                    <td>{new Date(mission.dateDebut).toLocaleDateString()} - {new Date(mission.dateFin).toLocaleDateString()}</td>
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
                  <th>{previewData.totalHT.toFixed(2)} €</th>
                  <th>{previewData.totalTVA.toFixed(2)} €</th>
                  <th>{previewData.totalTTC.toFixed(2)} €</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="form-actions">
          {!previewData ? (
            <button
              type="button"
              className="btn-preview"
              onClick={handlePreview}
              disabled={loading || selectedMissions.length === 0}
            >
              Prévisualiser la facture
            </button>
          ) : (
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Création en cours...' : 'Générer la facture'}
            </button>
          )}
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/factures')}
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}