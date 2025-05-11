// src/components/NavBar.js
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";
import "../styles/NavBar.css";

export default function NavBar() {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const rhMenuRef = useRef(null);
    const operationsMenuRef = useRef(null);
    const commercialMenuRef = useRef(null);
    const user = localStorage.getItem("user");
    
    // Function to handle clicks outside of dropdown menus
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                (rhMenuRef.current && !rhMenuRef.current.contains(event.target)) &&
                (operationsMenuRef.current && !operationsMenuRef.current.contains(event.target)) &&
                (commercialMenuRef.current && !commercialMenuRef.current.contains(event.target))
            ) {
                setOpenMenu(null);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    // Handle logout functionality
    const handleLogout = () => {
        AuthService.logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            {/* Accueil */}
            <div className="navbar-left">
                <Link to="/">Accueil</Link>
            </div>
            
            {/* Menu Ressources Humaines ▾ */}
            <div className="navbar-left" ref={rhMenuRef}>
                <button
                    className="dropdown-btn"
                    onClick={() => setOpenMenu(openMenu === "rh" ? null : "rh")}
                >
                    Ressources Humaines ▾
                </button>
                {openMenu === "rh" && (
                    <ul className="dropdown-menu">
                        <li><Link to="/agents">Agents</Link></li>
                        <li><Link to="/agents/create">Créer Agent</Link></li>
                        <li><Link to="/disponibilites">Disponibilités</Link></li>
                        <li><Link to="/disponibilites/create">Créer Disponibilité</Link></li>
                        <li><Link to="/pointages">Pointages</Link></li>
                        <li><Link to="/pointages/create">Créer Pointage</Link></li>
                        <li><Link to="/cartes-professionnelles">Cartes Pro</Link></li>
                        <li><Link to="/cartes-professionnelles/create">Créer Carte Pro</Link></li>
                        <li><Link to="/diplomes-ssiap">Diplômes SSIAP</Link></li>
                        <li><Link to="/diplomes-ssiap/create">Créer Diplôme</Link></li>
                        <li><Link to="/contrats-de-travail">Contrats de Travail</Link></li>
                        <li><Link to="/contrats-de-travail/create">Créer Contrat</Link></li>
                        <li><Link to="/fiches">Fiches de Paie</Link></li>
                        <li><Link to="/fiches/create">Créer Fiche de Paie</Link></li>
                        <li><Link to="/article-contrat-travail">Articles C. Travail</Link></li>
                        <li><Link to="/article-contrat-travail/create">Créer Article C. Travail</Link></li>
                        <li><Link to="/lignes-cotisation">Lignes Cotisations</Link></li>
                        <li><Link to="/lignes-cotisation/create">Créer Ligne Cotisation</Link></li>
                    </ul>
                )}
            </div>
            
            {/* Menu Opérations ▾ */}
            <div className="navbar-left" ref={operationsMenuRef}>
                <button
                    className="dropdown-btn"
                    onClick={() => setOpenMenu(openMenu === "operations" ? null : "operations")}
                >
                    Opérations ▾
                </button>
                {openMenu === "operations" && (
                    <ul className="dropdown-menu">
                        <li><Link to="/missions">Missions</Link></li>
                        <li><Link to="/missions/create">Créer Mission</Link></li>
                        <li><Link to="/plannings">Plannings</Link></li>
                        <li><Link to="/plannings/create">Créer Planning</Link></li>
                        <li><Link to="/rapports">Rapports</Link></li>
                        <li><Link to="/rapports/create">Créer Rapport</Link></li>
                        <li><Link to="/sites">Sites</Link></li>
                        <li><Link to="/sites/create">Créer Site</Link></li>
                        <li><Link to="/geolocalisations">Géolocalisations</Link></li>
                        <li><Link to="/geolocalisations/create">Créer Géolocalisation</Link></li>
                        <li><Link to="/zones">Zones de travail</Link></li>
                        <li><Link to="/zones/create">Créer Zone</Link></li>
                        <li><Link to="/notifications">Notifications</Link></li>
                        <li><Link to="/notifications/create">Créer Notification</Link></li>
                    </ul>
                )}
            </div>
            
            {/* Menu Commercial ▾ */}
            <div className="navbar-left" ref={commercialMenuRef}>
                <button
                    className="dropdown-btn"
                    onClick={() => setOpenMenu(openMenu === "commercial" ? null : "commercial")}
                >
                    Commercial ▾
                </button>
                {openMenu === "commercial" && (
                    <ul className="dropdown-menu">
                        <li><Link to="/clients">Clients</Link></li>
                        <li><Link to="/clients/create">Créer Client</Link></li>
                        <li><Link to="/entreprises">Entreprises</Link></li>
                        <li><Link to="/entreprises/create">Créer Entreprise</Link></li>
                        <li><Link to="/contrats">Contrats</Link></li>
                        <li><Link to="/contrats/create">Créer Contrat</Link></li>
                        <li><Link to="/devis">Devis</Link></li>
                        <li><Link to="/devis/create">Créer Devis</Link></li>
                        <li><Link to="/factures">Factures</Link></li>
                        <li><Link to="/factures/create">Créer Facture</Link></li>
                        <li><Link to="/tarifs">Tarifs</Link></li>
                        <li><Link to="/tarifs/create">Créer Tarif</Link></li>
                        <li><Link to="/articles">Articles</Link></li>
                        <li><Link to="/articles/create">Créer Article</Link></li>
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
