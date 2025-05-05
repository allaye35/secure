package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.DisponibiliteCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.DisponibiliteDto;
import com.boulevardsecurity.securitymanagementapp.model.Disponibilite;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

// DisponibiliteMapper.java
@Component
@RequiredArgsConstructor
public class DisponibiliteMapper {

    private final AgentDeSecuriteRepository agentRepo;

    public DisponibiliteDto toDto(Disponibilite d) {
        return DisponibiliteDto.builder()
                .id(d.getId())
                .dateDebut(d.getDateDebut())
                .dateFin(d.getDateFin())
                .agentId(d.getAgentDeSecurite() != null ? d.getAgentDeSecurite().getId() : null)
                .build();
    }

    public Disponibilite toEntity(DisponibiliteCreationDto dto) {
        return Disponibilite.builder()
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .agentDeSecurite(
                        agentRepo.findById(dto.getAgentId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                        "Agent introuvable id=" + dto.getAgentId())))
                .build();
    }

    public void updateEntityFromCreationDto(DisponibiliteCreationDto dto, Disponibilite entity) {
        if (dto.getDateDebut() != null) entity.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin()   != null) entity.setDateFin(dto.getDateFin());

        if (dto.getAgentId() != null &&
                (entity.getAgentDeSecurite() == null ||
                        !dto.getAgentId().equals(entity.getAgentDeSecurite().getId()))) {

            entity.setAgentDeSecurite(
                    agentRepo.findById(dto.getAgentId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Agent introuvable id=" + dto.getAgentId())));
        }
    }
}
