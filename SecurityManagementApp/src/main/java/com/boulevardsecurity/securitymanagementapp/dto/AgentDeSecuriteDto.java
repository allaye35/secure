// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/AgentDeSecuriteDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import com.boulevardsecurity.securitymanagementapp.Enums.Role;
import com.boulevardsecurity.securitymanagementapp.Enums.StatutAgent;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * DTO « plat » pour lecture / update : on n’exporte pas le mot de passe.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AgentDeSecuriteDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private LocalDate dateNaissance;
    private StatutAgent statut;
    private Role role;

    /* Identifiants des relations */
    private Set<Long> zonesDeTravailIds;
    private Set<Long> missionsIds;
    private List<Long> disponibilitesIds;
    private List<Long> cartesProfessionnellesIds;
    private List<Long> diplomesSSIAPIds;
    private List<Long> contratsDeTravailIds;
    private List<Long> notificationsIds;
}
