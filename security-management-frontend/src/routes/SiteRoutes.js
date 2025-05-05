import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SiteList from "../components/sites/SiteList";
import CreateSite from "../components/sites/CreateSite";
import EditSite from "../components/sites/EditSite";
import SiteDetail from "../components/sites/SiteDetail";

function SiteRoutes() {
  return (
    <Routes>
      <Route path="/sites" element={<SiteList />} />
      <Route path="/sites/create" element={<CreateSite />} />
      <Route path="/sites/edit/:id" element={<EditSite />} />
      <Route path="/sites/:id" element={<SiteDetail />} />
    </Routes>
  );
}

export default SiteRoutes;
