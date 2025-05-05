// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/DiplomeSsiapMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.DiplomeSSIAP;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DiplomeSsiapMapper {

    private final AgentDeSecuriteRepository agentRepo;

    /** ENTITÉ → DTO */
    public DiplomeSsiapDto toDto(DiplomeSSIAP d) {
        return DiplomeSsiapDto.builder()
                .id(d.getId())
                .niveau(d.getNiveau())
                .dateObtention(d.getDateObtention())
                .dateExpiration(d.getDateExpiration())
                .agentId(d.getAgentDeSecurite() != null
                        ? d.getAgentDeSecurite().getId()
                        : null)
                .build();
    }

    /** DTO de création → ENTITÉ */
    public DiplomeSSIAP toEntity(DiplomeSsiapCreationDto dto) {
        DiplomeSSIAP ent = DiplomeSSIAP.builder()
                .niveau(dto.getNiveau())
                .dateObtention(dto.getDateObtention())
                .dateExpiration(dto.getDateExpiration())
                .build();

        // affectation de l'agent
        ent.setAgentDeSecurite(
                agentRepo.findById(dto.getAgentId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Agent inexistant id=" + dto.getAgentId()))
        );
        return ent;
    }

    /** Mise à jour partielle d’une ENTITÉ existante à partir d’un DTO */
    public void updateEntityFromDto(DiplomeSsiapDto dto, DiplomeSSIAP ent) {
        if (dto.getNiveau() != null) {
            ent.setNiveau(dto.getNiveau());
        }
        if (dto.getDateObtention() != null) {
            ent.setDateObtention(dto.getDateObtention());
        }
        if (dto.getDateExpiration() != null) {
            ent.setDateExpiration(dto.getDateExpiration());
        }
        if (dto.getAgentId() != null
                && (ent.getAgentDeSecurite() == null
                || !dto.getAgentId().equals(ent.getAgentDeSecurite().getId()))) {

            ent.setAgentDeSecurite(
                    agentRepo.findById(dto.getAgentId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Agent inexistant id=" + dto.getAgentId()))
            );
        }
    }
}
