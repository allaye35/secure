import { useEffect, useState }  from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlanningService          from "../../services/PlanningService";
import MissionService           from "../../services/MissionService";

export default function EditPlanning() {

  const { id } = useParams();
  const nav    = useNavigate();

  const [planning, setPlanning] = useState(null);
  const [missions , setMissions] = useState([]);
  const [err,setErr] = useState("");

  /* chargement */
  useEffect(()=>{
    Promise.all([
      PlanningService.getPlanningById(id),
      MissionService.getAllMissions()
    ])
        .then(([pl, ms])=>{
          setPlanning(pl.data);
          setMissions (ms.data);
        })
        .catch(e=>{console.error(e); setErr("Chargement impossible");});
  },[id]);

  if(err)        return <p style={{color:"red"}}>{err}</p>;
  if(!planning)  return <p>Chargement…</p>;

  /* helpers */
  const toggleMission = mId =>{
    const inside = planning.missions.some(m=>m.id===mId);
    const newList = inside
        ? planning.missions.filter(m=>m.id!==mId)
        : [...planning.missions, {id:mId}];

    setPlanning({...planning, missions:newList});
  };

  /* submit */
  const submit = e =>{
    e.preventDefault();
    PlanningService.updatePlanning(id, planning)
        .then(()=> nav("/plannings"))
        .catch(er=>{console.error(er); setErr("Erreur de mise à jour");});
  };

  return (
      <form onSubmit={submit}>
        <h2>Modifier planning #{id}</h2>

        <label>Date de création (lecture seule)</label>{" "}
        <input value={planning.dateCreation.split("T")[0]} readOnly /><br/>

        <h3>Missions</h3>
        {missions.map(mi=>(
            <div key={mi.id}>
              <input type="checkbox"
                     checked={planning.missions.some(m=>m.id===mi.id)}
                     onChange={()=>toggleMission(mi.id)}
              />
              {mi.titre}
            </div>
        ))}

        <button type="submit">Enregistrer</button>
      </form>
  );
}
