// src/main/java/com/boulevardsecurity/securitymanagementapp/service/LigneCotisationService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.LigneCotisationCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.LigneCotisationDto;

import java.util.List;
import java.util.Optional;

public interface LigneCotisationService {
    List<LigneCotisationDto> getAll();
    Optional<LigneCotisationDto> getById(Long id);
    List<LigneCotisationDto> getByFicheDePaieId(Long ficheId);
    LigneCotisationDto create(LigneCotisationCreationDto dto);
    LigneCotisationDto update(Long id, LigneCotisationCreationDto dto);
    void delete(Long id);
}
