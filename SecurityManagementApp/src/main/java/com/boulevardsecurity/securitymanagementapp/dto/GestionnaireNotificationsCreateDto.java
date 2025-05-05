// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/GestionnaireNotificationsCreateDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeNotification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GestionnaireNotificationsCreateDto {
    @NotBlank
    private String titre;

    @NotBlank
    private String message;

    @NotBlank
    private String destinataire;

    @NotNull
    private TypeNotification typeNotification;

    private Long agentId;
    private Long clientId;
}
