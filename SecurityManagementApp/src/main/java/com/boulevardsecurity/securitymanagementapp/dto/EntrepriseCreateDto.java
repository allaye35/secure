// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/EntrepriseCreateDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EntrepriseCreateDto {

    @NotBlank
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
    @Email
    private String email;

    @NotBlank
    private String telephone;

    /* Relations (IDs optionnels à la création) */
    private List<Long> devisIds;
    private List<Long> contratsDeTravailIds;
}
