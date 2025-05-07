import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FactureService from '../../services/FactureService';
import ClientService from '../../services/ClientService';
import EntrepriseService from '../../services/EntrepriseService';
import MissionService from '../../services/MissionService';
import '../../styles/FacturePrint.css';

export default function FacturePrint() {
  const { id } = useParams();
  const [facture, setFacture] = useState(null);
  const [client, setClient] = useState(null);
  const [entreprise, setEntreprise] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    
    // Charger la facture
    FactureService.getById(id)
      .then(({ data }) => {
        setFacture(data);
        
        // Charger le client
        return ClientService.getById(data.clientId);
      })
      .then(({ data: clientData }) => {
        setClient(clientData);
        
        // Charger l'entreprise
        return EntrepriseService.getById(facture.entrepriseId);
      })
      .then(({ data: entrepriseData }) => {
        setEntreprise(entrepriseData);
        
        // Charger les missions si disponibles
        if (facture.missionIds && facture.missionIds.length > 0) {
          return Promise.all(
            facture.missionIds.map(missionId => 
              MissionService.getById(missionId)
                .then(res => res.data)
                .catch(() => null)
            )
          );
        }
        return [];
      })
      .then(missionsData => {
        setMissions(missionsData.filter(m => m !== null));
      })
      .catch(err => {
        setError('Erreur lors du chargement des données: ' + (err.response?.data?.message || err.message));
      })
      .finally(() => {
        setLoading(false);
        
        // Déclencher l'impression automatiquement
        if (window.onafterprint === undefined) {
          setTimeout(() => {
            window.print();
          }, 1000);
        }
      });
  }, [id]);

  // Listener pour détecter quand l'impression est terminée
  useEffect(() => {
    window.onafterprint = () => {
      window.history.back();
    };
    
    return () => {
      window.onafterprint = undefined;
    };
  }, []);

  // Fonction pour télécharger la facture en PDF
  const handleDownloadPDF = () => {
    FactureService.getPdf(id)
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `facture-${facture.referenceFacture}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        setError('Erreur lors du téléchargement du PDF: ' + (err.response?.data?.message || err.message));
      });
  };

  if (loading) return <div className="loader">Chargement des données de la facture...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!facture || !client || !entreprise) return <div className="error-message">Données incomplètes</div>;

  return (
    <div className="facture-print-container">
      <div className="facture-print-actions print-hidden">
        <button onClick={() => window.print()} className="btn-print">
          Imprimer
        </button>
        <button onClick={handleDownloadPDF} className="btn-download">
          Télécharger PDF
        </button>
        <button onClick={() => window.history.back()} className="btn-back">
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
          </div>
        </div>
        
        <div className="facture-parties">
          <div className="entreprise-info">
            <h3>{entreprise.nom}</h3>
            <p>{entreprise.adresse}</p>
            <p>{entreprise.codePostal} {entreprise.ville}</p>
            <p>SIRET: {entreprise.siret}</p>
            <p>Tél: {entreprise.telephone}</p>
            <p>Email: {entreprise.email}</p>
          </div>
          
          <div className="client-info">
            <h3>Client</h3>
            <p>{client.nom} {client.prenom || ''}</p>
            <p>{client.adresse}</p>
            <p>{client.codePostal} {client.ville}</p>
            {client.siret && <p>SIRET: {client.siret}</p>}
            <p>Tél: {client.telephone}</p>
            <p>Email: {client.email}</p>
          </div>
        </div>
        
        <div className="facture-details">
          <h3>Détails des prestations</h3>
          <table className="missions-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th>Heures</th>
                <th>Agents</th>
                <th>Montant HT</th>
              </tr>
            </thead>
            <tbody>
              {missions.length > 0 ? (
                missions.map(mission => (
                  <tr key={mission.id}>
                    <td>{mission.titre || mission.typeMission}</td>
                    <td>
                      {new Date(mission.dateDebut).toLocaleDateString('fr-FR')}
                      {mission.dateDebut !== mission.dateFin && 
                        ` au ${new Date(mission.dateFin).toLocaleDateString('fr-FR')}`}
                    </td>
                    <td>
                      {mission.heureDebut} - {mission.heureFin}
                    </td>
                    <td>{mission.nombreAgents}</td>
                    <td>{mission.montantHT.toFixed(2)} €</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">Facture globale</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="facture-totals">
          <div className="total-row">
            <span>Total HT:</span>
            <span>{facture.montantHT.toFixed(2)} €</span>
          </div>
          <div className="total-row">
            <span>TVA:</span>
            <span>{facture.montantTVA.toFixed(2)} €</span>
          </div>
          <div className="total-row total-ttc">
            <span>Total TTC:</span>
            <span>{facture.montantTTC.toFixed(2)} €</span>
          </div>
        </div>
        
        <div className="facture-footer">
          <p>Facture à régler sous 30 jours.</p>
          <p>Règlement par virement bancaire:</p>
          <p>IBAN: {entreprise.iban || 'FR76 XXXX XXXX XXXX XXXX XXXX XXX'}</p>
          
          <p className="mentions-legales">
            {entreprise.nom} - SIRET: {entreprise.siret} - APE: {entreprise.codeApe || 'XXXX'}
            <br />TVA Intracommunautaire: {entreprise.numeroTva || 'FR XX XXX XXX XXX'}
          </p>
        </div>
      </div>
    </div>
  );
}