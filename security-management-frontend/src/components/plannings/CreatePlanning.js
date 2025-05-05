import { useState }   from "react";
import { useNavigate }from "react-router-dom";
import PlanningService from "../../services/PlanningService";

export default function CreatePlanning() {

  /* un seul champ : dateCreation */
  const today = new Date().toISOString().split("T")[0];
  const [date,setDate] = useState(today);
  const [err ,setErr ] = useState("");
  const nav = useNavigate();

  const submit = e =>{
    e.preventDefault();
    PlanningService.createPlanning({ dateCreation:`${date}T00:00:00` })
        .then(()=> nav("/plannings"))
        .catch(er=>{
          console.error(er); setErr("Création impossible");});
  };

  return (
      <form onSubmit={submit}>
        <h2>Créer un planning</h2>
        {err && <p style={{color:"red"}}>{err}</p>}

        <label>Date :</label>{" "}
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} required />

        <button type="submit">Enregistrer</button>
      </form>
  );
}
