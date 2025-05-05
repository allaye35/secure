import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import "../../styles/TarifMissionForm.css";

// ⚠️ Ajustez cette liste selon votre enum TypeMission en back :
const TYPE_MISSIONS = [
    "INTERVENTION",
    "PATROULLE",
    "SECURITE",
    "AUTRE"
];

export default function TarifMissionForm() {
    const { id }   = useParams();
    const isEdit   = Boolean(id);
    const navigate = useNavigate();

    const [dto, setDto] = useState({
        typeMission:     TYPE_MISSIONS[0],
        prixUnitaireHT:  "",
        majorationNuit:  "",
        majorationWeekend:"",
        majorationDimanche:"",
        majorationFerie: "",
        tauxTVA:         ""
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            TarifMissionService.getById(id)
                .then(({ data }) => setDto({
                    typeMission:     data.typeMission,
                    prixUnitaireHT:  data.prixUnitaireHT,
                    majorationNuit:  data.majorationNuit,
                    majorationWeekend:data.majorationWeekend,
                    majorationDimanche:data.majorationDimanche,
                    majorationFerie: data.majorationFerie,
                    tauxTVA:         data.tauxTVA
                }))
                .catch(() => setError("Impossible de charger le tarif."));
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
            typeMission:     dto.typeMission,
            prixUnitaireHT:  Number(dto.prixUnitaireHT),
            majorationNuit:  Number(dto.majorationNuit),
            majorationWeekend:Number(dto.majorationWeekend),
            majorationDimanche:Number(dto.majorationDimanche),
            majorationFerie: Number(dto.majorationFerie),
            tauxTVA:         Number(dto.tauxTVA)
        };
        const call = isEdit
            ? TarifMissionService.update(id, payload)
            : TarifMissionService.create(payload);

        call
            .then(() => navigate("/tarifs"))
            .catch(err => setError(err.response?.data || "Erreur serveur"));
    };

    return (
        <div className="tarif-form">
            <h2>{isEdit ? "Modifier" : "Créer"} un tarif</h2>
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <label>
                    Type de mission *
                    <select name="typeMission" value={dto.typeMission} onChange={handleChange} required>
                        {TYPE_MISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </label>

                <label>
                    Prix unitaire HT *
                    <input
                        name="prixUnitaireHT"
                        type="number" step="0.01"
                        value={dto.prixUnitaireHT}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Majoration nuit *
                    <input
                        name="majorationNuit"
                        type="number" step="0.01"
                        value={dto.majorationNuit}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Majoration weekend *
                    <input
                        name="majorationWeekend"
                        type="number" step="0.01"
                        value={dto.majorationWeekend}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Majoration dimanche *
                    <input
                        name="majorationDimanche"
                        type="number" step="0.01"
                        value={dto.majorationDimanche}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Majoration férié *
                    <input
                        name="majorationFerie"
                        type="number" step="0.01"
                        value={dto.majorationFerie}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Taux TVA *
                    <input
                        name="tauxTVA"
                        type="number" step="0.01"
                        value={dto.tauxTVA}
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
