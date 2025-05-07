// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/FactureCreateDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutFacture;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactureCreateDto {
    private String          referenceFacture;
    private LocalDate       dateEmission;
    private StatutFacture   statut;

    private BigDecimal      montantHT;
    private BigDecimal      montantTVA;
    private BigDecimal      montantTTC;

    /* IDs des entités liées */
    private Long            devisId;
    private Long            entrepriseId;
    private Long            clientId;
    private List<Long>      missionIds;    // facultatif
}
