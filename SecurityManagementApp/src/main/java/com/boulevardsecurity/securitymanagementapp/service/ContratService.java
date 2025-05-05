// src/main/java/com/boulevardsecurity/securitymanagementapp/service/ContratService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.ContratCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDto;

import java.util.List;
import java.util.Optional;

public interface ContratService {
    ContratDto createContrat(ContratCreateDto dto);
    List<ContratDto> getAllContrats();
    Optional<ContratDto> getContratById(Long id);
    Optional<ContratDto> getContratByReference(String reference);
    ContratDto updateContrat(Long id, ContratCreateDto dto);
    void deleteContrat(Long id);
}
