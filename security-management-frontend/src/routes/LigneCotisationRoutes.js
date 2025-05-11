import React from "react";
import { Route } from "react-router-dom";
import LigneCotisationList from "../components/lignesCotisation/LigneCotisationList";
import LigneCotisationForm from "../components/lignesCotisation/LigneCotisationForm";
import LigneCotisationDetail from "../components/lignesCotisation/LigneCotisationDetail";

const LigneCotisationRoutes = () => {
  return (
    <>
      <Route path="/lignes-cotisation" element={<LigneCotisationList />} />
      <Route path="/lignes-cotisation/create" element={<LigneCotisationForm />} />
      <Route path="/lignes-cotisation/:id" element={<LigneCotisationDetail />} />
      <Route path="/lignes-cotisation/edit/:id" element={<LigneCotisationForm />} />
    </>
  );
};

export default LigneCotisationRoutes;
