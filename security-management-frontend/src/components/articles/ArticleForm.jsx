import React, { useState } from "react";

export default function ArticleForm({ initial, onSubmit, loading }) {
    const [form, setForm] = useState({
        numero: initial?.numero || "",
        titre:  initial?.titre  || "",
        contenu: initial?.contenu || ""
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const submit = e => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={submit}>
            <div>
                <label>Numéro</label><br/>
                <input
                    type="text"
                    name="numero"
                    value={form.numero}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Titre</label><br/>
                <input
                    type="text"
                    name="titre"
                    value={form.titre}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Contenu</label><br/>
                <textarea
                    name="contenu"
                    value={form.contenu}
                    onChange={handleChange}
                    rows="5"
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? "⏳ Patientez…" : "💾 Enregistrer"}
            </button>
        </form>
    );
}
