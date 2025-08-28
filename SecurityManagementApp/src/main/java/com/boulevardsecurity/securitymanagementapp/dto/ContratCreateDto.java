// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/ContratCreateDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContratCreateDto {
    /** Référence unique du contrat (ex : “CONTRAT-2025-001”) */
    private String referenceContrat;
    /** Date de signature effective */
    private LocalDate dateSignature;
    /** Durée du contrat en mois */
    private Integer dureeMois;
    /** Tacite reconduction (true = reconduction automatique) */
    private Boolean taciteReconduction;
    /** Préavis (en mois) en cas de non reconduction */
    private Integer preavisMois;    /** ID du devis associé (optionnel) */
    private Long devisId;
    /** Missions liées au contrat (optionnel) */
    private List<Long> missionIds;
    /** Articles juridiques liés au contrat (optionnel) */
    private List<Long> articleIds;
}
