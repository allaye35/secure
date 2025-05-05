package com.boulevardsecurity.securitymanagementapp.dto;



import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ArticleContratDto {

    private Long    id;
    private Integer numero;
    private String  titre;
    private String  contenu;

    /* relation (id uniquement) */
    private Long    contratId;
}

