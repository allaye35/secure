import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MissionService from "../../services/MissionService";

export default function CreateMission() {
  const navigate = useNavigate();

  // 1) On charge d’abord les listes TarifMission et Devis pour les <select>
  const [tarifs, setTarifs]     = useState([]);
  const [devisList, setDevisList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/tarifs")
        .then(r => r.json())
        .then(setTarifs)
        .catch(console.error);

    fetch("http://localhost:8080/api/devis")
        .then(r => r.json())
        .then(setDevisList)
        .catch(console.error);
  }, []);

  // 2) État local de la nouvelle mission (tous les champs obligatoires + optionnels)
  const [mission, setMission] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    heureDebut: "",
    dateFin: "",
    heureFin: "",
    statutMission: "PLANIFIEE",
    typeMission: "SURVEILLANCE",
    nombreAgents: 1,
    quantite: 1,
    tarif: { id: "" },
    devis: { id: "" },
  });

  const [error, setError]       = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3) Mise à jour des champs (gère aussi tarif.id et devis.id)
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "tarif") {
      setMission(m => ({ ...m, tarif: { id: value } }));
    } else if (name === "devis") {
      setMission(m => ({ ...m, devis: { id: value } }));
    } else {
      setMission(m => ({ ...m, [name]: value }));
    }
  };

  // 4) Soumission
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Vérif rapide
    if (
        !mission.titre ||
        !mission.description ||
        !mission.dateDebut ||
        !mission.dateFin ||
        !mission.tarif.id ||
        !mission.devis.id
    ) {
      setError("Tous les champs marqués * sont obligatoires.");
      setIsSubmitting(false);
      return;
    }

    try {
      await MissionService.createMission(mission);
      navigate("/missions");
    } catch (err) {
      console.error(err);
      setError("Erreur côté serveur, impossible de créer la mission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div style={{ padding: 20 }}>
        <h2>➕ Créer une Mission</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Titre *<br/>
              <input name="titre" value={mission.titre} onChange={handleChange} />
            </label>
          </div>

          <div>
            <label>
              Description *<br/>
              <textarea name="description" value={mission.description} onChange={handleChange} />
            </label>
          </div>

          <div>
            <label>
              Début *<br/>
              <input type="date" name="dateDebut" value={mission.dateDebut} onChange={handleChange} />
              &nbsp;
              <input type="time" name="heureDebut" value={mission.heureDebut} onChange={handleChange} />
            </label>
          </div>

          <div>
            <label>
              Fin *<br/>
              <input type="date" name="dateFin" value={mission.dateFin} onChange={handleChange} />
              &nbsp;
              <input type="time" name="heureFin" value={mission.heureFin} onChange={handleChange} />
            </label>
          </div>

          <div>
            <label>
              Statut<br/>
              <select name="statutMission" value={mission.statutMission} onChange={handleChange}>
                <option value="PLANIFIEE">Planifiée</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Type<br/>
              <select name="typeMission" value={mission.typeMission} onChange={handleChange}>
                <option value="SURVEILLANCE">Surveillance</option>
                <option value="GARDE_DU_CORPS">Garde du corps</option>
                <option value="SECURITE_INCENDIE">Sécurité incendie</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Nb d’agents prévu<br/>
              <input
                  type="number"
                  name="nombreAgents"
                  min="1"
                  value={mission.nombreAgents}
                  onChange={handleChange}
              />
            </label>
          </div>

          <div>
            <label>
              Quantité<br/>
              <input
                  type="number"
                  name="quantite"
                  min="1"
                  value={mission.quantite}
                  onChange={handleChange}
              />
            </label>
          </div>

          <div>
            <label>
              Tarif *<br/>
              <select name="tarif" value={mission.tarif.id} onChange={handleChange}>
                <option value="">— choisissez —</option>
                {tarifs.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.libelle} ({t.prixUnitaireHT} € HT)
                    </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Devis *<br/>
              <select name="devis" value={mission.devis.id} onChange={handleChange}>
                <option value="">— choisissez —</option>
                {devisList.map(d => (
                    <option key={d.id} value={d.id}>
                      #{d.id} – {d.reference}
                    </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ marginTop: 16 }}>
            {isSubmitting ? "Création en cours…" : "Créer la mission"}
          </button>
        </form>
      </div>
  );
}
