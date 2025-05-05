package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TarifMissionCreateDto {
    /** Type de mission (exige un enum non-null) */
    @NotNull
    private TypeMission typeMission;

    /** Prix unitaire HT (doit être strictement positif) */
    @NotNull @Positive
    private BigDecimal prixUnitaireHT;

    /** Majoration de nuit (0.00 si aucune) */
    @NotNull
    private BigDecimal majorationNuit;

    /** Majoration week-end */
    @NotNull
    private BigDecimal majorationWeekend;

    /** Majoration dimanche */
    @NotNull
    private BigDecimal majorationDimanche;

    /** Majoration jour férié */
    @NotNull
    private BigDecimal majorationFerie;

    /** Taux TVA (entre 0 et 1) */
    @NotNull
    private BigDecimal tauxTVA;
}
