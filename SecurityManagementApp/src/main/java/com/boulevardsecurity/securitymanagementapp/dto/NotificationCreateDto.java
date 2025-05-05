package com.boulevardsecurity.securitymanagementapp.dto;


import lombok.*;

/** DTO utilisé pour la création (POST) ou la mise-à-jour partielle (PATCH) */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationCreateDto {
    private String titre;
    private String message;
    private String destinataire;
    // Pas de dateEnvoi : elle est remplie automatiquement au @PrePersist
}
