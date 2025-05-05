import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientService from "../../services/ClientService";

export default function CreateClient() {
    const [client, setClient] = useState({
        username: "",
        password: "",
        typeClient: "PARTICULIER",
        nom: "",
        prenom: "",
        siege: "",
        representant: "",
        numeroSiret: "",
        email: "",
        telephone: "",
        adresse: "",
        codePostal: "",
        ville: "",
        pays: "",
        numeroRue: "",
        modeContactPrefere: "EMAIL",
        // role reste default CLIENT
    });
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setClient({ ...client, [name]: value });
    };

    const handleSubmit = e => {
        e.preventDefault();
        ClientService.create(client)
            .then(() => navigate("/clients"))
            .catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Créer un nouveau client</h2>
            <form onSubmit={handleSubmit}>
                <input name="username"     placeholder="Username"            onChange={handleChange} value={client.username} required />
                <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} value={client.password} required />

                <select name="typeClient" onChange={handleChange} value={client.typeClient} required>
                    <option value="PARTICULIER">Particulier</option>
                    <option value="ENTREPRISE">Entreprise</option>
                </select>

                <input name="nom"        placeholder="Nom"         onChange={handleChange} value={client.nom} />
                <input name="prenom"     placeholder="Prénom"      onChange={handleChange} value={client.prenom} />

                <input name="siege"          placeholder="Siège"            onChange={handleChange} value={client.siege} />
                <input name="representant"   placeholder="Représentant"     onChange={handleChange} value={client.representant} />
                <input name="numeroSiret"    placeholder="Numéro SIRET"     onChange={handleChange} value={client.numeroSiret} />

                <input name="email"    type="email" placeholder="Email"    onChange={handleChange} value={client.email} required />
                <input name="telephone"        placeholder="Téléphone" onChange={handleChange} value={client.telephone} />
                <input name="adresse"          placeholder="Adresse"   onChange={handleChange} value={client.adresse} />
                <input name="codePostal"       placeholder="Code Postal" onChange={handleChange} value={client.codePostal} />
                <input name="ville"            placeholder="Ville"      onChange={handleChange} value={client.ville} />
                <input name="pays"             placeholder="Pays"       onChange={handleChange} value={client.pays} />
                <input name="numeroRue"        placeholder="Numéro Rue" onChange={handleChange} value={client.numeroRue} />

                <select name="modeContactPrefere" onChange={handleChange} value={client.modeContactPrefere}>
                    <option value="EMAIL">Email</option>
                    <option value="TELEPHONE">Téléphone</option>
                </select>

                <button type="submit">Créer</button>
            </form>
        </div>
    );
}
