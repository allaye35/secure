package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.ZoneDeTravail;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ZoneDeTravailMapper {

    private final AgentDeSecuriteMapper agentMapper;
    private final AgentDeSecuriteRepository agentRepo;

    /** ENTITÉ → DTO */
    public ZoneDeTravailDto toDto(ZoneDeTravail entity) {
        return ZoneDeTravailDto.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .typeZone(entity.getTypeZone())
                .codePostal(entity.getCodePostal())
                .ville(entity.getVille())
                .departement(entity.getDepartement())
                .region(entity.getRegion())
                .pays(entity.getPays())
                .agents(
                        entity.getAgents().stream()
                                .map(agentMapper::toDto)
                                .collect(Collectors.toList())
                )
                .build();
    }

    /** DTO de création → ENTITÉ */
    public ZoneDeTravail toEntity(ZoneDeTravailCreateDto dto) {
        ZoneDeTravail z = ZoneDeTravail.builder()
                .nom(dto.getNom())
                .typeZone(dto.getTypeZone())
                .codePostal(dto.getCodePostal())
                .ville(dto.getVille())
                .departement(dto.getDepartement())
                .region(dto.getRegion())
                .pays(dto.getPays())
                .build();

        if (dto.getAgentIds() != null) {
            z.setAgents(
                    dto.getAgentIds().stream()
                            .map(id -> agentRepo.findById(id)
                                    .orElseThrow(() ->
                                            new IllegalArgumentException("Agent introuvable id=" + id)))
                            .collect(Collectors.toSet())
            );
        }
        return z;
    }

    /** DTO lecture/mise à jour partielle → ENTITÉ */
    public void updateEntity(ZoneDeTravailCreateDto dto, ZoneDeTravail entity) {
        if (dto.getNom() != null)          entity.setNom(dto.getNom());
        if (dto.getTypeZone() != null)     entity.setTypeZone(dto.getTypeZone());
        if (dto.getCodePostal() != null)   entity.setCodePostal(dto.getCodePostal());
        if (dto.getVille() != null)        entity.setVille(dto.getVille());
        if (dto.getDepartement() != null)  entity.setDepartement(dto.getDepartement());
        if (dto.getRegion() != null)       entity.setRegion(dto.getRegion());
        if (dto.getPays() != null)         entity.setPays(dto.getPays());

        if (dto.getAgentIds() != null) {
            entity.setAgents(
                    dto.getAgentIds().stream()
                            .map(id -> agentRepo.findById(id)
                                    .orElseThrow(() ->
                                            new IllegalArgumentException("Agent introuvable id=" + id)))
                            .collect(Collectors.toSet())
            );
        }
    }
}
