package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutDevis;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

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

    /* ------- relations (ID only) ------- */
    private Long        entrepriseId;   // prestataire
    private Long        clientId;       // bénéficiaire
    private Long        contratId;      // s’il existe déjà
    private List<Long>  missionIds;     // missions rattachées

    /* ------- totaux agrégés ------- */
    private BigDecimal montantHT;
    private BigDecimal montantTVA;
    private BigDecimal montantTTC;
}
