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
        } else {
          // Création : seulement les missions libres
          setMissionsDisponibles(optionsSansDevis);
        }
      } catch (e) {
        console.error(e);
        setError("Erreur lors du chargement initial");
      } finally {
        setLoading(false);
      }
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
      <div className="loading-container">
        <p>Chargement...</p>
        <div className="loading-spinner" />
      </div>
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
