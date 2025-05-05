package com.boulevardsecurity.securitymanagementapp.dto;


import com.boulevardsecurity.securitymanagementapp.Enums.TypeZone;
import lombok.*;

import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ZoneDeTravailCreateDto {
    private String nom;
    private TypeZone typeZone;

    private String codePostal;
    private String ville;
    private String departement;
    private String region;
    private String pays;

    /** IDs des agents à rattacher (optionnel) */
    private Set<Long> agentIds;
}
