package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.RapportStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO pour création / mise à jour partielle d’un rapport d’intervention.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RapportInterventionCreateDto {

    /** Date et heure de l’intervention */
    private LocalDateTime dateIntervention;

    /** Courte description */
    private String description;

    /** Contenu détaillé du rapport */
    private String contenu;

    /** Nom de l’agent ayant rédigé */
    private String agentNom;
    private String agentEmail;
    private String agentTelephone;

    /** Statut optionnel (par défaut EN_COURS) */
    private RapportStatus status;

    /** Mission associée (obligatoire) */
    private Long missionId;
}
