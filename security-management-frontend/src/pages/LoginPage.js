import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";
import "../styles/Auth.css";

const LoginPage = () => {
    const [email,       setEmail]       = useState("");
    const [motDePasse,  setMotDePasse]  = useState("");
    const [erreur,      setErreur]      = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErreur("");

        try {
            await AuthService.login({ email, password: motDePasse });
            navigate("/");                          // succès : retour à l’accueil
        } catch (err) {
            console.error(err);
            setErreur("Email ou mot de passe incorrect.");
        }
    };

    return (
        <div className="auth-container">
            <h2>Connexion</h2>

            <form onSubmit={handleLogin} className="auth-form">
                <input
                    type="email"
                    placeholder="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                />

                {erreur && <p className="auth-error">{erreur}</p>}
                <button type="submit">Se connecter</button>
            </form>

            <p className="auth-link">
                Pas encore inscrit ? <a href="/register">Créer un compte</a>
            </p>
        </div>
    );
};

export default LoginPage;
