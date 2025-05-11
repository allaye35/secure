// src/components/layout/NavBarBootstrap.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { FaUserShield, FaBriefcase, FaFileInvoiceDollar, FaSignOutAlt, FaUser } from "react-icons/fa";
import AuthService from "../../services/AuthService";

export default function NavBarBootstrap() {
    const navigate = useNavigate();
    const user = localStorage.getItem("user");

    const handleLogout = () => {
        AuthService.logout();
        navigate("/login", { replace: true });
    };

    return (
        <Navbar bg="primary" variant="dark" expand="lg" sticky="top" className="navbar-custom">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="me-4">
                    <img 
                        src="/logo192.png" 
                        width="30" 
                        height="30" 
                        className="d-inline-block align-top me-2" 
                        alt="Logo"
                    />
                    Boulevard Sécurité
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/" className="me-2">Accueil</Nav.Link>
                        
                        {/* Menu Ressources Humaines */}
                        <NavDropdown 
                            title={<span><FaUserShield className="me-1" /> Ressources Humaines</span>} 
                            id="nav-dropdown-rh"
                            className="me-2"
                        >
                            <NavDropdown.Header>Agents</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/agents">Agents</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/agents/create">Créer Agent</NavDropdown.Item>
                            <NavDropdown.Divider />
                            
                            <NavDropdown.Header>Disponibilités & Pointages</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/disponibilites">Disponibilités</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/disponibilites/create">Créer Disponibilité</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/pointages">Pointages</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/pointages/create">Créer Pointage</NavDropdown.Item>
                            <NavDropdown.Divider />
                            
                            <NavDropdown.Header>Documents</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/cartes-professionnelles">Cartes Pro</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/cartes-professionnelles/create">Créer Carte Pro</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/diplomes-ssiap">Diplômes SSIAP</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/diplomes-ssiap/create">Créer Diplôme</NavDropdown.Item>
                            <NavDropdown.Divider />
                            
                            <NavDropdown.Header>Contrats & Paie</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/contrats-de-travail">Contrats de Travail</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/contrats-de-travail/create">Créer Contrat</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/fiches">Fiches de Paie</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/fiches/create">Créer Fiche de Paie</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/article-contrat-travail">Articles C. Travail</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/article-contrat-travail/create">Créer Article C. Travail</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/lignes-cotisation">Lignes Cotisations</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/lignes-cotisation/create">Créer Ligne Cotisation</NavDropdown.Item>
                        </NavDropdown>

                        {/* Menu Opérations */}
                        <NavDropdown 
                            title={<span><FaBriefcase className="me-1" /> Opérations</span>} 
                            id="nav-dropdown-operations"
                            className="me-2"
                        >
                            <NavDropdown.Header>Missions & Plannings</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/missions">Missions</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/missions/create">Créer Mission</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/plannings">Plannings</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/plannings/create">Créer Planning</NavDropdown.Item>
                            <NavDropdown.Divider />
                            
                            <NavDropdown.Header>Rapports & Sites</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/rapports">Rapports</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rapports/create">Créer Rapport</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/sites">Sites</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/sites/create">Créer Site</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/geolocalisations">Géolocalisations</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/geolocalisations/create">Créer Géolocalisation</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/zones">Zones de travail</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/zones/create">Créer Zone</NavDropdown.Item>
                            <NavDropdown.Divider />
                            
                            <NavDropdown.Header>Communication</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/notifications">Notifications</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/notifications/create">Créer Notification</NavDropdown.Item>
                        </NavDropdown>

                        {/* Menu Commercial */}
                        <NavDropdown 
                            title={<span><FaFileInvoiceDollar className="me-1" /> Commercial</span>} 
                            id="nav-dropdown-commercial"
                        >
                            <NavDropdown.Header>Clients & Entreprises</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/clients">Clients</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/clients/create">Créer Client</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/entreprises">Entreprises</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/entreprises/create">Créer Entreprise</NavDropdown.Item>
                            <NavDropdown.Divider />
                            
                            <NavDropdown.Header>Contrats & Devis</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/contrats">Contrats</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/contrats/create">Créer Contrat</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/devis">Devis</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/devis/create">Créer Devis</NavDropdown.Item>
                            <NavDropdown.Divider />
                            
                            <NavDropdown.Header>Facturation</NavDropdown.Header>
                            <NavDropdown.Item as={Link} to="/factures">Factures</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/factures/create">Créer Facture</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/tarifs">Tarifs</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/tarifs/create">Créer Tarif</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/articles">Articles</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/articles/create">Créer Article</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    
                    {/* Profile & Auth */}
                    <Nav>
                        {user ? (
                            <>
                                <Navbar.Text className="me-3 text-light">
                                    <FaUser className="me-1" /> Bonjour, {user}
                                </Navbar.Text>
                                <Button 
                                    variant="outline-light" 
                                    size="sm" 
                                    onClick={handleLogout}
                                    className="d-flex align-items-center"
                                >
                                    <FaSignOutAlt className="me-1" /> Déconnexion
                                </Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Connexion</Nav.Link>
                                <Nav.Link as={Link} to="/register">Inscription</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
