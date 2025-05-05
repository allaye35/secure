package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TarifMissionDto {

    /* ----- clés & métadonnées ----- */
    private Long        id;
    private TypeMission typeMission;

    /* ----- valeurs monétaires ----- */
    private BigDecimal  prixUnitaireHT;
    private BigDecimal  majorationNuit;
    private BigDecimal  majorationWeekend;
    private BigDecimal  majorationDimanche;
    private BigDecimal  majorationFerie;
    private BigDecimal  tauxTVA;

    /* ----- relation inverse (facultatif) ----- */
    /** IDs des missions rattachées (readonly) */
    private List<Long>  missionIds;
}
