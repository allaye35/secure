package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutDevis;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DevisCreateDto {

    @NotBlank
    private String referenceDevis;

    @Size(max = 2000)
    private String description;

    @NotNull
    private StatutDevis statut;

    @NotNull
    private Long entrepriseId;

    @NotNull
    private Long clientId;

    @NotNull
    @FutureOrPresent
    private LocalDate dateValidite;

    private String conditionsGenerales;
}
