import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   // ⬅️ on utilise le contexte
import "../styles/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);

  const refs = {
    rh: useRef(null),
    operations: useRef(null),
    commercial: useRef(null),
  };

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handleOutside = (e) => {
      const clickedInside = Object.values(refs).some(
        (r) => r.current && r.current.contains(e.target)
      );
      if (!clickedInside) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const onLogout = async () => {
    await logout();               // efface tokens + user
    navigate("/login", { replace: true });
  };

  const MenuBtn = ({ id, label }) => (
    <button
      className="dropdown-btn"
      onClick={() => setOpenMenu(openMenu === id ? null : id)}
    >
      {label} ▾
    </button>
  );

  return (
    <nav className="navbar">
      {/* Accueil */}
      <div className="navbar-left">
        <Link to="/">Accueil</Link>
      </div>

      {/* RH : ADMIN uniquement */}
      {isAuthenticated && hasRole("ADMIN") && (
        <div className="navbar-left" ref={refs.rh}>
          <MenuBtn id="rh" label="Ressources Humaines" />
          {openMenu === "rh" && (
            <ul className="dropdown-menu">
              <li><Link to="/agents">Agents</Link></li>
              <li><Link to="/agents/create">Créer Agent</Link></li>
              <li><Link to="/disponibilites">Disponibilités</Link></li>
              <li><Link to="/disponibilites/create">Créer Disponibilité</Link></li>
              <li><Link to="/pointages">Pointages</Link></li>
              <li><Link to="/cartes-professionnelles">Cartes Pro</Link></li>
              <li><Link to="/diplomes-ssiap">Diplômes SSIAP</Link></li>
              <li><Link to="/contrats-de-travail">Contrats de Travail</Link></li>
              <li><Link to="/fiches">Fiches de Paie</Link></li>
              <li><Link to="/article-contrat-travail">Articles C. Travail</Link></li>
              <li><Link to="/lignes-cotisation">Lignes Cotisations</Link></li>
            </ul>
          )}
        </div>
      )}

      {/* Opérations : ADMIN ou AGENT_SECURITE (créations réservées à ADMIN) */}
      {isAuthenticated && (hasRole("ADMIN") || hasRole("AGENT_SECURITE")) && (
        <div className="navbar-left" ref={refs.operations}>
          <MenuBtn id="operations" label="Opérations" />
          {openMenu === "operations" && (
            <ul className="dropdown-menu">
              <li><Link to="/missions">Missions</Link></li>
              {hasRole("ADMIN") && <li><Link to="/missions/create">Créer Mission</Link></li>}
              <li><Link to="/plannings">Plannings</Link></li>
              {hasRole("ADMIN") && <li><Link to="/plannings/create">Créer Planning</Link></li>}
              <li><Link to="/rapports">Rapports</Link></li>
              <li><Link to="/sites">Sites</Link></li>
              <li><Link to="/geolocalisations">Géolocalisations</Link></li>
              <li><Link to="/zones">Zones de travail</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
            </ul>
          )}
        </div>
      )}

      {/* Commercial : ADMIN ou CLIENT (client voit “Mes …”) */}
      {isAuthenticated && (hasRole("ADMIN") || hasRole("CLIENT")) && (
        <div className="navbar-left" ref={refs.commercial}>
          <MenuBtn id="commercial" label="Commercial" />
          {openMenu === "commercial" && (
            <ul className="dropdown-menu">
              {hasRole("ADMIN") && (
                <>
                  <li><Link to="/clients">Clients</Link></li>
                  <li><Link to="/entreprises">Entreprises</Link></li>
                  <li><Link to="/contrats">Contrats</Link></li>
                  <li><Link to="/devis">Devis</Link></li>
                  <li><Link to="/factures">Factures</Link></li>
                  <li><Link to="/tarifs">Tarifs</Link></li>
                  <li><Link to="/articles">Articles</Link></li>
                </>
              )}
              {hasRole("CLIENT") && (
                <>
                  <li><Link to="/contrats">Mes Contrats</Link></li>
                  <li><Link to="/devis">Mes Devis</Link></li>
                  <li><Link to="/factures">Mes Factures</Link></li>
                </>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Connexion / Déconnexion */}
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <span className="navbar-user">
              Bonjour, {user?.prenom ?? user?.email} — {user?.role}
            </span>
            <button className="navbar-logout-btn" onClick={onLogout}>
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
