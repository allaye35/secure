import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DevisForm from '../components/devis/DevisForm';
import DevisList from '../components/devis/DevisList';
import DevisDetail from '../components/devis/DevisDetail';

const DevisRoutes = () => {
    return (
        <Routes>
            <Route path="/devis" element={<DevisList />} />
            <Route path="/devis/create" element={<DevisForm />} />
            <Route path="/devis/edit/:id" element={<DevisForm />} />
            <Route path="/devis/:id" element={<DevisDetail />} />
        </Routes>
    );
};

export default DevisRoutes;