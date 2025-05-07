import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FactureService from '../../services/FactureService';
import ClientService from '../../services/ClientService';
import '../../styles/FactureForm.css';

export default function FacturePeriodeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientId: '',
    dateDebut: '',
    dateFin: '',
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger la liste des clients au chargement du composant
  useEffect(() => {
    setLoading(true);
    ClientService.getAll()
      .then(response => {
        setClients(response.data);
      })
      .catch(err => {
        setError('Impossible de charger la liste des clients: ' + (err.response?.data?.message || err.message));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Appel corrigé au service de facturation pour créer une facture sur la période
    FactureService.createForPeriod(
      formData.clientId, // L'ID du client (sera converti en entier dans le service)
      formData.dateDebut, // Date de début (format YYYY-MM-DD)
      formData.dateFin    // Date de fin (format YYYY-MM-DD)
    )
      .then(response => {
        // Redirection vers le détail de la facture créée
        navigate(`/factures/${response.data.id}`);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setError('Erreur lors de la création de la facture: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  };

  return (
    <div className="facture-form">
      <h2>Créer une facture pour une période</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="clientId">Client</label>
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
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.nom} {client.prenom || ''} - {client.entreprise?.nom || 'Particulier'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dateDebut">Date de début</label>
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
          <label htmlFor="dateFin">Date de fin</label>
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

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Générer la facture'}
          </button>
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