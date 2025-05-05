// src/main/java/com/boulevardsecurity/securitymanagementapp/service/DevisService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.DevisCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.DevisDto;

import java.util.List;
import java.util.Optional;

public interface DevisService {
    List<DevisDto> getAll();
    Optional<DevisDto> getById(Long id);
    Optional<DevisDto> getByReference(String reference);
    DevisDto create(DevisCreateDto dto);
    DevisDto update(Long id, DevisCreateDto dto);
    void delete(Long id);
}
