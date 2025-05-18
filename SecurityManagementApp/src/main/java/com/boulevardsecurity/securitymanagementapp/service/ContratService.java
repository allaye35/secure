// -------------------------------------------------------------
// ContratService.java
// -------------------------------------------------------------
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import java.util.List;
import java.util.Optional;

public interface ContratService {
    ContratDto createContrat(ContratCreateDto dto);
    ContratDto updateContrat(Long id, ContratCreateDto dto);
    List<ContratDto> getAllContrats();
    Optional<ContratDto> getContratById(Long id);
    Optional<ContratDto> getContratByReference(String ref);
    Optional<ContratDto> getContratByDevisId(Long devisId);
    void deleteContrat(Long id);
}