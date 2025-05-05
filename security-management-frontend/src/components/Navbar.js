// src/components/NavBar.js
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate }                  from "react-router-dom";
import AuthService                            from "../services/AuthService";
import "../styles/NavBar.css";

export default function NavBar() {
    const navigate      = useNavigate();
    const user          = localStorage.getItem("user");
    const [openMenu, setOpenMenu] = useState(null);
    const wrapperRef    = useRef();

    const handleLogout = () => {
        AuthService.logout();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const onClickOutside = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    return (
        <nav className="navbar">
            {/* Accueil */}
            <div className="navbar-left">
                <Link to="/">Accueil</Link>
            </div>

            {/* Menu Gestion ▾ */}
            <div className="navbar-left" ref={wrapperRef}>
                <button
                    className="dropdown-btn"
                    onClick={() => setOpenMenu(openMenu === "gestion" ? null : "gestion")}
                >
                    Gestion ▾
                </button>
                {openMenu === "gestion" && (
                    <ul className="dropdown-menu">
                        <li><Link to="/agents">Agents</Link></li>
                        <li><Link to="/missions">Missions</Link></li>
                        <li><Link to="/missions/create">Créer Mission</Link></li>
                        <li><Link to="/plannings">Plannings</Link></li>
                        <li><Link to="/plannings/create">Créer Planning</Link></li>
                        <li><Link to="/clients">Clients</Link></li>
                        <li><Link to="/clients/create">Créer Client</Link></li>
                        <li><Link to="/entreprises">Entreprises</Link></li>
                        <li><Link to="/entreprises/create">Créer Entreprise</Link></li>
                        <li><Link to="/rapports">Rapports</Link></li>
                        <li><Link to="/rapports/create">Créer Rapport</Link></li>
                        <li><Link to="/sites">Sites</Link></li>
                        <li><Link to="/sites/create">Créer Site</Link></li>
                        <li><Link to="/geolocalisations">Géolocalisations</Link></li>
                        <li><Link to="/geolocalisations/create">Créer Géolocalisation</Link></li>
                        <li><Link to="/contrats">Contrats</Link></li>
                        <li><Link to="/articles">Articles</Link></li>
                        <li><Link to="/articles/create">Créer Article</Link></li>
                        <li><Link to="/zones">Zones de travail</Link></li>
                        <li><Link to="/zones/create">Créer Zone</Link></li>
                        <li><Link to="/disponibilites">Disponibilités</Link></li>
                        <li><Link to="/disponibilites/create">Créer Disponibilité</Link></li>
                        <li><Link to="/cartes-professionnelles">Cartes Pro</Link></li>
                        <li><Link to="/cartes-professionnelles/create">Créer Carte Pro</Link></li>
                        <li><Link to="/diplomes-ssiap">Diplômes SSIAP</Link></li>
                        <li><Link to="/diplomes-ssiap/create">Créer Diplôme</Link></li>
                        <li><Link to="/notifications">Notifications</Link></li>
                        <li><Link to="/notifications/create">Créer Notification</Link></li>
                        <li><Link to="/contrats-de-travail">Contrats de Travail</Link></li>
                        <li><Link to="/contrats-de-travail/create">Créer Contrat</Link></li>
                        <li><Link to="/devis">Devis</Link></li>
                        <li><Link to="/devis/create">Créer Devis</Link></li>
                        <li><Link to="/factures">Factures</Link></li>
                        <li><Link to="/factures/create">Créer Facture</Link></li>
                        <li><Link to="/fiches">Fiches de Paie</Link></li>
                        <li><Link to="/fiches/create">Créer Fiche de Paie</Link></li>
                        <li><Link to="/article-contrat-travail">Articles C. Travail</Link></li>
                        <li>
                            <Link to="/article-contrat-travail/create">
                                Créer Article C. Travail
                            </Link>
                        </li>
                    </ul>
                )}
            </div>

            {/* Connexion / Déconnexion */}
            <div className="navbar-right">
                {user ? (
                    <>
                        <span className="navbar-user">Bonjour, {user}</span>
                        <button
                            className="navbar-logout-btn"
                            onClick={handleLogout}
                        >
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Connexion</Link>
                        <Link to="/register">Inscription</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
