// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/GestionnaireNotificationsDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeNotification;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GestionnaireNotificationsDto {
    private Long id;
    private String titre;
    private String message;
    private String destinataire;
    private TypeNotification typeNotification;
    private boolean lu;
    private LocalDateTime dateEnvoi;
    private Long agentId;
    private Long clientId;
}
