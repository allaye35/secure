package com.boulevardsecurity.securitymanagementapp.dto;



import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ArticleContratCreateDto {

    private Integer numero;
    private String  titre;
    private String  contenu;

    /** Contrat auquel rattacher l’article */
    private Long    contratId;
}
