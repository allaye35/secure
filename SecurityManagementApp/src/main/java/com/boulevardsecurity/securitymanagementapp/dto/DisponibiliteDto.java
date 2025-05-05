// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/DisponibiliteDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DisponibiliteDto {
    private Long id;
    private Date dateDebut;
    private Date dateFin;
    private Long agentId;        // relation vers l’agent
}
