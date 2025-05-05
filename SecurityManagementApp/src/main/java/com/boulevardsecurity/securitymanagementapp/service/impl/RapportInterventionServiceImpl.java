// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/RapportInterventionServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.RapportInterventionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.RapportInterventionDto;
import com.boulevardsecurity.securitymanagementapp.mapper.RapportInterventionMapper;
import com.boulevardsecurity.securitymanagementapp.model.RapportIntervention;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import com.boulevardsecurity.securitymanagementapp.repository.RapportInterventionRepository;
import com.boulevardsecurity.securitymanagementapp.service.RapportInterventionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RapportInterventionServiceImpl implements RapportInterventionService {

    private final RapportInterventionRepository repo;
    private final MissionRepository missionRepo;
    private final RapportInterventionMapper mapper;

    @Override
    public List<RapportInterventionDto> getAllRapports() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<RapportInterventionDto> getRapportById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<RapportInterventionDto> getRapportsByMissionId(Long missionId) {
        return repo.findByMissionId(missionId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RapportInterventionDto createRapport(RapportInterventionCreateDto creationDto) {
        RapportIntervention ent = mapper.toEntity(creationDto);
        RapportIntervention saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public RapportInterventionDto updateRapport(Long id, RapportInterventionCreateDto updateDto) {
        RapportIntervention existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rapport non trouvé id=" + id));
        mapper.updateEntityFromDto(updateDto, existing);
        RapportIntervention saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void deleteRapport(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Rapport non trouvé id=" + id);
        }
        repo.deleteById(id);
    }
}
