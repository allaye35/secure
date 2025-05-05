package com.boulevardsecurity.securitymanagementapp.dto;


import com.boulevardsecurity.securitymanagementapp.Enums.TypeCarteProfessionnelle;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Date;

/**
 * DTO pour la création d'une CarteProfessionnelle.
 * Le champ `id` est absent (géré par JPA) et seul l'agentId relie l'agent.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CarteProfessionnelleCreationDto {

    @NotNull
    private TypeCarteProfessionnelle typeCarte;

    @NotNull @NonNull
    private String numeroCarte;

    @NotNull
    private Date dateDebut;

    @NotNull
    private Date dateFin;

    @NotNull
    private Long agentId;
}
