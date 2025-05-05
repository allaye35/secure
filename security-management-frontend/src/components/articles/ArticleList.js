// src/components/articles/ArticleList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                 from "react-router-dom";
import ArticleService                  from "../../services/ArticleService";
import ContratService                  from "../../services/ContratService";

export default function ArticleList() {
    const [articles, setArticles] = useState([]);
    const [contrats, setContrats] = useState({});
    const nav = useNavigate();

    useEffect(() => {
        ArticleService.getAll()
            .then(res => {
                const arr = res.data;
                setArticles(arr);

                // charger tous les contrats liés
                const ids = Array.from(
                    new Set(arr.map(a => a.contratId).filter(Boolean))
                );
                return Promise.all(
                    ids.map(id =>
                        ContratService.getById(id)
                            .then(r => ({ id, data: r.data }))
                            .catch(() => null)
                    )
                );
            })
            .then(results => {
                const map = {};
                results.forEach(r => {
                    if (r) map[r.id] = r.data;
                });
                setContrats(map);
            })
            .catch(console.error);
    }, []);

    const handleDelete = id => {
        if (window.confirm("Supprimer cet article ?")) {
            ArticleService.remove(id)
                .then(() => setArticles(a => a.filter(x => x.id !== id)))
                .catch(console.error);
        }
    };

    return (
        <div>
            <h2>📝 Articles</h2>
            <button onClick={() => nav("/articles/create")}>
                ➕ Créer un Article
            </button>
            <table border="1" cellPadding="8" style={{ marginTop: 16 }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Numéro</th>
                    <th>Titre</th>
                    <th>Contrat (réf.)</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {articles.map(a => {
                    const c = contrats[a.contratId];
                    return (
                        <tr key={a.id}>
                            <td>{a.id}</td>
                            <td>{a.numero}</td>
                            <td>{a.titre}</td>
                            <td>{c ? c.referenceContrat : a.contratId || "—"}</td>
                            <td>
                                <button onClick={() => nav(`/articles/${a.id}`)}>👁</button>{" "}
                                <button onClick={() => nav(`/articles/edit/${a.id}`)}>✏</button>{" "}
                                <button onClick={() => handleDelete(a.id)} style={{ color: "red" }}>🗑</button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
