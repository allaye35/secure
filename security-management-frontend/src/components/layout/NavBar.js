// src/components/layout/NavBar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Navbar, 
  Nav, 
  Container, 
  Button, 
  NavDropdown, 
  Form, 
  FormControl,
  Dropdown,
  Image
} from 'react-bootstrap';
import { 
  FaBars, 
  FaSearch, 
  FaUserCircle, 
  FaCog, 
  FaSignOutAlt,
  FaUserShield,
  FaBriefcase,
  FaFileInvoiceDollar,
  FaBell
} from 'react-icons/fa';

import AuthService from '../../services/AuthService';
import NotificationBadge from './NotificationBadge';

// Importer le logo si disponible
import logo from '../../assets/logo.jpg';

const NavBar = ({ onToggleSidebar, sidebarVisible }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Récupérer les informations de l'utilisateur depuis le localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? userStr : null;
  
  // Notifications de démo
  const demoNotifications = [
    { 
      message: 'Nouvelle mission assignée', 
      time: 'Il y a 5 min', 
      source: 'Planification',
      isRead: false
    },
    { 
      message: 'Rapport en attente de validation', 
      time: 'Il y a 1h', 
      source: 'Opérations',
      isRead: false
    },
    { 
      message: 'Mise à jour des disponibilités requise', 
      time: 'Hier, 14:30', 
      source: 'RH',
      isRead: true
    }
  ];
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Implémentation de la recherche globale
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };
  
  return (
    <Navbar 
      bg="primary" 
      variant="dark" 
      expand="lg" 
      fixed="top" 
      className="navbar-main shadow-sm"
    >
      <Container fluid>
        <Button 
          variant="outline-light" 
          className="me-2 sidebar-toggle border-0"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <FaBars />
        </Button>
        
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <Image 
            src={logo} 
            alt="Logo" 
            height="30" 
            className="d-inline-block align-top me-2" 
            rounded 
          />
          <span className="fw-bold">Security Management</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-main-nav" />
        
        <Navbar.Collapse id="navbar-main-nav">
          <Nav className="me-auto">
            {/* Menus principaux pour l'affichage mobile ou comme alternative à la sidebar */}
            <NavDropdown 
              title={<><FaUserShield className="me-1" /> RH</>}
              id="nav-dropdown-rh"
              className="d-lg-none"
            >
              <NavDropdown.Item as={Link} to="/agents">Agents</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/disponibilites">Disponibilités</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/pointages">Pointages</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contrats-de-travail">Contrats</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/fiches">Fiches de paie</NavDropdown.Item>
            </NavDropdown>
            
            <NavDropdown 
              title={<><FaBriefcase className="me-1" /> Opérations</>}
              id="nav-dropdown-operations"
              className="d-lg-none"
            >
              <NavDropdown.Item as={Link} to="/missions">Missions</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/plannings">Plannings</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sites">Sites</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/rapports">Rapports</NavDropdown.Item>
            </NavDropdown>
            
            <NavDropdown 
              title={<><FaFileInvoiceDollar className="me-1" /> Commercial</>}
              id="nav-dropdown-commercial"
              className="d-lg-none"
            >
              <NavDropdown.Item as={Link} to="/clients">Clients</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/entreprises">Entreprises</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contrats">Contrats</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/devis">Devis</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/factures">Factures</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/tarifs">Tarifs</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          
          <Form className="d-flex mx-auto search-form" onSubmit={handleSearch}>
            <div className="position-relative search-wrapper">
              <FormControl
                type="search"
                placeholder="Recherche..."
                className="me-2"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                variant="outline-light" 
                type="submit" 
                className="position-absolute end-0 top-0 h-100 border-0"
              >
                <FaSearch />
              </Button>
            </div>
          </Form>
          
          <Nav className="ms-auto">
            {/* Notifications */}
            <NotificationBadge 
              count={2} 
              notifications={demoNotifications} 
            />
            
            {/* Profil et menu utilisateur */}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  variant="transparent" 
                  className="nav-link text-light" 
                  id="dropdown-user"
                >
                  <FaUserCircle size={18} className="me-1" />
                  <span className="d-none d-md-inline">{user}</span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="shadow">
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUserCircle className="me-2" /> Profil
                  </Dropdown.Item>
                  
                  <Dropdown.Item as={Link} to="/settings">
                    <FaCog className="me-2" /> Paramètres
                  </Dropdown.Item>
                  
                  <Dropdown.Divider />
                  
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Déconnexion
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Item>
                <Nav.Link as={Link} to="/login">Connexion</Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
