// src/components/layout/Toolbar.js
import React from 'react';
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaFileExport, 
  FaPrint, 
  FaRedo, 
  FaListUl, 
  FaThLarge 
} from 'react-icons/fa';

const Toolbar = ({ 
  title, 
  onAdd, 
  onSearch, 
  onExport, 
  onPrint, 
  onRefresh,
  onViewChange,
  currentView = 'list'
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded toolbar">
      <div>
        <h5 className="mb-0">{title}</h5>
      </div>
      
      <div className="d-flex">
        {onSearch && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Rechercher</Tooltip>}
          >
            <Button 
              variant="outline-secondary" 
              className="me-2" 
              onClick={onSearch}
            >
              <FaSearch />
            </Button>
          </OverlayTrigger>
        )}
        
        {onAdd && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Ajouter</Tooltip>}
          >
            <Button 
              variant="primary" 
              className="me-2" 
              onClick={onAdd}
            >
              <FaPlus />
            </Button>
          </OverlayTrigger>
        )}
        
        <ButtonGroup className="me-2">
          {onExport && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Exporter</Tooltip>}
            >
              <Button 
                variant="outline-secondary" 
                onClick={onExport}
              >
                <FaFileExport />
              </Button>
            </OverlayTrigger>
          )}
          
          {onPrint && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Imprimer</Tooltip>}
            >
              <Button 
                variant="outline-secondary" 
                onClick={onPrint}
              >
                <FaPrint />
              </Button>
            </OverlayTrigger>
          )}
        </ButtonGroup>
        
        {onRefresh && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Actualiser</Tooltip>}
          >
            <Button 
              variant="outline-secondary" 
              className="me-2" 
              onClick={onRefresh}
            >
              <FaRedo />
            </Button>
          </OverlayTrigger>
        )}
        
        {onViewChange && (
          <ButtonGroup>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Vue liste</Tooltip>}
            >
              <Button 
                variant={currentView === 'list' ? 'secondary' : 'outline-secondary'} 
                onClick={() => onViewChange('list')}
              >
                <FaListUl />
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Vue grille</Tooltip>}
            >
              <Button 
                variant={currentView === 'grid' ? 'secondary' : 'outline-secondary'} 
                onClick={() => onViewChange('grid')}
              >
                <FaThLarge />
              </Button>
            </OverlayTrigger>
          </ButtonGroup>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
