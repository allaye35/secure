package com.boulevardsecurity.securitymanagementapp.dto;


import lombok.*;

import java.util.List;

/**
 * DTO pour créer ou patcher un Planning.
 * Ne contient pas les dates (gérées en JPA via @PrePersist/@PreUpdate).
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanningCreateDto {
    /** Liste des IDs de missions à rattacher (optionnel). */
    private List<Long> missionIds;
}

