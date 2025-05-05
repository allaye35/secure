// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/GestionnaireNotificationsMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.GestionnaireNotifications;
import com.boulevardsecurity.securitymanagementapp.model.AgentDeSecurite;
import com.boulevardsecurity.securitymanagementapp.model.Client;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import com.boulevardsecurity.securitymanagementapp.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GestionnaireNotificationsMapper {

    private final AgentDeSecuriteRepository agentRepo;
    private final ClientRepository clientRepo;

    public GestionnaireNotificationsDto toDto(GestionnaireNotifications n) {
        return GestionnaireNotificationsDto.builder()
                .id(n.getId())
                .titre(n.getTitre())
                .message(n.getMessage())
                .destinataire(n.getDestinataire())
                .typeNotification(n.getTypeNotification())
                .lu(n.isLu())
                .dateEnvoi(n.getDateEnvoi())
                .agentId(n.getAgentDeSecurite() != null ? n.getAgentDeSecurite().getId() : null)
                .clientId(n.getClient()            != null ? n.getClient().getId()            : null)
                .build();
    }

    public GestionnaireNotifications toEntity(GestionnaireNotificationsCreateDto dto) {
        GestionnaireNotifications n = GestionnaireNotifications.builder()
                .titre(dto.getTitre())
                .message(dto.getMessage())
                .destinataire(dto.getDestinataire())
                .typeNotification(dto.getTypeNotification())
                .build();

        if (dto.getAgentId() != null) {
            AgentDeSecurite a = agentRepo.findById(dto.getAgentId())
                    .orElseThrow(() -> new IllegalArgumentException("Agent introuvable id=" + dto.getAgentId()));
            n.setAgentDeSecurite(a);
        }
        if (dto.getClientId() != null) {
            Client c = clientRepo.findById(dto.getClientId())
                    .orElseThrow(() -> new IllegalArgumentException("Client introuvable id=" + dto.getClientId()));
            n.setClient(c);
        }
        return n;
    }

    public void updateEntity(GestionnaireNotificationsCreateDto dto, GestionnaireNotifications n) {
        if (dto.getTitre()            != null) n.setTitre(dto.getTitre());
        if (dto.getMessage()          != null) n.setMessage(dto.getMessage());
        if (dto.getDestinataire()     != null) n.setDestinataire(dto.getDestinataire());
        if (dto.getTypeNotification()!= null) n.setTypeNotification(dto.getTypeNotification());

        if (dto.getAgentId() != null &&
                (n.getAgentDeSecurite() == null || !dto.getAgentId().equals(n.getAgentDeSecurite().getId()))) {
            AgentDeSecurite a = agentRepo.findById(dto.getAgentId())
                    .orElseThrow(() -> new IllegalArgumentException("Agent introuvable id=" + dto.getAgentId()));
            n.setAgentDeSecurite(a);
        }
        if (dto.getClientId() != null &&
                (n.getClient() == null || !dto.getClientId().equals(n.getClient().getId()))) {
            Client c = clientRepo.findById(dto.getClientId())
                    .orElseThrow(() -> new IllegalArgumentException("Client introuvable id=" + dto.getClientId()));
            n.setClient(c);
        }
    }
}
