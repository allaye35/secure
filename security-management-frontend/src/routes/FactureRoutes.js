import React from 'react';
import { Route } from 'react-router-dom';
import FactureList from '../components/factures/FactureList';
import FactureDetail from '../components/factures/FactureDetail';
import FactureForm from '../components/factures/FactureForm';
import FacturePeriodeForm from '../components/factures/FacturePeriodeForm';
import FacturePrint from '../components/factures/FacturePrint';

const FactureRoutes = () => [
  // Liste des factures
  <Route key="factures" path="/factures" element={<FactureList />} />,
  
  // Détail d'une facture
  <Route key="facture-detail" path="/factures/:id" element={<FactureDetail />} />,
  
  // Création de facture
  <Route key="facture-create" path="/factures/create" element={<FactureForm />} />,
  
  // Modification de facture
  <Route key="facture-edit" path="/factures/edit/:id" element={<FactureForm />} />,
  
  // Création de facture pour une période
  <Route key="facture-periode" path="/factures/periode" element={<FacturePeriodeForm />} />,
  
  // Impression d'une facture
  <Route key="facture-print" path="/factures/print/:id" element={<FacturePrint />} />
];

export default FactureRoutes;