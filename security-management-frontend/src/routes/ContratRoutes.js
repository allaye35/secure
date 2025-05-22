// src/routes/ContratRoutes.js
import React from "react";
import { Route } from "react-router-dom";
import ContratList from "../components/contrats/ContratList";
import EditContrat from "../components/contrats/EditContrat";
import CreateContrat from "../components/contrats/CreateContrat";
import ContratDetail from "../components/contrats/ContratDetail";

const ContratRoutes = () => {
  return (
    <>
      <Route path="/contrats" element={<ContratList />} />
      <Route path="/contrats/create" element={<CreateContrat />} />
      <Route path="/contrats/edit/:id" element={<EditContrat />} />
      <Route path="/contrats/:id" element={<ContratDetail />} />
    </>
  );
};

export default ContratRoutes;
