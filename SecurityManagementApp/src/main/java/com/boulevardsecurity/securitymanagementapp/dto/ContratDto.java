// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/ContratDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContratDto {
    private Long id;

    /** Référence et date */
    private String referenceContrat;
    private LocalDate dateSignature;

    /** Durée & conditions */
    private Integer dureeMois;
    private Boolean taciteReconduction;
    private Integer preavisMois;

    private Long devisId;
    private List<Long> missionIds;
    private List<Long> articleIds;
}
