// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/EntrepriseCreateDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EntrepriseCreateDto {

    @NotBlank
    private String nom;

    private String siretPrestataire;
    private String representantPrestataire;

    private String numeroRue;
    private String rue;
    private String codePostal;
    private String ville;
    private String pays;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String telephone;
}
