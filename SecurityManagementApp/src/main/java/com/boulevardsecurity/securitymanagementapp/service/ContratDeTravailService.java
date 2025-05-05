// src/main/java/com/boulevardsecurity/securitymanagementapp/service/ContratDeTravailService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailDto;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ContratDeTravailService {

    List<ContratDeTravailDto> getAllContrats();

    Optional<ContratDeTravailDto> getContratById(Long id);

    ContratDeTravailDto createContrat(ContratDeTravailCreationDto dto);

    ContratDeTravailDto updateContrat(Long id, ContratDeTravailCreationDto dto);

    void deleteContrat(Long id);

    boolean prolongerContrat(Long id, LocalDate nouvelleDateFin);

    List<ContratDeTravailDto> getContratsByAgentId(Long agentId);
}
