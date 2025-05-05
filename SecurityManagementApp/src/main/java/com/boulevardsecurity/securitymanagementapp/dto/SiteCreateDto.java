package com.boulevardsecurity.securitymanagementapp.dto;


import lombok.*;

import java.util.List;

/**
 *  DTO utilisé pour la création / mise-à-jour partielle.
 *  L’id n’est pas envoyé, mais on peut passer la liste des missions à rattacher.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteCreateDto {

    private String nom;
    private String numero;
    private String rue;
    private String codePostal;
    private String ville;
    private String departement;
    private String region;
    private String pays;

    private List<Long> missionsIds;   // facultatif
}

