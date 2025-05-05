// src/components/articles/ArticleDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate }     from "react-router-dom";
import ArticleService                  from "../../services/ArticleService";
import ContratService                  from "../../services/ContratService";

export default function ArticleDetail() {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const [article, setArticle] = useState(null);
    const [contrat, setContrat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        // 1) Charger l'article
        ArticleService.getById(id)
            .then(res => {
                setArticle(res.data);
                // 2) si un contrat est référencé, le charger aussi
                if (res.data.contratId) {
                    return ContratService.getById(res.data.contratId)
                        .then(r2 => setContrat(r2.data))
                        .catch(() => {
                            // si échec, on laisse contrat à null
                            console.warn("Impossible de charger le contrat associé");
                        });
                }
            })
            .catch(err => {
                console.error(err);
                setError("Impossible de charger l’article.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Chargement…</p>;
    if (error)   return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: 20 }}>
            <h2>👁 Article #{article.id}</h2>
            <p><strong>Numéro :</strong> {article.numero}</p>
            <p><strong>Titre :</strong> {article.titre}</p>
            <p>
                <strong>Contenu :</strong><br/>
                {article.contenu || "(aucun contenu)"}
            </p>

            {contrat ? (
                <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc" }}>
                    <h3>🔗 Contrat associé</h3>
                    <p><strong>Référence :</strong> {contrat.referenceContrat}</p>
                    <p><strong>Date de signature :</strong> {contrat.dateSignature}</p>
                    <p><strong>Durée (mois) :</strong> {contrat.dureeMois}</p>
                    {contrat.taciteReconduction != null && (
                        <p>
                            <strong>Tacite reconduction :</strong>{" "}
                            {contrat.taciteReconduction ? "Oui" : "Non"}
                        </p>
                    )}
                    <p><strong>Préavis (mois) :</strong> {contrat.preavisMois}</p>
                </div>
            ) : (
                <p style={{ marginTop: 16, fontStyle: "italic" }}>
                    Aucun contrat associé.
                </p>
            )}

            <div style={{ marginTop: 20 }}>
                <button onClick={() => navigate("/articles")}>
                    🔙 Retour à la liste
                </button>{" "}
                <button onClick={() => navigate(`/articles/edit/${id}`)}>
                    ✏ Modifier
                </button>
            </div>
        </div>
    );
}
