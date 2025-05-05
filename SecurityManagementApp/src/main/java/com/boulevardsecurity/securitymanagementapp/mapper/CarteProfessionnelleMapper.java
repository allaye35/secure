// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/CarteProfessionnelleMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.CarteProfessionnelleCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.CarteProfessionnelleDto;
import com.boulevardsecurity.securitymanagementapp.model.CarteProfessionnelle;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CarteProfessionnelleMapper {

    private final AgentDeSecuriteRepository agentRepo;

    /** === ENTITÉ → DTO de lecture / update === */
    public CarteProfessionnelleDto toDto(CarteProfessionnelle c) {
        return CarteProfessionnelleDto.builder()
                .id(c.getId())
                .typeCarte(c.getTypeCarte())
                .numeroCarte(c.getNumeroCarte())
                .dateDebut(c.getDateDebut())
                .dateFin(c.getDateFin())
                .agentId(c.getAgentDeSecurite() != null
                        ? c.getAgentDeSecurite().getId()
                        : null)
                .build();
    }

    /** === DTO de création ➜ ENTITÉ === */
    public CarteProfessionnelle toEntity(CarteProfessionnelleCreationDto dto) {
        CarteProfessionnelle entity = CarteProfessionnelle.builder()
                .typeCarte(dto.getTypeCarte())
                .numeroCarte(dto.getNumeroCarte())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .build();

        // Association à l’agent
        agentRepo.findById(dto.getAgentId())
                .ifPresentOrElse(
                        entity::setAgentDeSecurite,
                        () -> { throw new IllegalArgumentException(
                                "Agent inexistant id=" + dto.getAgentId());
                        }
                );

        return entity;
    }

    /** === DTO de mise à jour ➜ ENTITÉ === */
    public void updateEntityFromDto(CarteProfessionnelleDto dto, CarteProfessionnelle entity) {
        entity.setTypeCarte(dto.getTypeCarte());
        entity.setNumeroCarte(dto.getNumeroCarte());
        entity.setDateDebut(dto.getDateDebut());
        entity.setDateFin(dto.getDateFin());

        if (dto.getAgentId() != null) {
            agentRepo.findById(dto.getAgentId())
                    .ifPresentOrElse(
                            entity::setAgentDeSecurite,
                            () -> { throw new IllegalArgumentException(
                                    "Agent inexistant id=" + dto.getAgentId());
                            }
                    );
        }
    }
}
