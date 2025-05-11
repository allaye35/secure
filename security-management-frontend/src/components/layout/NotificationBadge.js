// src/components/layout/NotificationBadge.js
import React from 'react';
import { Badge, Button, Dropdown } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';

const NotificationBadge = ({ count = 0, notifications = [] }) => {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="transparent" 
        id="dropdown-notifications"
        className="nav-link position-relative p-0 me-3"
      >
        <FaBell size={18} className="text-light" />
        {count > 0 && (
          <Badge 
            pill 
            bg="danger" 
            className="position-absolute notification-badge"
            style={{ top: '-5px', right: '-5px', fontSize: '0.6rem' }}
          >
            {count}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow notification-menu">
        <div className="p-2 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="m-0">Notifications</h6>
          {count > 0 && (
            <Badge pill bg="primary">
              {count} nouvelles
            </Badge>
          )}
        </div>
        <div className="notification-scroll" style={{maxHeight: '350px', overflowY: 'auto'}}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <Dropdown.Item key={index} className={`border-bottom ${notification.isRead ? '' : 'bg-light'}`}>
                <div className="d-flex flex-column">
                  <small className="text-muted">{notification.time}</small>
                  <p className="mb-1">{notification.message}</p>
                  {notification.source && (
                    <small className="text-primary">{notification.source}</small>
                  )}
                </div>
              </Dropdown.Item>
            ))
          ) : (
            <div className="p-3 text-center text-muted">
              <p>Aucune nouvelle notification</p>
            </div>
          )}
        </div>
        <div className="p-2 border-top text-center">
          <Button variant="link" size="sm" className="p-0">
            Voir toutes les notifications
          </Button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBadge;
