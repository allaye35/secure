// import React from 'react';
// import { Route } from 'react-router-dom';
// import FactureList from '../components/factures/FactureList';
// import FactureDetail from '../components/factures/FactureDetail';
// import FactureForm from '../components/factures/FactureForm';
// import FacturePeriodeForm from '../components/factures/FacturePeriodeForm';
// import FacturePrint from '../components/factures/FacturePrint';

// const FactureRoutes = () => [
//   // Liste des factures
//   <Route key="factures" path="/factures" element={<FactureList />} />,
  
//   // Création de facture
//   <Route key="facture-create" path="/factures/create" element={<FactureForm />} />,
  
//   // Modification de facture
//   <Route key="facture-edit" path="/factures/edit/:id" element={<FactureForm />} />,
  
//   // Création de facture pour une période
//   <Route key="facture-periode" path="/factures/periode" element={<FacturePeriodeForm />} />,
  
//   // Impression d'une facture - mise avant la route de détail pour priorité
//   <Route key="facture-print" path="/factures/print/:id" element={<FacturePrint />} />,
  
//   // Détail d'une facture - doit être en dernier car ":id" peut capturer "create", "print", etc.
//   <Route key="facture-detail" path="/factures/:id" element={<FactureDetail />} />
// ];

// export default FactureRoutes;