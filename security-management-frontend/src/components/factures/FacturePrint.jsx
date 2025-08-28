import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FactureService from '../../services/FactureService';
import ClientService from '../../services/ClientService';
import EntrepriseService from '../../services/EntrepriseService';
import MissionService from '../../services/MissionService';
import '../../styles/FacturePrint.css';

export default function FacturePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [client, setClient] = useState(null);
  const [entreprise, setEntreprise] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fonction pour revenir à la liste des factures
  const handleRetour = () => {
    navigate('/factures');
  };

  useEffect(() => {
    setLoading(true);
    console.log("Chargement des données pour la facture ID:", id);
    
    // Charger la facture
    FactureService.getById(id)
      .then(({ data: factureData }) => {
        console.log("Facture récupérée:", factureData);
        setFacture(factureData);
        
        // Préparer un tableau de promesses à résoudre en parallèle
        const promises = [];
        
        // Promesse pour charger le client
        if (factureData.clientId) {
          promises.push(
            ClientService.getById(factureData.clientId)
              .then(response => {
                console.log("Client récupéré:", response.data);
                setClient(response.data);
              })
              .catch(err => {
                console.error("Erreur lors du chargement du client:", err);
                throw new Error("Impossible de charger les informations du client");
              })
          );
        }
        
        // Promesse pour charger l'entreprise
        if (factureData.entrepriseId) {
          promises.push(
            EntrepriseService.getEntrepriseById(factureData.entrepriseId)
              .then(response => {
                console.log("Entreprise récupérée:", response.data);
                setEntreprise(response.data);
              })
              .catch(err => {
                console.error("Erreur lors du chargement de l'entreprise:", err);
                throw new Error("Impossible de charger les informations de l'entreprise");
              })
          );
        }
        
        // Promesse pour charger les missions
        if (factureData.missionIds && factureData.missionIds.length > 0) {
          const missionPromises = factureData.missionIds.map(missionId => 
            MissionService.getMissionById(missionId)
              .then(response => response.data)
              .catch(err => {
                console.error(`Erreur lors du chargement de la mission ${missionId}:`, err);
                return null;
              })
          );
          
          promises.push(
            Promise.all(missionPromises)
              .then(missionsData => {
                const filteredMissions = missionsData.filter(m => m !== null);
                console.log("Missions récupérées:", filteredMissions);
                setMissions(filteredMissions);
              })
          );
        }
        
        // Exécuter toutes les promesses en parallèle
        return Promise.all(promises);
      })
      .then(() => {
        console.log("Toutes les données ont été chargées avec succès");
        setLoading(false);
        
        // Déclencher l'impression automatiquement après un court délai
        setTimeout(() => {
          window.print();
        }, 1000);
      })
      .catch(err => {
        console.error("Erreur lors du chargement des données:", err);
        setError('Erreur lors du chargement des données: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  }, [id]);

  // Listener pour détecter quand l'impression est terminée
  useEffect(() => {
    window.onafterprint = () => {
      console.log("Impression terminée, retour à la page précédente");
      navigate('/factures');
    };
    
    return () => {
      window.onafterprint = undefined;
    };
  }, [navigate]);

  // Fonction pour télécharger la facture en PDF
  const handleDownloadPDF = () => {
    if (!facture) return;
    
    FactureService.getPdf(id)
      .then(response => {
        // Créer un URL à partir du blob directement depuis response.data
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `facture-${facture.referenceFacture}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Libérer l'URL après utilisation
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error("Erreur lors du téléchargement du PDF:", err);
        setError('Erreur lors du téléchargement du PDF: ' + (err.response?.data?.message || err.message));
      });
  };

  if (loading) return (
    <div className="facture-print-loading">
      <div className="loader"></div>
      <p>Chargement des données de la facture...</p>
    </div>
  );
  
  if (error) return (
    <div className="facture-print-error">
      <h2>Une erreur est survenue</h2>
      <p className="error-message">{error}</p>
      <button onClick={handleRetour} className="btn-back">
        Retour
      </button>
    </div>
  );
  
  if (!facture || !client || !entreprise) return (
    <div className="facture-print-error">
      <h2>Données incomplètes</h2>
      <p>Impossible d'afficher la facture : informations manquantes</p>
      <button onClick={handleRetour} className="btn-back">
        Retour
      </button>
    </div>
  );

  return (
    <div className="facture-print-container">
      <div className="facture-print-actions print-hidden">
        <button onClick={() => window.print()} className="btn-print">
          Imprimer
        </button>
        <button onClick={handleDownloadPDF} className="btn-download">
          Télécharger PDF
        </button>
        <button onClick={handleRetour} className="btn-back">
          Retour
        </button>
      </div>
      
      <div className="facture-print">
        <div className="facture-header">
          <div className="facture-logo">
            {entreprise.logo && <img src={entreprise.logo} alt="Logo entreprise" />}
          </div>
          <div className="facture-info">
            <h1>FACTURE</h1>
            <div className="reference">N° {facture.referenceFacture}</div>
            <div className="date">Date: {new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</div>
            {facture.statut && (
              <div className={`facture-statut ${facture.statut.toLowerCase()}`}>
                {facture.statut}
              </div>
            )}
          </div>
        </div>
        
        <div className="facture-parties">
          <div className="entreprise-info">
            <h3>{entreprise.nom}</h3>
            <p>{entreprise.adresse || ''}</p>
            <p>{entreprise.codePostal || ''} {entreprise.ville || ''}</p>
            <p>SIREN: {entreprise.siren || 'Non spécifié'}</p>
            <p>Tél: {entreprise.telephone || 'Non spécifié'}</p>
            <p>Email: {entreprise.email || 'Non spécifié'}</p>
          </div>
          
          <div className="client-info">
            <h3>Client</h3>
            <p>{client.nom} {client.prenom || ''}</p>
            <p>{client.adresse || ''}</p>
            <p>{client.codePostal || ''} {client.ville || ''}</p>
            {client.numeroSiret && <p>SIRET: {client.numeroSiret}</p>}
            <p>Tél: {client.telephone || 'Non spécifié'}</p>
            <p>Email: {client.email || 'Non spécifié'}</p>
          </div>
        </div>
        
        {facture.dateDebut && facture.dateFin && (
          <div className="facture-periode">
            <h3>Période de facturation</h3>
            <p>Du {new Date(facture.dateDebut).toLocaleDateString('fr-FR')} au {new Date(facture.dateFin).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
        
        <div className="facture-details">
          <h3>Détails des prestations</h3>
          <table className="missions-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th>Agents</th>
                <th>Montant HT</th>
                <th>TVA</th>
                <th>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {missions.length > 0 ? (
                missions.map(mission => (
                  <tr key={mission.id}>
                    <td>{mission.titre || mission.typeMission || `Mission #${mission.id}`}</td>
                    <td>
                      {mission.dateDebut ? new Date(mission.dateDebut).toLocaleDateString('fr-FR') : ''}
                      {mission.dateDebut !== mission.dateFin && mission.dateFin && 
                        ` au ${new Date(mission.dateFin).toLocaleDateString('fr-FR')}`}
                    </td>
                    <td>{mission.nombreAgents || 1}</td>
                    <td>{mission.montantHT ? mission.montantHT.toFixed(2) : '0.00'} €</td>
                    <td>{mission.montantTVA ? mission.montantTVA.toFixed(2) : '0.00'} €</td>
                    <td>{mission.montantTTC ? mission.montantTTC.toFixed(2) : '0.00'} €</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">Facture globale - Aucun détail de mission disponible</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="facture-totals">
          <div className="total-row">
            <span>Total HT:</span>
            <span>{facture.montantHT ? facture.montantHT.toFixed(2) : '0.00'} €</span>
          </div>
          <div className="total-row">
            <span>TVA:</span>
            <span>{facture.montantTVA ? facture.montantTVA.toFixed(2) : '0.00'} €</span>
          </div>
          <div className="total-row total-ttc">
            <span>Total TTC:</span>
            <span>{facture.montantTTC ? facture.montantTTC.toFixed(2) : '0.00'} €</span>
          </div>
        </div>
        
        <div className="facture-footer">
          <div className="paiement-info">
            <h4>Instructions de paiement</h4>
            <p>Facture à régler sous 30 jours.</p>
            <p>Règlement par virement bancaire:</p>
            <p>IBAN: {entreprise.iban || 'FR76 XXXX XXXX XXXX XXXX XXXX XXX'}</p>
            <p>Référence à rappeler: {facture.referenceFacture}</p>
          </div>
          
          <p className="mentions-legales">
            {entreprise.nom} - SIREN: {entreprise.siren || 'Non spécifié'} - APE: {entreprise.codeApe || 'XXXX'}
            <br />TVA Intracommunautaire: {entreprise.numeroTva || 'FR XX XXX XXX XXX'}
          </p>
        </div>
      </div>
    </div>
  );
}