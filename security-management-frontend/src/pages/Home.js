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


     
    </div>
  );
};

export default Home;
