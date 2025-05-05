// dto/zone/ZoneDeTravailDto.java
package com.boulevardsecurity.securitymanagementapp.dto;


import com.boulevardsecurity.securitymanagementapp.Enums.TypeZone;
import com.boulevardsecurity.securitymanagementapp.dto.AgentDeSecuriteDto;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ZoneDeTravailDto {
    private Long id;
    private String nom;
    private TypeZone typeZone;

    private String codePostal;
    private String ville;
    private String departement;
    private String region;
    private String pays;

    /** --- Liste des agents affectés à cette zone --- */
    private List<AgentDeSecuriteDto> agents;
}
