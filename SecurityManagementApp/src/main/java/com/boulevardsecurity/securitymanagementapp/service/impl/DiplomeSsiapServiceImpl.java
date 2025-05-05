package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.DiplomeSsiapCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.DiplomeSsiapDto;
import com.boulevardsecurity.securitymanagementapp.mapper.DiplomeSsiapMapper;
import com.boulevardsecurity.securitymanagementapp.model.DiplomeSSIAP;
import com.boulevardsecurity.securitymanagementapp.repository.DiplomeSSIAPRepository;
import com.boulevardsecurity.securitymanagementapp.service.DiplomeSsiapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiplomeSsiapServiceImpl implements DiplomeSsiapService {

    private final DiplomeSSIAPRepository repo;
    private final DiplomeSsiapMapper mapper;

    @Override
    public List<DiplomeSsiapDto> getAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<DiplomeSsiapDto> getById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<DiplomeSsiapDto> getByAgent(Long agentId) {
        return repo.findByAgentDeSecuriteId(agentId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public DiplomeSsiapDto create(DiplomeSsiapCreationDto dto) {
        DiplomeSSIAP ent = mapper.toEntity(dto);
        DiplomeSSIAP saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public DiplomeSsiapDto update(Long id, DiplomeSsiapCreationDto dto) {
        DiplomeSSIAP existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Diplôme SSIAP introuvable id=" + id));
        mapper.updateEntityFromDto(mapper.toDto(existing), existing);
        // si vous voulez mettre à jour aussi les champs obligatoires :
        // mapper.toEntity(dto) n'est pas utilisé ici, on fait que le patch
        DiplomeSSIAP saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Diplôme SSIAP introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
