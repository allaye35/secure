package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.GestionnaireNotifications;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GestionnaireNotificationsRepository extends JpaRepository<GestionnaireNotifications, Long> {
    // existant : notifications par agent
    List<GestionnaireNotifications> findByAgentDeSecuriteId(Long agentId);

    // nouveau : notifications par client
    List<GestionnaireNotifications> findByClientId(Long clientId);
}
