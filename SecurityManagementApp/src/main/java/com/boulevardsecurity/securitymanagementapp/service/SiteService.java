package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.SiteCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.SiteDto;

import java.util.List;
import java.util.Optional;

public interface SiteService {
    List<SiteDto> getAllSites();
    Optional<SiteDto> getSiteById(Long id);
    SiteDto createSite(SiteCreateDto dto);
    SiteDto updateSite(Long id, SiteCreateDto dto);
    void deleteSite(Long id);
}
