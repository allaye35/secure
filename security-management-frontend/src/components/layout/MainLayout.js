// src/components/layout/MainLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavBar from './NavBar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 992);
  
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleCloseSidebar = () => {
    if (windowWidth < 992) {
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      // Auto-show sidebar on large screens
      if (width >= 992) {
        setSidebarVisible(true);
        setShowSidebar(true);
      } else {
        setSidebarVisible(false);
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar 
        onToggleSidebar={handleToggleSidebar}
        sidebarVisible={sidebarVisible}
      />
      
      <div className="d-flex flex-grow-1">
        <Sidebar 
          show={showSidebar} 
          handleClose={handleCloseSidebar} 
          windowWidth={windowWidth}
        />
        
        <Container 
          fluid 
          className={`main-content py-4 transition-width ${showSidebar && windowWidth >= 992 ? 'content-with-sidebar' : ''}`}
        >
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default MainLayout;
