package com.boulevardsecurity.securitymanagementapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "article_contrat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleContrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ordre de l’article dans le contrat (1, 2, 3…) */
    @Column(nullable = false)
    private Integer numero;

    /** Titre court de l’article (ex : “Article 1 – Objet”) */
    @Column(nullable = false, length = 100)
    private String titre;

    /** Contenu complet de l’article */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    /** Lien vers le contrat parent */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id")
    private Contrat contrat;
}

