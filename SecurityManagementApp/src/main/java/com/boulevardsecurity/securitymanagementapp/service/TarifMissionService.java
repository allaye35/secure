// src/main/java/com/boulevardsecurity/securitymanagementapp/service/TarifMissionService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.TarifMissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.TarifMissionDto;

import java.util.List;
import java.util.Optional;

public interface TarifMissionService {
    TarifMissionDto create(TarifMissionCreateDto dto);
    List<TarifMissionDto> getAll();
    Optional<TarifMissionDto> getById(Long id);
    Optional<TarifMissionDto> getByType(String typeMission);
    TarifMissionDto update(Long id, TarifMissionDto dto);
    void delete(Long id);
}
