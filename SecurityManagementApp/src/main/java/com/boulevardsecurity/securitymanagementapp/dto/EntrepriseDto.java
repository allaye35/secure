// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/EntrepriseDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EntrepriseDto {

    private Long   id;
    private String nom;

    /* Infos légales */
    private String siretPrestataire;
    private String representantPrestataire;

    /* Adresse */
    private String numeroRue;
    private String rue;
    private String codePostal;
    private String ville;
    private String pays;

    /* Contact */
    private String telephone;
    private String email;

    /* Relations (IDs seulement) */
    private List<Long> devisIds;
    private List<Long> contratsDeTravailIds;
}
