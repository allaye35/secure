// src/main/java/com/boulevardsecurity/securitymanagementapp/service/GestionnaireNotificationsService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import java.util.List;
import java.util.Optional;

public interface GestionnaireNotificationsService {
    List<GestionnaireNotificationsDto> getAll();
    Optional<GestionnaireNotificationsDto> getById(Long id);
    List<GestionnaireNotificationsDto> getByAgent(Long agentId);
    List<GestionnaireNotificationsDto> getByClient(Long clientId);
    GestionnaireNotificationsDto create(GestionnaireNotificationsCreateDto dto);
    GestionnaireNotificationsDto update(Long id, GestionnaireNotificationsCreateDto dto);
    void delete(Long id);
}
