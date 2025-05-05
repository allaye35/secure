// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/DisponibiliteCreationDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DisponibiliteCreationDto {
    @NotNull
    private Date dateDebut;
    @NotNull
    private Date dateFin;
    @NotNull
    private Long agentId;
}
