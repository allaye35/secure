package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutDevis;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DevisDto {

    /* ------- données de base ------- */
    private Long        id;
    private String      referenceDevis;
    private String      description;
    private StatutDevis statut;

    /* ------- dates ------- */
    private LocalDate   dateCreation;
    private LocalDate   dateValidite;

    /* ------- conditions générales ------- */
    private String      conditionsGenerales;

    /* ------- montants totaux calculés à partir des missions ------- */
    @Builder.Default
    private BigDecimal  montantTotalHT = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal  montantTotalTVA = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal  montantTotalTTC = BigDecimal.ZERO;
    @Builder.Default
    private Integer     nombreTotalAgents = 0;
    @Builder.Default
    private Integer     nombreTotalHeures = 0;    /* ------- relations (ID only) ------- */
    private Long        entrepriseId;
    private Long        clientId;
    private Long        contratId;
    
    /** Détails complets des missions associées (incluant toutes les informations) */
    @Builder.Default
    private List<MissionDto> missions = new ArrayList<>();
}
