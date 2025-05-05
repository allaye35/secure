import { useNavigate, useParams } from "react-router-dom";
import PlanningService            from "../../services/PlanningService";

export default function DeletePlanning(){

    const { id } = useParams();
    const nav    = useNavigate();

    const del = () =>{
        PlanningService.deletePlanning(id).then(()=> nav("/plannings"));
    };

    return (
        <div>
            <h2>Supprimer planning #{id} ?</h2>
            <button onClick={del}>Oui</button>{" "}
            <button onClick={()=>nav("/plannings")}>Annuler</button>
        </div>
    );
}
