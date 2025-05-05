// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/PlanningMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.PlanningDto;
import com.boulevardsecurity.securitymanagementapp.dto.PlanningCreateDto;
import com.boulevardsecurity.securitymanagementapp.model.Planning;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PlanningMapper {

    private final MissionRepository missionRepo;

    /** ENTITÉ → DTO (lecture) */
    public PlanningDto toDto(Planning entity) {
        return PlanningDto.builder()
                .id(entity.getId())
                .dateCreation(entity.getDateCreation())
                .dateModification(entity.getDateModification())
                .missionIds(entity.getMissions().stream()
                        .map(m -> m.getId())
                        .collect(Collectors.toList()))
                .build();
    }

    /** DTO de création → ENTITÉ */
    public Planning toEntity(PlanningCreateDto dto) {
        Planning p = Planning.builder().build();
        if (dto.getMissionIds() != null) {
            p.setMissions(dto.getMissionIds().stream()
                    .map(id -> missionRepo.findById(id)
                            .orElseThrow(() ->
                                    new IllegalArgumentException("Mission introuvable, id=" + id)))
                    .collect(Collectors.toList()));
        }
        return p;
    }

    /** Mise à jour partielle (patch) */
    public void updateEntity(Planning entity, PlanningCreateDto dto) {
        if (dto.getMissionIds() != null) {
            entity.setMissions(dto.getMissionIds().stream()
                    .map(id -> missionRepo.findById(id)
                            .orElseThrow(() ->
                                    new IllegalArgumentException("Mission introuvable, id=" + id)))
                    .collect(Collectors.toList()));
        }
    }
}
