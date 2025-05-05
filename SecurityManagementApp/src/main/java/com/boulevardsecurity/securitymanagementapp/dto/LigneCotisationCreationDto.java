// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/LigneCotisationCreationDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneCotisationCreationDto {
    @NotNull
    private String libelle;
    @NotNull
    private Double tauxSalarial;
    @NotNull
    private Double montantSalarial;
    @NotNull
    private Double tauxEmployeur;
    @NotNull
    private Double montantEmployeur;
    @NotNull
    private Long   ficheDePaieId;
}
