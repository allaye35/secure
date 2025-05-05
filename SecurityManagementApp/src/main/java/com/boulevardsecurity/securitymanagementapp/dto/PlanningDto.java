package com.boulevardsecurity.securitymanagementapp.dto;


import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanningDto {
    private Long id;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    /** On n’embarque que les IDs des missions liées */
    private List<Long> missionIds;
}
