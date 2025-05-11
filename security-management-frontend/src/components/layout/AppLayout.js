// src/components/layout/AppLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBarBootstrap from './NavBarBootstrap';

const AppLayout = () => {
  return (
    <>
      <NavBarBootstrap />
      <main className="container-fluid py-4 mt-5">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
