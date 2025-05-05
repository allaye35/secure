package com.boulevardsecurity.securitymanagementapp.service;


import com.boulevardsecurity.securitymanagementapp.dto.DiplomeSsiapCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.DiplomeSsiapDto;

import java.util.List;
import java.util.Optional;

public interface DiplomeSsiapService {
    List<DiplomeSsiapDto> getAll();
    Optional<DiplomeSsiapDto> getById(Long id);
    List<DiplomeSsiapDto> getByAgent(Long agentId);
    DiplomeSsiapDto create(DiplomeSsiapCreationDto dto);
    DiplomeSsiapDto update(Long id, DiplomeSsiapCreationDto dto);
    void delete(Long id);
}
