import React, { useEffect, useState } from "react";
import { useNavigate, useParams }     from "react-router-dom";
import FactureService                  from "../../services/FactureService";
import "../../styles/FactureForm.css";

import "../../styles/FactureForm.css";

const STATUTS = ["EN_ATTENTE","PAYEE","EN_RETARD"];

export default function FactureForm() {
    const { id }   = useParams();
    const isEdit   = Boolean(id);
    const navigate = useNavigate();

    const [dto, setDto] = useState({
        referenceFacture: "",
        dateEmission:     "",
        statut:           STATUTS[0],
        montantHT:        "",
        montantTVA:       "",
        montantTTC:       "",
        devisId:          "",
        entrepriseId:     "",
        clientId:         "",
        contratId:        "",
        missionIds:       []  // facultatif
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            FactureService.getById(id)
                .then(({ data }) => setDto({
                    referenceFacture: data.referenceFacture,
                    dateEmission:     data.dateEmission,
                    statut:           data.statut,
                    montantHT:        data.montantHT,
                    montantTVA:       data.montantTVA,
                    montantTTC:       data.montantTTC,
                    devisId:          data.devisId,
                    entrepriseId:     data.entrepriseId,
                    clientId:         data.clientId,
                    contratId:        data.contratId || "",
                    missionIds:       data.missionIds || []
                }))
                .catch(() => setError("Impossible de charger la facture."));
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
            referenceFacture: dto.referenceFacture,
            dateEmission:     dto.dateEmission,
            statut:           dto.statut,
            montantHT:        Number(dto.montantHT),
            montantTVA:       Number(dto.montantTVA),
            montantTTC:       Number(dto.montantTTC),
            devisId:          Number(dto.devisId),
            entrepriseId:     Number(dto.entrepriseId),
            clientId:         Number(dto.clientId),
            contratId:        dto.contratId ? Number(dto.contratId) : undefined,
            missionIds:       dto.missionIds.map(id=>Number(id))
        };
        const call = isEdit
            ? FactureService.update(id, payload)
            : FactureService.create(payload);

        call
            .then(() => navigate("/factures"))
            .catch(err => setError(err.response?.data?.message || "Erreur serveur"));
    };

    return (
        <div className="facture-form">
            <h2>{isEdit ? "Modifier" : "Créer"} une facture</h2>
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <label>
                    Réf. facture *
                    <input
                        name="referenceFacture"
                        value={dto.referenceFacture}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Date émission *
                    <input
                        type="date"
                        name="dateEmission"
                        value={dto.dateEmission}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Statut *
                    <select
                        name="statut"
                        value={dto.statut}
                        onChange={handleChange}
                        required
                    >
                        {STATUTS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </label>

                <label>
                    Montant HT *
                    <input
                        name="montantHT"
                        type="number"
                        step="0.01"
                        value={dto.montantHT}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Montant TVA *
                    <input
                        name="montantTVA"
                        type="number"
                        step="0.01"
                        value={dto.montantTVA}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Montant TTC *
                    <input
                        name="montantTTC"
                        type="number"
                        step="0.01"
                        value={dto.montantTTC}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Devis ID *
                    <input
                        name="devisId"
                        type="number"
                        value={dto.devisId}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Contrat ID
                    <input
                        name="contratId"
                        type="number"
                        value={dto.contratId}
                        onChange={handleChange}
                    />
                </label>

                <button type="submit" className="btn-submit">
                    {isEdit ? "Mettre à jour" : "Créer"}
                </button>
            </form>
        </div>
    );
}
