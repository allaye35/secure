// src/components/sites/CreateSite.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SiteService from "../../services/SiteService";
import MissionService from "../../services/MissionService";

export default function CreateSite() {
    const navigate = useNavigate();

    // État pour stocker les données du formulaire et des missions
    const [data, setData] = useState({
        nom: "",
        numero: "",
        rue: "",
        codePostal: "",
        ville: "",
        departement: "",
        region: "",
        pays: "France",
        missionsIds: []
    });
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Chargement des missions disponibles lors du montage du composant
    useEffect(() => {
        MissionService.getAllMissions()
            .then(response => {
                console.log("Missions chargées:", response.data);
                setMissions(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des missions:", err);
                setLoading(false);
            });
    }, []);

    // Gestion des modifications dans les champs du formulaire
    const handleChange = (e) => {
        const { name, value, type, checked, multiple, options } = e.target;
        
        if (type === "checkbox") {
            setData({ ...data, [name]: checked });
        } else if (multiple) { // Pour les sélections multiples (comme les missions)
            const selectedValues = Array.from(options)
                .filter(option => option.selected)
                .map(option => Number(option.value)); // Convertir en nombres
            setData({ ...data, [name]: selectedValues });
        } else {
            setData({ ...data, [name]: value });
        }
    };

    // Soumission du formulaire de création
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        
        console.log("Données à envoyer:", data);
        
        SiteService.createSite(data)
            .then((response) => {
                console.log("Site créé avec succès:", response.data);
                navigate("/sites"); // Redirection vers la liste des sites
            })
            .catch(err => {
                console.error("Erreur lors de la création du site:", err);
                setError("Erreur lors de la création du site. Veuillez réessayer.");
            });
    };

    return (
        <div className="container mt-3">
            <h2>Créer un nouveau site</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nom" className="form-label">Nom du site*</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nom"
                        name="nom"
                        value={data.nom}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="row">
                    <div className="col-md-2 mb-3">
                        <label htmlFor="numero" className="form-label">Numéro</label>
                        <input
                            type="text"
                            className="form-control"
                            id="numero"
                            name="numero"
                            value={data.numero}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-10 mb-3">
                        <label htmlFor="rue" className="form-label">Rue*</label>
                        <input
                            type="text"
                            className="form-control"
                            id="rue"
                            name="rue"
                            value={data.rue}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label htmlFor="codePostal" className="form-label">Code postal*</label>
                        <input
                            type="text"
                            className="form-control"
                            id="codePostal"
                            name="codePostal"
                            value={data.codePostal}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-8 mb-3">
                        <label htmlFor="ville" className="form-label">Ville*</label>
                        <input
                            type="text"
                            className="form-control"
                            id="ville"
                            name="ville"
                            value={data.ville}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="departement" className="form-label">Département</label>
                        <input
                            type="text"
                            className="form-control"
                            id="departement"
                            name="departement"
                            value={data.departement}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="region" className="form-label">Région</label>
                        <input
                            type="text"
                            className="form-control"
                            id="region"
                            name="region"
                            value={data.region}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="pays" className="form-label">Pays</label>
                    <input
                        type="text"
                        className="form-control"
                        id="pays"
                        name="pays"
                        value={data.pays}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="missionsIds" className="form-label">Missions associées</label>
                    <select
                        className="form-select"
                        id="missionsIds"
                        name="missionsIds"
                        multiple
                        size={5}
                        value={data.missionsIds}
                        onChange={handleChange}
                    >
                        {loading ? (
                            <option disabled>Chargement des missions...</option>
                        ) : missions.length > 0 ? (
                            missions.map(mission => (
                                <option key={mission.id} value={mission.id}>
                                    {mission.titreMission || mission.titre || `Mission #${mission.id}`}
                                    {mission.dateDebutMission && ` - ${new Date(mission.dateDebutMission).toLocaleDateString()}`}
                                </option>
                            ))
                        ) : (
                            <option disabled>Aucune mission disponible</option>
                        )}
                    </select>
                    <small className="form-text text-muted">
                        Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs missions.
                    </small>
                </div>

                <div className="mt-4">
                    <button type="submit" className="btn btn-success">Créer le site</button>
                    <button 
                        type="button" 
                        className="btn btn-secondary ms-2"
                        onClick={() => navigate("/sites")}
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}