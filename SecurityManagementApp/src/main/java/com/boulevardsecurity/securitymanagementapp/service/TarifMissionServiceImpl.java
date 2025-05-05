// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/TarifMissionServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.TarifMissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.TarifMissionDto;
import com.boulevardsecurity.securitymanagementapp.mapper.TarifMissionMapper;
import com.boulevardsecurity.securitymanagementapp.model.TarifMission;
import com.boulevardsecurity.securitymanagementapp.repository.TarifMissionRepository;
import com.boulevardsecurity.securitymanagementapp.service.TarifMissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarifMissionServiceImpl implements TarifMissionService {

    private final TarifMissionRepository      repo;
    private final TarifMissionMapper          mapper;

    @Override
    public TarifMissionDto create(TarifMissionCreateDto dto) {
        // validation basique
        if (dto.getTauxTVA() == null) {
            throw new IllegalArgumentException("Le taux de TVA est obligatoire.");
        }
        TarifMission entity = mapper.toEntity(dto);
        TarifMission saved = repo.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public List<TarifMissionDto> getAll() {
        return repo.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<TarifMissionDto> getById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public Optional<TarifMissionDto> getByType(String type) {
        try {
            return repo.findByTypeMission(Enum.valueOf(com.boulevardsecurity.securitymanagementapp.Enums.TypeMission.class, type))
                    .map(mapper::toDto);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    @Override
    public TarifMissionDto update(Long id, TarifMissionDto dto) {
        TarifMission existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("TarifMission introuvable id=" + id));
        // on reconstruit l’entité à partir du DTO (y compris les modifications de missions)
        TarifMission updated = mapper.toEntity(dto);
        updated.setId(existing.getId());  // conserver l’ID
        TarifMission saved = repo.save(updated);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("TarifMission introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
