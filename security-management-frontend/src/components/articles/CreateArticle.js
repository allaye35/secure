import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticleService  from "../../services/ArticleService";
import ArticleForm     from "./ArticleForm";

export default function ArticleCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const handleSubmit = async data => {
        try {
            setLoading(true);
            await ArticleService.create(data);
            navigate("/articles");
        } catch (e) {
            console.error(e);
            setError("Échec de la création.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>➕ Créer un Article</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ArticleForm onSubmit={handleSubmit} loading={loading} />
        </div>
    );
}
