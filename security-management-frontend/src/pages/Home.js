import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { 
  FaUserShield, 
  FaTasks, 
  FaCalendarAlt, 
  FaBuilding, 
  FaIndustry, 
  FaRegFileAlt, 
  FaMapMarkerAlt, 
  FaMapMarkedAlt 
} from "react-icons/fa";
import "../styles/Home.css"; 

const Home = () => {
  return (
    <div className="home-container">


      <header className="home-header">
        <img src={logo} alt="Boulevard Sécurité Logo" className="logo" />
        <h1>Bienvenue sur Boulevard Sécurité</h1>
        <p>
          Votre solution pour la gestion des agents de sécurité, missions, plannings,
          clients, entreprises, rapports, sites et géolocalisations.
        </p>
      </header>


      <div className="home-buttons">
        <Link to="/agents" className="home-button">
          <FaUserShield className="icon" /> Gestion des Agents
        </Link>
        <Link to="/missions" className="home-button">
          <FaTasks className="icon" /> Gestion des Missions
        </Link>
        <Link to="/plannings" className="home-button">
          <FaCalendarAlt className="icon" /> Gestion du Planning
        </Link>
        <Link to="/clients" className="home-button">
          <FaBuilding className="icon" /> Gestion des Clients
        </Link>
        <Link to="/entreprises" className="home-button">
          <FaIndustry className="icon" /> Gestion des Entreprises
        </Link>
        <Link to="/rapports" className="home-button">
          <FaRegFileAlt className="icon" /> Gestion des Rapports
        </Link>
        <Link to="/sites" className="home-button">
          <FaMapMarkerAlt className="icon" /> Gestion des Sites
        </Link>
        <Link to="/geolocalisations" className="home-button">
          <FaMapMarkedAlt className="icon" /> Gestion des Géolocalisations
        </Link>
      </div>
    </div>
  );
};

export default Home;
