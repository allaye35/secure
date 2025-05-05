// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/LigneCotisationServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.LigneCotisationCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.LigneCotisationDto;
import com.boulevardsecurity.securitymanagementapp.mapper.LigneCotisationMapper;
import com.boulevardsecurity.securitymanagementapp.model.LigneCotisation;
import com.boulevardsecurity.securitymanagementapp.repository.LigneCotisationRepository;
import com.boulevardsecurity.securitymanagementapp.service.LigneCotisationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LigneCotisationServiceImpl implements LigneCotisationService {

    private final LigneCotisationRepository repo;
    private final LigneCotisationMapper mapper;

    @Override
    public List<LigneCotisationDto> getAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<LigneCotisationDto> getById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<LigneCotisationDto> getByFicheDePaieId(Long ficheId) {
        return repo.findByFicheDePaie_IdOrderById(ficheId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public LigneCotisationDto create(LigneCotisationCreationDto dto) {
        LigneCotisation ent = mapper.toEntity(dto);
        LigneCotisation saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public LigneCotisationDto update(Long id, LigneCotisationCreationDto dto) {
        LigneCotisation existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "LigneCotisation introuvable id=" + id));
        mapper.updateEntityFromDto(dto, existing);
        LigneCotisation saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("LigneCotisation introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
