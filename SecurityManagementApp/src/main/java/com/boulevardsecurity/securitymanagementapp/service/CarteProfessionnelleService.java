// src/main/java/com/boulevardsecurity/securitymanagementapp/service/CarteProfessionnelleService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.CarteProfessionnelleCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.CarteProfessionnelleDto;

import java.util.List;
import java.util.Optional;

public interface CarteProfessionnelleService {

    List<CarteProfessionnelleDto> getAll();

    Optional<CarteProfessionnelleDto> getById(Long id);

    List<CarteProfessionnelleDto> getByAgent(Long agentId);

    CarteProfessionnelleDto create(CarteProfessionnelleCreationDto creationDto);

    CarteProfessionnelleDto update(Long id, CarteProfessionnelleDto updateDto);

    void delete(Long id);
}
