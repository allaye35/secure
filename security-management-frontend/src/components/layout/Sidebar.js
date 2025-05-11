// src/components/layout/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Accordion, 
  Nav, 
  Button,
  Offcanvas 
} from 'react-bootstrap';
import { 
  FaUserShield, 
  FaBriefcase, 
  FaBuilding, 
  FaFileInvoiceDollar,
  FaUserClock,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaIdCard,
  FaGraduationCap,
  FaFileContract,
  FaMoneyBillWave,
  FaFileSignature,
  FaPercentage,
  FaBell
} from 'react-icons/fa';

const Sidebar = ({ show, handleClose, windowWidth }) => {
  const [activeKey, setActiveKey] = useState('');

  const menuItems = [
    {
      title: 'Ressources Humaines',
      icon: <FaUserShield className="me-2" />,
      eventKey: '0',
      items: [
        { title: 'Agents', path: '/agents', icon: <FaUserShield size={14} className="me-1" /> },
        { title: 'Créer Agent', path: '/agents/create' },
        { title: 'Disponibilités', path: '/disponibilites', icon: <FaUserClock size={14} className="me-1" /> },
        { title: 'Créer Disponibilité', path: '/disponibilites/create' },
        { title: 'Pointages', path: '/pointages', icon: <FaUserClock size={14} className="me-1" /> },
        { title: 'Créer Pointage', path: '/pointages/create' },
        { title: 'Cartes Pro', path: '/cartes-professionnelles', icon: <FaIdCard size={14} className="me-1" /> },
        { title: 'Créer Carte Pro', path: '/cartes-professionnelles/create' },
        { title: 'Diplômes SSIAP', path: '/diplomes-ssiap', icon: <FaGraduationCap size={14} className="me-1" /> },
        { title: 'Créer Diplôme', path: '/diplomes-ssiap/create' },
        { title: 'Contrats de Travail', path: '/contrats-de-travail', icon: <FaFileContract size={14} className="me-1" /> },
        { title: 'Créer Contrat', path: '/contrats-de-travail/create' },
        { title: 'Fiches de Paie', path: '/fiches', icon: <FaMoneyBillWave size={14} className="me-1" /> },
        { title: 'Créer Fiche de Paie', path: '/fiches/create' },
        { title: 'Articles C. Travail', path: '/article-contrat-travail', icon: <FaFileSignature size={14} className="me-1" /> },
        { title: 'Créer Article C. Travail', path: '/article-contrat-travail/create' },
        { title: 'Lignes Cotisations', path: '/lignes-cotisation', icon: <FaPercentage size={14} className="me-1" /> },
        { title: 'Créer Ligne Cotisation', path: '/lignes-cotisation/create' }
      ]
    },
    {
      title: 'Opérations',
      icon: <FaBriefcase className="me-2" />,
      eventKey: '1',
      items: [
        { title: 'Missions', path: '/missions', icon: <FaBriefcase size={14} className="me-1" /> },
        { title: 'Créer Mission', path: '/missions/create' },
        { title: 'Plannings', path: '/plannings', icon: <FaCalendarAlt size={14} className="me-1" /> },
        { title: 'Créer Planning', path: '/plannings/create' },
        { title: 'Rapports', path: '/rapports', icon: <FaFileAlt size={14} className="me-1" /> },
        { title: 'Créer Rapport', path: '/rapports/create' },
        { title: 'Sites', path: '/sites', icon: <FaBuilding size={14} className="me-1" /> },
        { title: 'Créer Site', path: '/sites/create' },
        { title: 'Géolocalisations', path: '/geolocalisations', icon: <FaMapMarkedAlt size={14} className="me-1" /> },
        { title: 'Créer Géolocalisation', path: '/geolocalisations/create' },
        { title: 'Zones de travail', path: '/zones', icon: <FaMapMarkedAlt size={14} className="me-1" /> },
        { title: 'Créer Zone', path: '/zones/create' },
        { title: 'Notifications', path: '/notifications', icon: <FaBell size={14} className="me-1" /> },
        { title: 'Créer Notification', path: '/notifications/create' }
      ]
    },
    {
      title: 'Commercial',
      icon: <FaFileInvoiceDollar className="me-2" />,
      eventKey: '2',
      items: [
        { title: 'Clients', path: '/clients', icon: <FaBuilding size={14} className="me-1" /> },
        { title: 'Créer Client', path: '/clients/create' },
        { title: 'Entreprises', path: '/entreprises', icon: <FaBuilding size={14} className="me-1" /> },
        { title: 'Créer Entreprise', path: '/entreprises/create' },
        { title: 'Contrats', path: '/contrats', icon: <FaFileContract size={14} className="me-1" /> },
        { title: 'Créer Contrat', path: '/contrats/create' },
        { title: 'Devis', path: '/devis', icon: <FaFileInvoiceDollar size={14} className="me-1" /> },
        { title: 'Créer Devis', path: '/devis/create' },
        { title: 'Factures', path: '/factures', icon: <FaFileInvoiceDollar size={14} className="me-1" /> },
        { title: 'Créer Facture', path: '/factures/create' },
        { title: 'Tarifs', path: '/tarifs', icon: <FaMoneyBillWave size={14} className="me-1" /> },
        { title: 'Créer Tarif', path: '/tarifs/create' },
        { title: 'Articles', path: '/articles', icon: <FaFileAlt size={14} className="me-1" /> },
        { title: 'Créer Article', path: '/articles/create' }
      ]
    }
  ];

  return (
    <Offcanvas 
      show={show} 
      onHide={handleClose} 
      placement="start" 
      backdrop={windowWidth < 992 ? true : false}
      className="sidebar-menu"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Menu de Navigation</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <Accordion activeKey={activeKey} className="sidebar-accordion">
          {menuItems.map((category, index) => (
            <Accordion.Item 
              eventKey={category.eventKey} 
              key={index}
              className="border-0"
            >
              <Accordion.Header 
                onClick={() => setActiveKey(activeKey === category.eventKey ? '' : category.eventKey)}
                className="sidebar-header"
              >
                {category.icon} {category.title}
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <Nav className="flex-column">
                  {category.items.map((item, idx) => (
                    <Nav.Item key={idx}>
                      <Nav.Link 
                        as={Link} 
                        to={item.path} 
                        onClick={windowWidth < 992 ? handleClose : undefined}
                        className="sidebar-link"
                      >
                        {item.icon} {item.title}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;
