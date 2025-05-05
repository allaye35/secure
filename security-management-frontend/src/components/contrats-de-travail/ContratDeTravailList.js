import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import "../../styles/AgentList.css"; // ou un CSS dédié

const ContratDeTravailList = () => {
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        ContratDeTravailService.getAll()
            .then(res => setList(res.data))
            .catch(() => setError("Impossible de charger les contrats de travail."));
    }, []);

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="agent-list-container">
            <div className="controls">
                <h2>Contrats de travail</h2>
                <Link to="/contrats-de-travail/create" className="btn add-btn">➕ Nouveau contrat</Link>
            </div>
            <div className="table-wrapper">
                <table className="agent-table">
                    <thead>
                    <tr>
                        <th>#</th><th>Réf.</th><th>Type</th><th>Début</th>
                        <th>Fin</th><th>Salaire</th><th>Agent</th><th>Entreprise</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map((c,i)=>(
                        <tr key={c.id}>
                            <td>{i+1}</td>
                            <td>{c.referenceContrat}</td>
                            <td>{c.typeContrat}</td>
                            <td>{c.dateDebut}</td>
                            <td>{c.dateFin||"–"}</td>
                            <td>{c.salaireDeBase}</td>
                            <td>{c.agentDeSecuriteId}</td>
                            <td>{c.entrepriseId}</td>
                            <td className="actions">
                                <Link to={`/contrats-de-travail/${c.id}`} className="btn view">Voir</Link>
                                <Link to={`/contrats-de-travail/edit/${c.id}`} className="btn edit">Modifier</Link>
                                <button
                                    className="btn delete"
                                    onClick={()=>{
                                        if(window.confirm("Supprimer ce contrat ?"))
                                            ContratDeTravailService.delete(c.id)
                                                .then(()=>setList(list.filter(x=>x.id!==c.id)));
                                    }}
                                >Supprimer</button>
                            </td>
                        </tr>
                    ))}
                    {list.length===0 && (
                        <tr><td colSpan="9" className="no-data">Aucun contrat trouvé.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContratDeTravailList;
