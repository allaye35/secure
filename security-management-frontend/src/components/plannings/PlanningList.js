// src/components/plannings/PlanningList.js
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlanningService from "../../services/PlanningService";
import MissionService from "../../services/MissionService";

export default function PlanningList() {
  const [plannings, setPlannings] = useState([]);
  const [missions, setMissions] = useState([]);
  const [selection, setSelection] = useState({}); // { planningId: missionId }
  const [filters, setFilters] = useState({ agent: "", mission: "", d1: "", d2: "" });

  // ─── Chargement initial ───────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    PlanningService.getAllPlannings()
        .then((res) => {
          if (Array.isArray(res.data)) {
            setPlannings(res.data);
          } else {
            console.error("Plannings non reçus sous forme de tableau :", res.data);
            setPlannings([]);
          }
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des plannings :", err);
          setPlannings([]);
        });

    MissionService.getAllMissions()
        .then((res) => {
          if (Array.isArray(res.data)) {
            setMissions(res.data);
          } else {
            console.error("Missions non reçues sous forme de tableau :", res.data);
            setMissions([]);
          }
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des missions :", err);
          setMissions([]);
        });
  }

  // ─── Supprimer un planning ────────────────────────────────
  const deletePlanning = (id) => {
    if (!window.confirm("Supprimer ce planning ?")) return;
    PlanningService.deletePlanning(id).then(() => loadAll());
  };

  // ─── Ajouter / retirer une mission ───────────────────────
  const addMission = (planningId) => {
    const mid = selection[planningId];
    if (!mid) return alert("Choisissez une mission !");
    PlanningService.addMissionToPlanning(planningId, mid).then(() => loadAll());
  };

  const removeMission = (planningId, missionId) => {
    if (!window.confirm("Retirer cette mission ?")) return;
    PlanningService.removeMissionFromPlanning(planningId, missionId).then(() => loadAll());
  };

  // ─── Filtrage ────────────────────────────────────────────
  const runFilter = async () => {
    const { agent, mission, d1, d2 } = filters;

    try {
      if (agent) {
        const data = await PlanningService.getPlanningsByAgent(agent);
        setPlannings(Array.isArray(data) ? data : []);
        return;
      }
      if (mission) {
        const data = await PlanningService.getPlanningsByMission(mission);
        setPlannings(Array.isArray(data) ? data : []);
        return;
      }
      if (d1 && d2) {
        if (new Date(d1) > new Date(d2)) {
          return alert("La date de début doit être antérieure à la date de fin");
        }
        const data = await PlanningService.getPlanningsByDateRange(d1, d2);
        setPlannings(Array.isArray(data) ? data : []);
        return;
      }
      // Si aucun filtre, on recharge tout
      loadAll();
    } catch (err) {
      console.error("Erreur lors du filtrage :", err);
      setPlannings([]);
    }
  };

  return (
      <div>
        <h2>📅 Plannings</h2>
        <Link to="/plannings/create">
          <button>➕ Nouveau planning</button>
        </Link>

        {/* filtres */}
        <div style={{ margin: "20px 0" }}>
          <input
              placeholder="ID Agent"
              value={filters.agent}
              onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
          />
          <input
              placeholder="ID Mission"
              value={filters.mission}
              onChange={(e) => setFilters({ ...filters, mission: e.target.value })}
          />
          <input
              type="date"
              value={filters.d1}
              onChange={(e) => setFilters({ ...filters, d1: e.target.value })}
          />
          <input
              type="date"
              value={filters.d2}
              onChange={(e) => setFilters({ ...filters, d2: e.target.value })}
          />
          <button onClick={runFilter}>🔍 Filtrer</button>
        </div>

        <table border="1" width="100%">
          <thead>
          <tr>
            <th>ID</th>
            <th>Créé</th>
            <th>Modifié</th>
            <th>Agents</th>
            <th>Missions</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {plannings.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{new Date(p.dateCreation).toLocaleString()}</td>
                <td>{new Date(p.dateModification).toLocaleString()}</td>
                <td>
                  <ul>
                    {(p.missions?.flatMap((m) => m.agents) || []).map((a) => (
                        <li key={`agent-${p.id}-${a.id}`}>
                          {a.nom} {a.prenom}
                        </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul>
                    {(p.missions || []).map((m) => (
                        <li key={`mis-${m.id}`}>
                          {m.titre}
                          <button
                              style={{ color: "red", marginLeft: 6 }}
                              onClick={() => removeMission(p.id, m.id)}
                          >
                            ✖
                          </button>
                        </li>
                    ))}
                  </ul>
                  <select
                      value={selection[p.id] || ""}
                      onChange={(e) => setSelection({ ...selection, [p.id]: e.target.value })}
                  >
                    <option value="">— mission —</option>
                    {missions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.titre}
                        </option>
                    ))}
                  </select>
                  <button onClick={() => addMission(p.id)}>➕</button>
                </td>
                <td>
                  <Link to={`/plannings/${p.id}`}>👁</Link> |{" "}
                  <Link to={`/plannings/edit/${p.id}`}>✏</Link> |{" "}
                  <button onClick={() => deletePlanning(p.id)}>🗑</button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}
