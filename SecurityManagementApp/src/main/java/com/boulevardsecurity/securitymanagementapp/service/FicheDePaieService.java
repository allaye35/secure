// src/main/java/com/boulevardsecurity/securitymanagementapp/service/FicheDePaieService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import java.util.List;
import java.util.Optional;

public interface FicheDePaieService {
    FicheDePaieDto create(FicheDePaieCreationDto dto);
    Optional<FicheDePaieDto> getById(Long id);
    List<FicheDePaieDto> getAll();
    FicheDePaieDto update(Long id, FicheDePaieCreationDto dto);
    void delete(Long id);
}
