// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/RapportInterventionMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.Enums.RapportStatus;
import com.boulevardsecurity.securitymanagementapp.dto.RapportInterventionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.RapportInterventionDto;
import com.boulevardsecurity.securitymanagementapp.model.RapportIntervention;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RapportInterventionMapper {

    private final MissionRepository missionRepo;

    /** ENTITÉ → DTO */
    public RapportInterventionDto toDto(RapportIntervention ent) {
        return RapportInterventionDto.builder()
                .id(ent.getId())
                .dateIntervention(ent.getDateIntervention())
                .description(ent.getDescription())
                .contenu(ent.getContenu())
                .agentNom(ent.getAgentNom())
                .agentEmail(ent.getAgentEmail())
                .agentTelephone(ent.getAgentTelephone())
                .status(ent.getStatus())
                .dateCreation(ent.getDateCreation())
                .dateModification(ent.getDateModification())
                .missionId(ent.getMission() != null ? ent.getMission().getId() : null)
                .build();
    }

    /** DTO de création → ENTITÉ */
    public RapportIntervention toEntity(RapportInterventionCreateDto dto) {
        var mission = missionRepo.findById(dto.getMissionId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Mission introuvable, id=" + dto.getMissionId()));

        return RapportIntervention.builder()
                .dateIntervention(dto.getDateIntervention())
                .description(dto.getDescription())
                .contenu(dto.getContenu())
                .agentNom(dto.getAgentNom())
                .agentEmail(dto.getAgentEmail())
                .agentTelephone(dto.getAgentTelephone())
                .status(dto.getStatus() != null ? dto.getStatus() : RapportStatus.EN_COURS)
                .mission(mission)
                .build();
    }

    /** MAJ partielle d’une ENTITÉ existante à partir du DTO de création */
    public void updateEntityFromDto(RapportInterventionCreateDto dto, RapportIntervention ent) {
        if (dto.getDateIntervention() != null) {
            ent.setDateIntervention(dto.getDateIntervention());
        }
        if (dto.getDescription() != null) {
            ent.setDescription(dto.getDescription());
        }
        if (dto.getContenu() != null) {
            ent.setContenu(dto.getContenu());
        }
        if (dto.getAgentNom() != null) {
            ent.setAgentNom(dto.getAgentNom());
            ent.setAgentEmail(dto.getAgentEmail());
            ent.setAgentTelephone(dto.getAgentTelephone());
        }
        if (dto.getStatus() != null) {
            ent.setStatus(dto.getStatus());
        }
        if (dto.getMissionId() != null &&
                (ent.getMission() == null || !dto.getMissionId().equals(ent.getMission().getId()))) {
            var mission = missionRepo.findById(dto.getMissionId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Mission introuvable, id=" + dto.getMissionId()));
            ent.setMission(mission);
        }
    }
}
