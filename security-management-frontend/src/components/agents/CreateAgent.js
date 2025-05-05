// src/components/agents/CreateAgent.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate }                 from 'react-router-dom';
import Select                          from 'react-select';

import AgentService            from '../../services/AgentService';
import ZoneService             from '../../services/ZoneService';
import DisponibiliteService    from '../../services/DisponibiliteService';
import DiplomeService          from '../../services/DiplomeService';
import CarteProService         from '../../services/CarteProService';

import '../../styles/AgentForm.css';          // si tu as un style

export default function CreateAgent () {
  const navigate = useNavigate();

  /* ---------- état principal ---------- */
  const [agent, setAgent] = useState({
    nom             : '',
    prenom          : '',
    email           : '',
    password        : '',
    confirmPassword : '',
    telephone       : '',
    adresse         : '',
    dateNaissance   : '',
    statut          : 'EN_SERVICE',
    role            : 'AGENT_SECURITE'
  });

  /* ---------- listes d’options ---------- */
  const [zonesOpts   , setZonesOpts   ] = useState([]);
  const [disposOpts  , setDisposOpts  ] = useState([]);
  const [diplomesOpts, setDiplomesOpts] = useState([]);
  const [cartesOpts  , setCartesOpts  ] = useState([]);

  /* ---------- sélection utilisateur ---------- */
  const [zonesSel   , setZonesSel   ] = useState([]);
  const [disposSel  , setDisposSel  ] = useState([]);
  const [diplomesSel, setDiplomesSel] = useState([]);
  const [cartesSel  , setCartesSel  ] = useState([]);

  const [error, setError] = useState('');

  /* -------------------------------------------------------------------- */
  /* 1.  Charger les données existantes dès le montage                    */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    ZoneService.getAll().then(res =>
        setZonesOpts(res.data.map(z => ({ value: z.id, label: z.nom })))
    );

    DisponibiliteService.getAll().then(res =>
        setDisposOpts(res.data.map(d => ({
          value: d.id,
          label: `${new Date(d.dateDebut).toLocaleString()} → ${new Date(d.dateFin).toLocaleString()}`
        })))
    );

    DiplomeService.getAll().then(res =>
        setDiplomesOpts(res.data.map(d => ({
          value: d.id,
          label: `${d.niveau} (${new Date(d.dateObtention).toLocaleDateString()})`
        })))
    );

    CarteProService.getAll().then(res =>
        setCartesOpts(res.data.map(c => ({
          value: c.id,
          label: `#${c.numeroCarte} (${new Date(c.dateDebut).toLocaleDateString()})`
        })))
    );
  }, []);

  /* -------------------------------------------------------------------- */
  /* 2.  Binding des champs « texte »                                     */
  /* -------------------------------------------------------------------- */
  const handleChange = e => {
    const { name, value } = e.target;
    setAgent(prev => ({ ...prev, [name]: value }));
  };

  /* -------------------------------------------------------------------- */
  /* 3.  Soumission                                                        */
  /* -------------------------------------------------------------------- */
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (agent.password !== agent.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const payload = {
      ...agent,
      zonesDeTravailIds        : zonesSel.map(o    => o.value),
      disponibilitesIds        : disposSel.map(o   => o.value),
      diplomesSSIAPIds         : diplomesSel.map(o => o.value),
      cartesProfessionnellesIds: cartesSel.map(o   => o.value)
    };

    try {
      await AgentService.createAgent(payload);
      navigate('/agents');
    } catch (err) {
      console.error(err);
      setError("Création impossible : " + (err.response?.data?.message ?? 'erreur serveur'));
    }
  };

  /* -------------------------------------------------------------------- */
  /* 4.  Rendu                                                            */
  /* -------------------------------------------------------------------- */
  return (
      <div className="create-agent-container">
        <h2>Créer un agent de sécurité</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="create-agent-form">
          {/* ----------- identité ----------- */}
          <input  name="nom"     placeholder="Nom"           value={agent.nom}     onChange={handleChange} required/>
          <input  name="prenom"  placeholder="Prénom"        value={agent.prenom}  onChange={handleChange} required/>
          <input  name="email"   autoComplete="off" type="email"
                  placeholder="Email"        value={agent.email}   onChange={handleChange} required/>

          <input  name="password"        autoComplete="new-password" type="password"
                  placeholder="Mot de passe"         value={agent.password}        onChange={handleChange} required/>
          <input  name="confirmPassword" autoComplete="new-password" type="password"
                  placeholder="Confirmer le mot de passe"
                  value={agent.confirmPassword}      onChange={handleChange} required/>

          {/* ----------- contact ----------- */}
          <input  name="telephone" placeholder="Téléphone"   value={agent.telephone} onChange={handleChange}/>
          <input  name="adresse"   placeholder="Adresse"     value={agent.adresse}   onChange={handleChange}/>
          <input  name="dateNaissance" type="date"
                  value={agent.dateNaissance} onChange={handleChange}/>

          {/* ----------- statut / rôle ----------- */}
          <select name="statut" value={agent.statut} onChange={handleChange}>
            <option value="EN_SERVICE">En service</option>
            <option value="EN_CONGE">En congé</option>
            <option value="ABSENT">Absent</option>
          </select>

          {/* ----------- relations multiples ----------- */}
          <label>Zones de travail</label>
          <Select isMulti options={zonesOpts} value={zonesSel} onChange={setZonesSel}/>

          <label>Disponibilités</label>
          <Select isMulti options={disposOpts} value={disposSel} onChange={setDisposSel}/>

          <label>Diplômes SSIAP</label>
          <Select isMulti options={diplomesOpts} value={diplomesSel} onChange={setDiplomesSel}/>

          <label>Cartes professionnelles</label>
          <Select isMulti options={cartesOpts} value={cartesSel} onChange={setCartesSel}/>

          <button type="submit" className="btn submit-btn">Créer</button>
        </form>
      </div>
  );
}
