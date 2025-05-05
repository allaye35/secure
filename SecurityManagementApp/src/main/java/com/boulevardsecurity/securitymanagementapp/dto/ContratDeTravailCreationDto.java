package com.boulevardsecurity.securitymanagementapp.dto;


import com.boulevardsecurity.securitymanagementapp.Enums.PeriodiciteSalaire;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeContrat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContratDeTravailCreationDto {
    @NotBlank
    private String referenceContrat;

    @NotNull
    private TypeContrat typeContrat;

    @NotNull
    private LocalDate dateDebut;

    private LocalDate dateFin;
    private String description;

    @NotNull
    private BigDecimal salaireDeBase;

    @NotNull
    private PeriodiciteSalaire periodiciteSalaire;

    @NotNull
    private Long agentDeSecuriteId;

    @NotNull
    private Long entrepriseId;

    private Long missionId;                // facultatif
    private byte[] documentPdf;            // facultatif
}
