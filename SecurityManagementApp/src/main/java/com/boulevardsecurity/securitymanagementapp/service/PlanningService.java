// src/main/java/com/boulevardsecurity/securitymanagementapp/service/PlanningService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.PlanningCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.PlanningDto;

import java.util.List;
import java.util.Optional;

public interface PlanningService {

    List<PlanningDto> getAllPlannings();

    Optional<PlanningDto> getPlanningById(Long id);

    PlanningDto createPlanning(PlanningCreateDto dto);

    PlanningDto updatePlanning(Long id, PlanningCreateDto dto);

    void deletePlanning(Long id);

    PlanningDto addMissionToPlanning(Long planningId, Long missionId);

    PlanningDto removeMissionFromPlanning(Long planningId, Long missionId);
}
