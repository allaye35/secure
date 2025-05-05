package com.boulevardsecurity.securitymanagementapp.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteDto {

    private Long   id;
    private String nom;
    private String numero;
    private String rue;
    private String codePostal;
    private String ville;
    private String departement;
    private String region;
    private String pays;

    /** Liste simplifiée des missions (id) rattachées à ce site */
    private List<Long> missionsIds;
}

