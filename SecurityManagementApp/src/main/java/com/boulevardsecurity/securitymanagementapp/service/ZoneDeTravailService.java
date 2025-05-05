// src/main/java/com/boulevardsecurity/securitymanagementapp/service/ZoneDeTravailService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeZone;
import com.boulevardsecurity.securitymanagementapp.dto.ZoneDeTravailCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ZoneDeTravailDto;

import java.util.List;
import java.util.Optional;

public interface ZoneDeTravailService {
    ZoneDeTravailDto createZone(ZoneDeTravailCreateDto createDto);
    List<ZoneDeTravailDto> getAllZones();
    Optional<ZoneDeTravailDto> getZoneById(Long id);
    List<ZoneDeTravailDto> searchZonesByName(String nom);
    List<ZoneDeTravailDto> searchZonesByType(TypeZone typeZone);
    ZoneDeTravailDto updateZone(Long id, ZoneDeTravailCreateDto updateDto);
    void deleteZone(Long id);
}
