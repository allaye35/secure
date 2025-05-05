// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/FicheDePaieServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.mapper.FicheDePaieMapper;
import com.boulevardsecurity.securitymanagementapp.model.FicheDePaie;
import com.boulevardsecurity.securitymanagementapp.repository.FicheDePaieRepository;
import com.boulevardsecurity.securitymanagementapp.service.FicheDePaieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FicheDePaieServiceImpl implements FicheDePaieService {

    private final FicheDePaieRepository repo;
    private final FicheDePaieMapper mapper;

    @Override
    public FicheDePaieDto create(FicheDePaieCreationDto dto) {
        FicheDePaie ent = mapper.toEntity(dto);
        FicheDePaie saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public Optional<FicheDePaieDto> getById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<FicheDePaieDto> getAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public FicheDePaieDto update(Long id, FicheDePaieCreationDto dto) {
        FicheDePaie existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fiche de paie introuvable id=" + id));
        mapper.updateEntityFromDto(dto, existing);
        FicheDePaie saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Fiche de paie introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
