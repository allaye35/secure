import React, { useEffect, useState } from "react";
import { useParams, useNavigate }     from "react-router-dom";
import LigneCotisationService          from "../../services/LigneCotisationService";
import "../../styles/LigneCotisationForm.css";

export default function LigneCotisationForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [dto, setDto] = useState({
        libelle: "",
        tauxSalarial: "",
        montantSalarial: "",
        tauxEmployeur: "",
        montantEmployeur: "",
        ficheDePaieId: ""
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            LigneCotisationService.getById(id)
                .then(({ data }) => setDto({
                    libelle: data.libelle,
                    tauxSalarial: data.tauxSalarial,
                    montantSalarial: data.montantSalarial,
                    tauxEmployeur: data.tauxEmployeur,
                    montantEmployeur: data.montantEmployeur,
                    ficheDePaieId: data.ficheDePaieId
                }))
                .catch(() => setError("Impossible de charger la ligne"));
        }
    }, [id, isEdit]);

    const handleChange = e => {
        const { name, value } = e.target;
        setDto(d => ({ ...d, [name]: value }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        setError("");
        const payload = {
            ...dto,
            tauxSalarial:   Number(dto.tauxSalarial),
            montantSalarial: Number(dto.montantSalarial),
            tauxEmployeur:  Number(dto.tauxEmployeur),
            montantEmployeur: Number(dto.montantEmployeur),
            ficheDePaieId:  Number(dto.ficheDePaieId)
        };
        const call = isEdit
            ? LigneCotisationService.update(id, payload)
            : LigneCotisationService.create(payload);        call
            .then(() => navigate("/lignes-cotisation"))
            .catch(err => setError(err.response?.data?.message || "Erreur serveur"));
    };

    return (
        <div className="ligne-form">
            <h2>{isEdit ? "Modifier" : "Créer"} ligne de cotisation</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Libellé *
                    <input
                        name="libelle"
                        value={dto.libelle}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Taux salarié (%) *
                    <input
                        name="tauxSalarial"
                        type="number"
                        step="0.01"
                        value={dto.tauxSalarial}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Montant salarié (€) *
                    <input
                        name="montantSalarial"
                        type="number"
                        step="0.01"
                        value={dto.montantSalarial}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Taux employeur (%) *
                    <input
                        name="tauxEmployeur"
                        type="number"
                        step="0.01"
                        value={dto.tauxEmployeur}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Montant employeur (€) *
                    <input
                        name="montantEmployeur"
                        type="number"
                        step="0.01"
                        value={dto.montantEmployeur}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Fiche de paie ID *
                    <input
                        name="ficheDePaieId"
                        type="number"
                        value={dto.ficheDePaieId}
                        onChange={handleChange}
                        required
                    />
                </label>

                <button type="submit" className="btn-submit">
                    {isEdit ? "Mettre à jour" : "Créer"}
                </button>
            </form>
        </div>
    );
}
