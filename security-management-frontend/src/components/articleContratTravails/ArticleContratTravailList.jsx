// src/components/articleContratTravails/ArticleContratTravailList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                from "react-router-dom";
import ArticleContratTravailService   from "../../services/ArticleContratTravailService";

export default function ArticleContratTravailList() {
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        ArticleContratTravailService.getAll()
            .then(res => setItems(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleDelete = id => {
        if (window.confirm("Supprimer cet article contrat de travail ?")) {
            ArticleContratTravailService.remove(id).then(() => {
                setItems(prev => prev.filter(x => x.id !== id));
            });
        }
    };

    return (
        <div>
            <h2>📝 Liste des Articles Contrat de Travail</h2>
            <button onClick={() => navigate("/article-contrat-travail/create")}>
                ➕ Créer un ArticleContratTravail
            </button>
            <table style={{ width: "100%", marginTop: 20 }} border="1">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Libellé</th>
                    <th>Contenu</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {items.map(a => (
                    <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.libelle}</td>
                        <td>{a.contenu ? a.contenu.slice(0, 50) + "…" : "Pas de contenu"}</td>
                        <td>
                            <button onClick={() => navigate(`/article-contrat-travail/${a.id}`)}>
                                👁 Voir
                            </button>{" "}
                            <button onClick={() => navigate(`/article-contrat-travail/edit/${a.id}`)}>
                                ✏ Modifier
                            </button>{" "}
                            <button
                                onClick={() => handleDelete(a.id)}
                                style={{ color: "red" }}
                            >
                                🗑 Supprimer
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
