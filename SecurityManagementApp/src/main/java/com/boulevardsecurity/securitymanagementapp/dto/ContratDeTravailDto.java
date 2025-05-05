// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/ContratDeTravailDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.PeriodiciteSalaire;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeContrat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContratDeTravailDto {
    private Long id;
    private String referenceContrat;
    private TypeContrat typeContrat;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String description;
    private BigDecimal salaireDeBase;
    private PeriodiciteSalaire periodiciteSalaire;

    // relations (IDs uniquement)
    private Long agentDeSecuriteId;
    private Long entrepriseId;
    private Long missionId;

    private List<Long> ficheDePaieIds;
    private List<Long> clauseIds;

    // audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // le PDF peut être envoyé en base64 si besoin
    private byte[] documentPdf;
}
