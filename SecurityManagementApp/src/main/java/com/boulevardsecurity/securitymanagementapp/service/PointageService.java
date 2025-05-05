// src/main/java/com/boulevardsecurity/securitymanagementapp/service/PointageService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.PointageCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.PointageDto;

import java.util.List;
import java.util.Optional;

public interface PointageService {

    List<PointageDto> recupererTousLesPointages();

    Optional<PointageDto> recupererPointageParId(Long id);

    List<PointageDto> recupererPointagesParMission(Long idMission);

    PointageDto creerPointage(PointageCreateDto dto);

    PointageDto modifierPointage(Long id, PointageCreateDto dto);

    void supprimerPointage(Long id);
}
