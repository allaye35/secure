import React from "react";
import { Route } from "react-router-dom";
import ClientList from "../components/clients/ClientList";
import ClientDetail from "../components/clients/ClientDetail";
import CreateClient from "../components/clients/CreateClient";
import EditClient from "../components/clients/EditClient";

const ClientRoutes = () => {
  return (
    <>
      <Route path="/clients" element={<ClientList />} />
      <Route path="/clients/create" element={<CreateClient />} />
      <Route path="/clients/:id" element={<ClientDetail />} />
      <Route path="/clients/edit/:id" element={<EditClient />} />
    </>
  );
};

export default ClientRoutes;
