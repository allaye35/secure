// src/components/articleContratTravails/ArticleContratTravailForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams }     from "react-router-dom";
import ArticleContratTravailService   from "../../services/ArticleContratTravailService";

export default function ArticleContratTravailForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm]   = useState({ libelle: "", contenu: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            ArticleContratTravailService.getById(id)
                .then(res => {
                    console.log("Article récupéré:", res.data);
                    setForm({
                        libelle: res.data.libelle,
                        contenu: res.data.contenu,
                        contratDeTravailId: res.data.contratDeTravailId
                    });
                })
                .catch(err => {
                    console.error("Erreur lors de la récupération:", err);
                    setError("Impossible de charger l'article");
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            // Création d'une copie du formulaire pour éviter des modifications indésirables
            const articleData = { ...form };
            
            console.log("Données à envoyer:", articleData);
            
            if (isEdit) {
                // Force la recréation de l'objet pour s'assurer que toutes les propriétés sont envoyées
                const updateData = {
                    libelle: articleData.libelle,
                    contenu: articleData.contenu,
                    contratDeTravailId: articleData.contratDeTravailId
                };
                
                console.log("Mise à jour de l'article:", id, updateData);
                const response = await ArticleContratTravailService.update(id, updateData);
                console.log("Réponse du serveur:", response.data);
                alert("Article modifié avec succès!");
            } else {
                await ArticleContratTravailService.create(articleData);
                alert("Article créé avec succès!");
            }
            navigate("/article-contrat-travail");
        } catch (err) {
            console.error("Erreur lors de l'enregistrement:", err);
            setError("Erreur lors de l'enregistrement de l'article");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <div>
            <h2>{isEdit ? "✏️ Modifier" : "➕ Créer"} un Article Contrat de Travail</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "block", marginBottom: 5 }}>
                        Libellé:
                        <input
                            type="text"
                            name="libelle"
                            value={form.libelle}
                            onChange={handleChange}
                            style={{ width: "100%", padding: 8 }}
                            required
                        />
                    </label>
                </div>
                
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "block", marginBottom: 5 }}>
                        Contenu:
                        <textarea
                            name="contenu"
                            value={form.contenu}
                            onChange={handleChange}
                            style={{ width: "100%", height: 200, padding: 8 }}
                        />
                    </label>
                </div>
                
                <div style={{ marginTop: 20 }}>
                    <button type="submit" disabled={loading} style={{ marginRight: 10 }}>
                        {isEdit ? "Modifier" : "Créer"}
                    </button>
                    <button type="button" onClick={() => navigate("/article-contrat-travail")}>
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
