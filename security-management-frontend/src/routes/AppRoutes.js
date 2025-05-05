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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Page d'accueil */}
      <Route path="/" element={<Home />} />

      {/* On insère la liste de <Route> renvoyée par nos sous-routes */}
      <>
        {AgentRoutes()}
        {MissionRoutes()}
        {PlanningRoutes()}
        {SiteRoutes()}
        {EntrepriseRoutes()}
        {GeolocalisationRoutes()}
        {RapportRoutes && RapportRoutes()}
        {DevisRoutes()}
      </>
    </Routes>
  );
};

export default AppRoutes;
