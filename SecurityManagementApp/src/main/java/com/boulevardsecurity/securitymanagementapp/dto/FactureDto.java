// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/FactureDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutFacture;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactureDto {
    private Long            id;
    private String          referenceFacture;
    private LocalDate       dateEmission;
    private StatutFacture   statut;

    private BigDecimal      montantHT;
    private BigDecimal      montantTVA;
    private BigDecimal      montantTTC;

    /* Relations (IDs only) */
    private Long            devisId;
    private Long            entrepriseId;
    private Long            clientId;
    private Long            contratId;     // peut être null
    private List<Long>      missionIds;    // 0..n
}
