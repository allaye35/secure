package com.boulevardsecurity.securitymanagementapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleContratTravail {
    @Id
    @GeneratedValue
    Long id;
    private String libelle;
    @Lob
    private String contenu;
    @ManyToOne
    @JoinColumn(name="contrat_travail_id")
    private ContratDeTravail contratDeTravail;
}
