// src/routes/TarifRoutes.js
import React from "react";
import { Route } from "react-router-dom";
import TarifMissionList from "../components/tarifs/TarifMissionList";
import TarifMissionDetail from "../components/tarifs/TarifMissionDetail";
import TarifMissionForm from "../components/tarifs/TarifMissionForm";

const TarifRoutes = () => {
  return (
    <>
      <Route path="/tarifs" element={<TarifMissionList />} />
      <Route path="/tarifs/:id" element={<TarifMissionDetail />} />
      <Route path="/tarifs/create" element={<TarifMissionForm />} />
      <Route path="/tarifs/edit/:id" element={<TarifMissionForm />} />
    </>
  );
};

export default TarifRoutes;
