// src/main/java/com/boulevardsecurity/securitymanagementapp/dto/ArticleContratTravailCreationDto.java
package com.boulevardsecurity.securitymanagementapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO utilisé uniquement à la création d’un ArticleContratTravail.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ArticleContratTravailCreationDto {
    @NotBlank
    private String libelle;

    @NotBlank
    private String contenu;

    private Long contratDeTravailId;
}
