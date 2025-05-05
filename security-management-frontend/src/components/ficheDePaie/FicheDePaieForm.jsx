import React, { useEffect, useState } from "react";
import { useNavigate, useParams }     from "react-router-dom";
import FicheDePaieService             from "../../services/FicheDePaieService";
import "../../styles/FicheDePaieForm.css";

export default function FicheDePaieForm() {
    const { id }       = useParams();
    const isEdit       = Boolean(id);
    const navigate     = useNavigate();
    const [dto, setDto]= useState({
        reference: "",
        periodeDebut: "",
        periodeFin: "",
        salaireDeBase: "",
        heuresTravaillées: "",
        primeNuit: "",
        heuresSupplementaires: "",
        primeDiverses: "",
        totalCotisationsSalariales: "",
        totalCotisationsEmployeur: "",
        totalBrut: "",
        netImposable: "",
        netAPayer: "",
        agentDeSecuriteId: "",
        contratDeTravailId: ""
        // pour PDF et lignes, on pas géré ici
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            FicheDePaieService.getById(id)
                .then(({ data }) => setDto({
                    reference: data.reference,
                    periodeDebut: data.periodeDebut,
                    periodeFin: data.periodeFin,
                    salaireDeBase: data.salaireDeBase,
                    heuresTravaillées: data.heuresTravaillées,
                    primeNuit: data.primeNuit,
                    heuresSupplementaires: data.heuresSupplementaires,
                    primeDiverses: data.primeDiverses,
                    totalCotisationsSalariales: data.totalCotisationsSalariales,
                    totalCotisationsEmployeur: data.totalCotisationsEmployeur,
                    totalBrut: data.totalBrut,
                    netImposable: data.netImposable,
                    netAPayer: data.netAPayer,
                    agentDeSecuriteId: data.agentDeSecuriteId,
                    contratDeTravailId: data.contratDeTravailId ?? ""
                }))
                .catch(() => setError("Impossible de charger"));
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
            // caster les nombres
            salaireDeBase: Number(dto.salaireDeBase),
            heuresTravaillées: Number(dto.heuresTravaillées),
            primeNuit: Number(dto.primeNuit),
            heuresSupplementaires: Number(dto.heuresSupplementaires),
            primeDiverses: Number(dto.primeDiverses),
            totalCotisationsSalariales: Number(dto.totalCotisationsSalariales),
            totalCotisationsEmployeur: Number(dto.totalCotisationsEmployeur),
            totalBrut: Number(dto.totalBrut),
            netImposable: Number(dto.netImposable),
            netAPayer: Number(dto.netAPayer),
            agentDeSecuriteId: Number(dto.agentDeSecuriteId),
            contratDeTravailId: dto.contratDeTravailId ? Number(dto.contratDeTravailId) : undefined
        };
        const call = isEdit
            ? FicheDePaieService.update(id, payload)
            : FicheDePaieService.create(payload);

        call
            .then(() => navigate("/fiches"))
            .catch(err => setError(err.response?.data?.message || "Erreur serveur"));
    };

    return (
        <div className="fp-form">
            <h2>{isEdit ? "Modifier" : "Créer"} une fiche de paie</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Référence *
                    <input name="reference" value={dto.reference} onChange={handleChange} required />
                </label>
                <label>
                    Période début *
                    <input type="date" name="periodeDebut" value={dto.periodeDebut} onChange={handleChange} required />
                </label>
                <label>
                    Période fin *
                    <input type="date" name="periodeFin" value={dto.periodeFin} onChange={handleChange} required />
                </label>
                <label>
                    Salaire de base *
                    <input type="number" name="salaireDeBase" value={dto.salaireDeBase} onChange={handleChange} required />
                </label>
                <label>
                    Heures travaillées *
                    <input type="number" name="heuresTravaillées" value={dto.heuresTravaillées} onChange={handleChange} required />
                </label>
                {/* … ajoutez les autres champs de façon similaire … */}
                <label>
                    Agent ID *
                    <input type="number" name="agentDeSecuriteId" value={dto.agentDeSecuriteId} onChange={handleChange} required />
                </label>
                <label>
                    Contrat ID
                    <input type="number" name="contratDeTravailId" value={dto.contratDeTravailId} onChange={handleChange}/>
                </label>
                <button type="submit" className="btn-submit">
                    {isEdit ? "Mettre à jour" : "Créer"}
                </button>
            </form>
        </div>
    );
}
