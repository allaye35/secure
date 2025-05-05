// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/GestionnaireNotificationsServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.mapper.GestionnaireNotificationsMapper;
import com.boulevardsecurity.securitymanagementapp.model.GestionnaireNotifications;
import com.boulevardsecurity.securitymanagementapp.repository.GestionnaireNotificationsRepository;
import com.boulevardsecurity.securitymanagementapp.service.GestionnaireNotificationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GestionnaireNotificationsServiceImpl implements GestionnaireNotificationsService {

    private final GestionnaireNotificationsRepository repo;
    private final GestionnaireNotificationsMapper mapper;

    @Override
    public List<GestionnaireNotificationsDto> getAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<GestionnaireNotificationsDto> getById(Long id) {
        return repo.findById(id).map(mapper::toDto);
    }

    @Override
    public List<GestionnaireNotificationsDto> getByAgent(Long agentId) {
        return repo.findByAgentDeSecuriteId(agentId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<GestionnaireNotificationsDto> getByClient(Long clientId) {
        return repo.findByClientId(clientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public GestionnaireNotificationsDto create(GestionnaireNotificationsCreateDto dto) {
        GestionnaireNotifications n = mapper.toEntity(dto);
        GestionnaireNotifications saved = repo.save(n);
        return mapper.toDto(saved);
    }

    @Override
    public GestionnaireNotificationsDto update(Long id, GestionnaireNotificationsCreateDto dto) {
        GestionnaireNotifications existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable id=" + id));
        mapper.updateEntity(dto, existing);
        GestionnaireNotifications saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Notification introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
