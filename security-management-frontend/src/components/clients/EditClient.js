// src/components/clients/EditClient.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate }      from "react-router-dom";
import ClientService                   from "../../services/ClientService";

// on définit nos valeurs par défaut
const defaultClient = {
    username: "",
    password: "",
    role: "CLIENT",
    typeClient: "PARTICULIER",
    nom: "",
    prenom: "",
    siege: "",
    representant: "",
    numeroSiret: "",
    email: "",
    telephone: "",
    adresse: "",
    numeroRue: "",
    codePostal: "",
    ville: "",
    pays: "",
    modeContactPrefere: "EMAIL",
    devisIds: [],
    notificationIds: []
};

export default function EditClient() {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const navigate = useNavigate();

    // 1) Chargement + merge avec defaultClient
    useEffect(() => {
        ClientService.getById(id)
            .then(apiClient => {
                setClient({
                    ...defaultClient,
                    ...apiClient,
                    // forcer un tableau même si null
                    devisIds: apiClient.devisIds || [],
                    notificationIds: apiClient.notificationIds || []
                });
            })
            .catch(console.error);
    }, [id]);

    if (!client) return <p>Chargement…</p>;

    // 2) Mise à jour locale du state
    const handleChange = e => {
        const { name, value } = e.target;
        setClient(prev => ({ ...prev, [name]: value }));
    };

    // 3) Submit : on supprime le mot de passe s’il est vide
    const handleSubmit = e => {
        e.preventDefault();
        const payload = { ...client };
        if (payload.password === "") delete payload.password;
        ClientService.update(id, payload)
            .then(() => navigate("/clients"))
            .catch(console.error);
    };

    return (
        <div>
            <h2>Modifier le client #{id}</h2>
            <form onSubmit={handleSubmit}>

                {/* Username */}
                <label>
                    Username :
                    <input
                        type="text"
                        name="username"
                        value={client.username}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>

                {/* Mot de passe */}
                <label>
                    Nouveau mot de passe (laisser vide pour ne pas changer) :
                    <input
                        type="password"
                        name="password"
                        value={client.password}
                        onChange={handleChange}
                    />
                </label>
                <br/>

                {/* Rôle */}
                <label>
                    Rôle :
                    <select
                        name="role"
                        value={client.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="CLIENT">CLIENT</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </label>
                <br/>

                {/* TypeClient */}
                <label>
                    Type :
                    <select
                        name="typeClient"
                        value={client.typeClient}
                        onChange={handleChange}
                        required
                    >
                        <option value="PARTICULIER">Particulier</option>
                        <option value="ENTREPRISE">Entreprise</option>
                    </select>
                </label>
                <br/>

                {/* Nom / Prénom */}
                <label>
                    Nom :
                    <input
                        type="text"
                        name="nom"
                        value={client.nom}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Prénom :
                    <input
                        type="text"
                        name="prenom"
                        value={client.prenom}
                        onChange={handleChange}
                    />
                </label>
                <br/>

                {/* Entreprise */}
                <label>
                    Siège :
                    <input
                        type="text"
                        name="siege"
                        value={client.siege}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Représentant :
                    <input
                        type="text"
                        name="representant"
                        value={client.representant}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Numéro SIRET :
                    <input
                        type="text"
                        name="numeroSiret"
                        value={client.numeroSiret}
                        onChange={handleChange}
                    />
                </label>
                <br/>

                {/* Coordonnées */}
                <label>
                    Email :
                    <input
                        type="email"
                        name="email"
                        value={client.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Téléphone :
                    <input
                        type="text"
                        name="telephone"
                        value={client.telephone}
                        onChange={handleChange}
                    />
                </label>
                <br/>

                {/* Adresse */}
                <label>
                    Adresse :
                    <input
                        type="text"
                        name="adresse"
                        value={client.adresse}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Numéro Rue :
                    <input
                        type="text"
                        name="numeroRue"
                        value={client.numeroRue}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Code Postal :
                    <input
                        type="text"
                        name="codePostal"
                        value={client.codePostal}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Ville :
                    <input
                        type="text"
                        name="ville"
                        value={client.ville}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Pays :
                    <input
                        type="text"
                        name="pays"
                        value={client.pays}
                        onChange={handleChange}
                    />
                </label>
                <br/>

                {/* ModeContactPrefere */}
                <label>
                    Mode de contact préféré :
                    <select
                        name="modeContactPrefere"
                        value={client.modeContactPrefere}
                        onChange={handleChange}
                        required
                    >
                        <option value="EMAIL">Email</option>
                        <option value="TELEPHONE">Téléphone</option>
                    </select>
                </label>
                <br/>

                <button type="submit">Mettre à jour</button>
            </form>
        </div>
    );
}
