import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArticleService  from "../../services/ArticleService";
import ArticleForm     from "./ArticleForm";

export default function ArticleEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initial, setInitial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [saving,  setSaving]  = useState(false);

    useEffect(() => {
        ArticleService.getById(id)
            .then(res => setInitial(res.data))
            .catch(err => {
                console.error(err);
                setError("Impossible de charger l’article.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async data => {
        try {
            setSaving(true);
            await ArticleService.update(id, data);
            navigate("/articles");
        } catch (e) {
            console.error(e);
            setError("Échec de la mise à jour.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Chargement…</p>;
    if (error)   return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h2>✏ Modifier l’Article #{id}</h2>
            <ArticleForm
                initial={initial}
                onSubmit={handleSubmit}
                loading={saving}
            />
        </div>
    );
}
