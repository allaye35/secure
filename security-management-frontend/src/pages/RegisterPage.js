import AuthService from "../services/auth/AuthService";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Auth.css";

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail]       = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [erreur, setErreur]     = useState("");
    const navigate = useNavigate();

    const handleRegister = async e => {
        e.preventDefault();
        setErreur("");

        if (motDePasse !== confirmation) {
            setErreur("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            await AuthService.register({ username, email, password: motDePasse });
            navigate("/login");
        } catch (err) {
            setErreur("Erreur lors de l’inscription.");
        }
    };

    return (
        <div className="auth-container">
            <h2>Inscription</h2>
            <form onSubmit={handleRegister} className="auth-form">
                <input
                    type="text"
                    placeholder="Nom d’utilisateur"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Adresse email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={motDePasse}
                    onChange={e => setMotDePasse(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmation}
                    onChange={e => setConfirmation(e.target.value)}
                    required
                />
                {erreur && <p className="auth-error">{erreur}</p>}
                <button type="submit">S'inscrire</button>
            </form>
            <p className="auth-link">
                Déjà un compte ? <a href="/login">Connectez-vous</a>
            </p>
        </div>
    );
};

export default RegisterPage;
