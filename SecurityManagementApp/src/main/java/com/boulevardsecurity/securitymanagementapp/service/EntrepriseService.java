// src/main/java/com/boulevardsecurity/securitymanagementapp/service/EntrepriseService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.EntrepriseCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.EntrepriseDto;

import java.util.List;
import java.util.Optional;

public interface EntrepriseService {
    EntrepriseDto createEntreprise(EntrepriseCreateDto dto);
    List<EntrepriseDto> getAllEntreprises();
    Optional<EntrepriseDto> getEntrepriseById(Long id);
    Optional<EntrepriseDto> getEntrepriseByNom(String nom);
    EntrepriseDto updateEntreprise(Long id, EntrepriseDto dto);
    void deleteEntreprise(Long id);
}
