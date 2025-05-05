// src/components/sites/EditSite.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import SiteService from "../../services/SiteService";
import MissionService from "../../services/MissionService";

export default function EditSite() {
    const { id } = useParams();
    const navigate = useNavigate();

    // État pour stocker les données du site et des missions
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
    const [loading, setLoading] = useState({ site: true, missions: true });
    const [error, setError] = useState("");
    const [serverStatus, setServerStatus] = useState({ checking: true, online: false, message: "Vérification de la connexion au serveur..." });

    // Vérification de la connexion au serveur backend
    useEffect(() => {
        const checkServerConnection = async () => {
            try {
                // Essayer de récupérer la liste des sites pour vérifier la connexion
                await SiteService.getAllSites();
                setServerStatus({
                    checking: false,
                    online: true,
                    message: "Connecté au serveur backend"
                });
                return true;
            } catch (err) {
                console.error("Erreur lors de la vérification de la connexion au serveur", err);
                const errorMsg = err.message.includes("Network Error") 
                    ? "Impossible de se connecter au serveur backend. Veuillez vérifier que le serveur est démarré sur le port 8080."
                    : `Erreur de connexion: ${err.message}`;
                
                setServerStatus({
                    checking: false,
                    online: false,
                    message: errorMsg
                });
                return false;
            }
        };

        checkServerConnection();
    }, []);

    // Chargement des données du site et des missions
    useEffect(() => {
        if (serverStatus.checking || !serverStatus.online) {
            return; // Ne pas charger les données si le serveur n'est pas disponible
        }

        // Chargement du site à modifier
        SiteService.getSiteById(id)
            .then(response => {
                console.log("Site chargé:", response.data);
                setData(response.data);
                setLoading(prev => ({ ...prev, site: false }));
            })
            .catch(err => {
                console.error("Erreur lors du chargement du site:", err);
                let errorMessage = "Impossible de charger le site.";
                
                if (err.response) {
                    // Erreur avec une réponse du serveur
                    if (err.response.status === 404) {
                        errorMessage = `Le site avec l'ID ${id} n'existe pas. Vérifiez la base de données.`;
                    } else {
                        errorMessage = `Erreur serveur: ${err.response.status} ${err.response.statusText}`;
                    }
                } else if (err.message) {
                    // Erreur sans réponse (ex: problème de réseau)
                    errorMessage = `Erreur: ${err.message}`;
                }
                
                setError(errorMessage);
                setLoading(prev => ({ ...prev, site: false }));
            });

        // Chargement des missions disponibles
        MissionService.getAllMissions()
            .then(response => {
                console.log("Missions chargées:", response.data);
                setMissions(response.data);
                setLoading(prev => ({ ...prev, missions: false }));
            })
            .catch(err => {
                console.error("Erreur lors du chargement des missions:", err);
                setLoading(prev => ({ ...prev, missions: false }));
            });
    }, [id, serverStatus]);

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

    // Soumission du formulaire de modification
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        
        // Ne pas inclure l'ID dans les données envoyées
        // Le backend attend seulement les champs de SiteCreateDto, pas l'id
        const { id: siteId, ...siteToUpdate } = data;
        
        // S'assurer que missionsIds est un tableau, même s'il est vide
        if (!siteToUpdate.missionsIds) {
            siteToUpdate.missionsIds = [];
        }
        
        // S'assurer que tous les champs obligatoires ont des valeurs non-null
        const cleanedSiteData = {
            nom: siteToUpdate.nom || "",
            numero: siteToUpdate.numero || "",
            rue: siteToUpdate.rue || "",
            codePostal: siteToUpdate.codePostal || "",
            ville: siteToUpdate.ville || "",
            departement: siteToUpdate.departement || "",
            region: siteToUpdate.region || "",
            pays: siteToUpdate.pays || "France",
            missionsIds: siteToUpdate.missionsIds
        };
        
        console.log("Données à envoyer:", cleanedSiteData);
        
        SiteService.updateSite(id, cleanedSiteData)
            .then(() => {
                console.log("Site modifié avec succès");
                navigate("/sites"); // Redirection vers la liste des sites
            })
            .catch(err => {
                console.error("Erreur lors de la modification du site:", err);
                // Afficher les détails de l'erreur pour mieux diagnostiquer
                let errorMessage = "Erreur lors de la modification du site.";
                
                if (err.response) {
                    if (err.response.status === 404) {
                        errorMessage = `Le site avec l'ID ${id} n'existe pas dans la base de données. Impossible de le modifier.`;
                    } else {
                        errorMessage = `Erreur serveur ${err.response.status}: ${err.response.statusText}`;
                        if (err.response.data) {
                            errorMessage += ` - ${JSON.stringify(err.response.data)}`;
                        }
                    }
                } else if (err.message) {
                    errorMessage = `Erreur: ${err.message}`;
                }
                
                setError(errorMessage);
            });
    };

    // Si le serveur est en cours de vérification ou hors ligne
    if (serverStatus.checking) {
        return (
            <div className="container mt-3">
                <div className="alert alert-info">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Vérification de la connexion au serveur...
                </div>
            </div>
        );
    }

    if (!serverStatus.online) {
        return (
            <div className="container mt-3">
                <div className="alert alert-danger">
                    <h4>Problème de connexion au serveur</h4>
                    <p>{serverStatus.message}</p>
                    <p>Assurez-vous que:</p>
                    <ul>
                        <li>Le serveur backend est démarré</li>
                        <li>Le serveur backend est accessible sur http://localhost:8080</li>
                        <li>Le CORS est correctement configuré sur le backend</li>
                    </ul>
                    <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>
                        Réessayer
                    </button>
                    <Link to="/sites" className="btn btn-secondary mt-2 ms-2">
                        Retour à la liste des sites
                    </Link>
                </div>
            </div>
        );
    }

    // Affichage d'un message de chargement si les données ne sont pas encore disponibles
    if (loading.site) {
        return <div className="container mt-3"><p>Chargement des données du site...</p></div>;
    }

    return (
        <div className="container mt-3">
            <h2>Modifier le site #{id}</h2>
            {error && (
                <div className="alert alert-danger">
                    <h5>Erreur</h5>
                    <p>{error}</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nom" className="form-label">Nom du site*</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nom"
                        name="nom"
                        value={data.nom || ""}
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
                            value={data.numero || ""}
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
                            value={data.rue || ""}
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
                            value={data.codePostal || ""}
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
                            value={data.ville || ""}
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
                            value={data.departement || ""}
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
                            value={data.region || ""}
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
                        value={data.pays || "France"}
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
                        value={data.missionsIds || []}
                        onChange={handleChange}
                    >
                        {loading.missions ? (
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
                    <button type="submit" className="btn btn-primary">Enregistrer les modifications</button>
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