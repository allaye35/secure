// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/FicheDePaieCreationDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FicheDePaieCreationDto {
    private String reference;
    private LocalDate periodeDebut;
    private LocalDate periodeFin;
    private Double salaireDeBase;
    private Double heuresTravaillees;
    private Double primeNuit;
    private Double heuresSupplementaires;
    private Double primeDiverses;
    private Double totalCotisationsSalariales;
    private Double totalCotisationsEmployeur;
    private Double totalBrut;
    private Double netImposable;
    private Double netAPayer;
    private Long agentId;
    private Long contratDeTravailId;
}
