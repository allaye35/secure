import { useEffect, useState } from "react";
import { useParams, Link }     from "react-router-dom";
import PlanningService         from "../../services/PlanningService";

export default function PlanningDetail() {
    const { id } = useParams();
    const [planning, setPlanning] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        PlanningService
            .getPlanningById(id)
            .then(res => setPlanning(res.data))
            .catch(() => setErr("Impossible de charger ce planning"));
    }, [id]);

    if (err)       return <p style={{ color: "red" }}>{err}</p>;
    if (!planning) return <p>Chargement…</p>;

    return (
        <div>
            <h2>Planning #{planning.id}</h2>
            <p><b>Créé le :</b> {new Date(planning.dateCreation).toLocaleString()}</p>
            <p><b>Modifié :</b>  {new Date(planning.dateModification).toLocaleString()}</p>

            <h3>Missions</h3>
            {planning.missions.length === 0 && "Aucune mission"}
            <ul>
                {planning.missions.map(m => (
                    <li key={m.id}>
                        {m.titre} ({m.dateDebut} → {m.dateFin}) –{" "}
                        <Link to={`/missions/${m.id}`}>voir</Link>
                    </li>
                ))}
            </ul>

            <Link to="/plannings">← Retour</Link>
        </div>
    );
}
