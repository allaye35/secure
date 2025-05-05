// src/components/articleContratTravails/ArticleContratTravailView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams }     from "react-router-dom";
import ArticleContratTravailService   from "../../services/ArticleContratTravailService";

export default function ArticleContratTravailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        ArticleContratTravailService.getById(id)
            .then(res => setItem(res.data))
            .catch(() => setError("Impossible de charger l'article"));
    }, [id]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!item) return <p>Chargement…</p>;

    return (
        <div>
            <h2>👁 ArticleContratTravail #{item.id}</h2>
            <p><strong>Libellé :</strong> {item.libelle}</p>
            <p><strong>Contenu :</strong></p>
            <div style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: 10 }}>
                {item.contenu}
            </div>
            <button onClick={() => navigate(-1)}>← Retour</button>
        </div>
    );
}
