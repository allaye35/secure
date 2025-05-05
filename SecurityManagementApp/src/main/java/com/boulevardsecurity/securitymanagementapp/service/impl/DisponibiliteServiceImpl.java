package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.DisponibiliteCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.DisponibiliteDto;
import com.boulevardsecurity.securitymanagementapp.mapper.DisponibiliteMapper;
import com.boulevardsecurity.securitymanagementapp.model.Disponibilite;
import com.boulevardsecurity.securitymanagementapp.repository.DisponibiliteRepository;
import com.boulevardsecurity.securitymanagementapp.service.DisponibiliteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// DisponibiliteServiceImpl.java
@Service
@RequiredArgsConstructor
public class DisponibiliteServiceImpl implements DisponibiliteService {

    private final DisponibiliteRepository repo;
    private final DisponibiliteMapper     mapper;

    @Override
    public List<DisponibiliteDto> getAll() {
        return repo.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<DisponibiliteDto> getById(Long id) {
        return repo.findById(id).map(mapper::toDto);
    }

    @Override
    public List<DisponibiliteDto> getByAgent(Long agentId) {
        return repo.findByAgentDeSecuriteId(agentId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public DisponibiliteDto create(DisponibiliteCreationDto dto) {
        Disponibilite saved = repo.save(mapper.toEntity(dto));
        return mapper.toDto(saved);
    }

    @Override
    public DisponibiliteDto update(Long id, DisponibiliteCreationDto dto) {
        Disponibilite entity = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Disponibilité introuvable id=" + id));

        mapper.updateEntityFromCreationDto(dto, entity);
        return mapper.toDto(repo.save(entity));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Disponibilité introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
