// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/MissionCreateDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutMission;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MissionCreateDto {
    /* ───── ID uniquement utilisé pour la mise à jour (null pour création) ───── */
    private Long id;
    
    /* ───── données métier ───── */
    private String         titre;
    private String         description;
    private LocalDate      dateDebut;
    private LocalDate      dateFin;
    private LocalTime      heureDebut;
    private LocalTime      heureFin;
    private StatutMission  statutMission;
    private TypeMission    typeMission;

    /* ───── chiffrage ───── */
    private Integer        nombreAgents;
    private Integer        quantite;
    private BigDecimal     montantHT;
    private BigDecimal     montantTVA;
    private BigDecimal     montantTTC;

    /* ───── relations (ID only) ───── */
    private Set<Long>      agentIds;
    private Long           planningId;
    private Long           siteId;
    private Long           geolocalisationGpsId;
    private Long           contratId;
    private Long           tarifMissionId;
    private Long           devisId;
    private List<Long>     rapportIds;
    private List<Long>     pointageIds;
    private List<Long>     contratTravailIds;
    private List<Long>     factureIds;
}
