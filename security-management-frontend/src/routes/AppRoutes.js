import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import AgentRoutes from "./AgentRoutes";
import MissionRoutes from "./MissionRoutes";
import PlanningRoutes from "./PlanningRoutes";
import SiteRoutes from "./SiteRoutes";
import EntrepriseRoutes from "./EntrepriseRoutes";
import GeolocalisationRoutes from "./GeolocalisationRoutes";
import RapportRoutes from "./RapportRoutes";
import DevisRoutes from "./DevisRoutes";
import DisponibiliteRoutes from "./DisponibiliteRoutes";
import FactureRoutes from "./FactureRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Page d'accueil */}
      <Route path="/" element={<Home />} />

      {/* Inclusion directe de chaque route dans le composant Routes */}
      {AgentRoutes()}
      {MissionRoutes()}
      {PlanningRoutes()}
      {SiteRoutes()}
      {EntrepriseRoutes()}
      {GeolocalisationRoutes()}
      {RapportRoutes && RapportRoutes()}
      {DevisRoutes()}
      {DisponibiliteRoutes()}
      {FactureRoutes()}
    </Routes>
  );
};

export default AppRoutes;
