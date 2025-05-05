// src/main/java/com/boulevardsecurity/securitymanagementapp/service/DisponibiliteService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.DisponibiliteCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.DisponibiliteDto;

import java.util.List;
import java.util.Optional;

public interface DisponibiliteService {
    List<DisponibiliteDto> getAll();
    Optional<DisponibiliteDto> getById(Long id);
    List<DisponibiliteDto> getByAgent(Long agentId);
    DisponibiliteDto create(DisponibiliteCreationDto creationDto);
    DisponibiliteDto update(Long id, DisponibiliteCreationDto updateDto);
    void delete(Long id);
}

