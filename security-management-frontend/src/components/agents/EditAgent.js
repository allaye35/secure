/* src/components/agents/EditAgent.jsx */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams }     from "react-router-dom";
import Select                         from "react-select/creatable";

/* ─── services REST ───────────────────────────────────────────────────── */
import AgentService            from "../../services/AgentService";
import ZoneService             from "../../services/ZoneService";
import MissionService          from "../../services/MissionService";          // ⇦ getAllMissions()
import DisponibiliteService    from "../../services/DisponibiliteService";
import DiplomeService          from "../../services/DiplomeService";
import CarteProService         from "../../services/CarteProService";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import NotificationService     from "../../services/NotificationService";

import "../../styles/AgentForm.css";

export default function EditAgent() {
  const { id }   = useParams();
  const navigate = useNavigate();

  /* ╔══════════════════════════╗
     ║   1) ÉTAT PRINCIPAL      ║
     ╚══════════════════════════╝ */
  const [agent, setAgent] = useState({
    nom: "", prenom: "", email: "", telephone: "", adresse: "",
    dateNaissance: "", statut: "EN_SERVICE", role: "AGENT_SECURITE",
    password: "******", newPassword: ""
  });

  /* ╔══════════════════════════╗
     ║   2) OPTIONS <Select>    ║
     ╚══════════════════════════╝ */
  const [zonesOpts,    setZonesOpts]    = useState([]);
  const [missionsOpts, setMissionsOpts] = useState([]);
  const [disposOpts,   setDisposOpts]   = useState([]);
  const [diplomesOpts, setDiplomesOpts] = useState([]);
  const [cartesOpts,   setCartesOpts]   = useState([]);
  const [contratsOpts, setContratsOpts] = useState([]);
  const [notifsOpts,   setNotifsOpts]   = useState([]);

  /* ╔══════════════════════════╗
     ║   3) SÉLECTION COURANTE  ║
     ╚══════════════════════════╝ */
  const [zonesSel,     setZonesSel]     = useState([]);
  const [missionsSel,  setMissionsSel]  = useState([]);
  const [disposSel,    setDisposSel]    = useState([]);
  const [diplomesSel,  setDiplomesSel]  = useState([]);
  const [cartesSel,    setCartesSel]    = useState([]);
  const [contratsSel,  setContratsSel]  = useState([]);
  const [notifsSel,    setNotifsSel]    = useState([]);

  /* ╔══════════════════════════╗
     ║   4) FLAGS “TOUCHED”     ║
     ╚══════════════════════════╝ */
  const [disposTouched,   setDisposTouched]   = useState(false);
  const [diplomesTouched, setDiplomesTouched] = useState(false);
  const [cartesTouched,   setCartesTouched]   = useState(false);
  const [contratsTouched, setContratsTouched] = useState(false);
  const [notifsTouched,   setNotifsTouched]   = useState(false);

  const [error, setError] = useState("");

  /* ╔══════════════════════════╗
     ║   5) CHARGEMENT INITIAL  ║
     ╚══════════════════════════╝ */
  useEffect(() => {
    /* 5‑1  options */
    ZoneService.getAll()
        .then(r => setZonesOpts(r.data.map(z => ({ value: z.id, label: z.nom }))));

    MissionService.getAllMissions()
        .then(r => setMissionsOpts(r.data.map(m => ({ value: m.id, label: m.titre }))));

    DisponibiliteService.getAll()
        .then(r => setDisposOpts(r.data.map(d => ({
          value: d.id,
          label: `${new Date(d.dateDebut).toLocaleString()} → ${new Date(d.dateFin).toLocaleString()}`
        }))));

    DiplomeService.getAll()
        .then(r => setDiplomesOpts(r.data.map(d => ({
          value: d.id,
          label: `${d.niveau} (${new Date(d.dateObtention).toLocaleDateString()})`
        }))));

    CarteProService.getAll()
        .then(r => setCartesOpts(r.data.map(c => ({
          value: c.id,
          label: `#${c.numeroCarte} (${new Date(c.dateDebut).toLocaleDateString()})`
        }))));

    ContratDeTravailService.getAll()
        .then(r => setContratsOpts(r.data.map(c => ({
          value: c.id,
          label: `${c.typeContrat} (${new Date(c.dateDebut).toLocaleDateString()})`
        }))));

    NotificationService.getAll()
        .then(r => setNotifsOpts(r.data.map(n => ({
          value: n.id,
          label: `${n.titre} — ${new Date(n.dateEnvoi).toLocaleDateString()}`
        }))));

    /* 5‑2  données de l’agent */
    AgentService.getAgentById(id).then(({ data }) => {
      setAgent(a => ({
        ...a,
        ...data,
        password: "******",
        newPassword: "",
        dateNaissance: data.dateNaissance ? data.dateNaissance.slice(0, 10) : ""
      }));

      setZonesSel    (data.zonesDeTravailIds?.map(v => ({ value: v, label: "" })) ?? []);
      setMissionsSel (data.missionsIds?.map        (v => ({ value: v, label: "" })) ?? []);
      setDisposSel   (data.disponibilitesIds?.map  (v => ({ value: v, label: "" })) ?? []);
      setDiplomesSel (data.diplomesSSIAPIds?.map   (v => ({ value: v, label: "" })) ?? []);
      setCartesSel   (data.cartesProfessionnellesIds?.map(v => ({ value: v, label: "" })) ?? []);
      setContratsSel (data.contratsDeTravailIds?.map(v => ({ value: v, label: "" })) ?? []);
      setNotifsSel   (data.notificationsIds?.map   (v => ({ value: v, label: "" })) ?? []);
    });
  }, [id]);

  /* ╔══════════════════════════╗
     ║   6) HANDLERS            ║
     ╚══════════════════════════╝ */
  const handleChange = e => {
    const { name, value } = e.target;
    setAgent(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError("");

    const payload = {
      id,
      nom: agent.nom, prenom: agent.prenom, email: agent.email,
      telephone: agent.telephone, adresse: agent.adresse,
      dateNaissance: agent.dateNaissance || null,
      statut: agent.statut, role: agent.role,
      password: agent.newPassword ? agent.newPassword : undefined,

      /* toujours envoyés */
      zonesDeTravailIds: zonesSel.map(o => o.value),
      missionsIds      : missionsSel.map(o => o.value)
    };

    /* envoyés seulement si modifiés (collections orphanRemoval) */
    if (disposTouched)   payload.disponibilitesIds         = disposSel.map(o => o.value);
    if (cartesTouched)   payload.cartesProfessionnellesIds = cartesSel.map(o => o.value);
    if (diplomesTouched) payload.diplomesSSIAPIds          = diplomesSel.map(o => o.value);
    if (contratsTouched) payload.contratsDeTravailIds      = contratsSel.map(o => o.value);
    if (notifsTouched)   payload.notificationsIds          = notifsSel.map(o => o.value);

    try {
      await AgentService.updateAgent(id, payload);
      navigate("/agents");
    } catch (err) {
      setError(`Mise à jour impossible : ${err.response?.data?.message ?? "serveur indisponible"}`);
    }
  };

  /* ╔══════════════════════════╗
     ║   7) UI                  ║
     ╚══════════════════════════╝ */
  return (
      <div className="create-agent-container">
        <h2>Modifier l’agent</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="create-agent-form">
          {/* champs simples */}
          <input name="nom"    placeholder="Nom"    value={agent.nom}    onChange={handleChange} required />
          <input name="prenom" placeholder="Prénom" value={agent.prenom} onChange={handleChange} required />
          <input name="email"  type="email" placeholder="Email"
                 value={agent.email} onChange={handleChange} required />
          <input name="telephone" placeholder="Téléphone"
                 value={agent.telephone} onChange={handleChange} />
          <input name="adresse"   placeholder="Adresse"
                 value={agent.adresse} onChange={handleChange} />
          <input name="dateNaissance" type="date"
                 value={agent.dateNaissance} onChange={handleChange} />
          <input name="newPassword" type="password"
                 placeholder="Nouveau mot de passe (laisser vide pour conserver)"
                 value={agent.newPassword} onChange={handleChange} />

          <select name="statut" value={agent.statut} onChange={handleChange}>
            <option value="EN_SERVICE">En service</option>
            <option value="EN_CONGE">En congé</option>
            <option value="ABSENT">HORS_SERVICE</option>
          </select>

          {/* relations */}
          <label>Zones de travail</label>
          <Select isMulti options={zonesOpts}    value={zonesSel}    onChange={setZonesSel} />

          <label>Missions</label>
          <Select isMulti options={missionsOpts} value={missionsSel} onChange={setMissionsSel} />

          <label>Disponibilités</label>
          <Select isMulti options={disposOpts}   value={disposSel}
                  onChange={sel => { setDisposSel(sel); setDisposTouched(true); }} />

          <label>Diplômes SSIAP</label>
          <Select isMulti options={diplomesOpts} value={diplomesSel}
                  onChange={sel => { setDiplomesSel(sel); setDiplomesTouched(true); }} />

          <label>Cartes professionnelles</label>
          <Select isMulti options={cartesOpts}   value={cartesSel}
                  onChange={sel => { setCartesSel(sel); setCartesTouched(true); }} />

          <label>Contrats de travail</label>
          <Select isMulti options={contratsOpts} value={contratsSel}
                  onChange={sel => { setContratsSel(sel); setContratsTouched(true); }} />

          <label>Notifications</label>
          <Select isMulti options={notifsOpts}   value={notifsSel}
                  onChange={sel => { setNotifsSel(sel); setNotifsTouched(true); }} />

          <button type="submit" className="btn submit-btn">Enregistrer</button>
        </form>
      </div>
  );
}
