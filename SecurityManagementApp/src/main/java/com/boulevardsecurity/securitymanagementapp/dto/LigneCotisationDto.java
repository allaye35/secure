// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/LigneCotisationDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneCotisationDto {
    private Long   id;
    private String libelle;
    private Double tauxSalarial;
    private Double montantSalarial;
    private Double tauxEmployeur;
    private Double montantEmployeur;
    private Long   ficheDePaieId;
}
