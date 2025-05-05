// src/main/java/com/boulevardsecurity/securitymanagementapp/service/RapportInterventionService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.RapportInterventionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.RapportInterventionDto;

import java.util.List;
import java.util.Optional;

public interface RapportInterventionService {
    List<RapportInterventionDto> getAllRapports();
    Optional<RapportInterventionDto> getRapportById(Long id);
    List<RapportInterventionDto> getRapportsByMissionId(Long missionId);
    RapportInterventionDto createRapport(RapportInterventionCreateDto creationDto);
    RapportInterventionDto updateRapport(Long id, RapportInterventionCreateDto updateDto);
    void deleteRapport(Long id);
}
