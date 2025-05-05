// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/ClientDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.ModeContactPrefere;
import com.boulevardsecurity.securitymanagementapp.Enums.Role;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeClient;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClientDto {

    private Long id;
    private Role role;                // CLIENT / ADMIN / etc.
    private TypeClient typeClient;    // PARTICULIER ou ENTREPRISE

    /* — Infos personne / société — */
    private String nom;
    private String prenom;
    private String siege;
    private String representant;
    private String numeroSiret;

    /* — Coordonnées — */
    private String email;
    private String telephone;
    private String adresse;
    private String numeroRue;
    private String codePostal;
    private String ville;
    private String pays;
    private ModeContactPrefere modeContactPrefere;

    /* — relations exposées sous forme d’ID — */
    private List<Long> devisIds;
    private List<Long> notificationIds;
}
