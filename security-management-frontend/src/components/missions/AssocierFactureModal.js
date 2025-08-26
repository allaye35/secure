import React, { useState } from "react";
import MissionService from "../../services/MissionService";

const AssocierFactureModal = ({ show, missionId, factures, onClose, onSuccess }) => {
  const [selectedFactures, setSelectedFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!show) return null;

  const handleSelect = (factureId) => {
    setSelectedFactures((prev) =>
      prev.includes(factureId)
        ? prev.filter((id) => id !== factureId)
        : [...prev, factureId]
    );
  };

  const handleAssocier = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all(
        selectedFactures.map((factureId) =>
          MissionService.associerFacture(missionId, factureId)
        )
      );
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      setError("Erreur lors de l'association des factures.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Associer une ou plusieurs factures à la mission</h2>
        {error && <div className="error">{error}</div>}
        <ul style={{ maxHeight: "300px", overflowY: "auto" }}>
          {factures.map((facture) => (
            <li key={facture.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedFactures.includes(facture.id)}
                  onChange={() => handleSelect(facture.id)}
                  disabled={loading}
                />
                {facture.reference || facture.numero || facture.id} - {facture.montant} €
                {facture.clientId && (
                  <span style={{marginLeft:8, color:'#555'}}>Client: {facture.clientId}</span>
                )}
              </label>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleAssocier} disabled={loading || selectedFactures.length === 0}>
            Associer
          </button>
          <button onClick={onClose} disabled={loading} style={{ marginLeft: "10px" }}>
            Annuler
          </button>
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          padding: 30px;
          border-radius: 8px;
          min-width: 350px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .error {
          color: red;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default AssocierFactureModal;
