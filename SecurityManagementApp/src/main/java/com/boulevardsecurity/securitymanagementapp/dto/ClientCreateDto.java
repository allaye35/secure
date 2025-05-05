// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/ClientCreateDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.ModeContactPrefere;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeClient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClientCreateDto {

    /* -------- authentification -------- */
    @NotBlank
    private String password;

    /* -------- typologie -------- */
    private TypeClient typeClient;         // PARTICULIER / ENTREPRISE

    /* -------- infos personne / société -------- */
    private String nom;
    private String prenom;
    private String siege;
    private String representant;
    private String numeroSiret;

    /* -------- coordonnées -------- */
    @Email
    private String email;
    private String telephone;
    private String adresse;
    private String numeroRue;
    private String codePostal;
    private String ville;
    private String pays;
    private ModeContactPrefere modeContactPrefere;

    /* -------- relations (ID) -------- */
    private List<Long> devisIds;
    private List<Long> notificationIds;
}
