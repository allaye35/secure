package com.boulevardsecurity.securitymanagementapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lignes_cotisation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneCotisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String libelle;                // Exemple : "Retraite complémentaire"
    private Double tauxSalarial;
    private Double montantSalarial;
    private Double tauxEmployeur;
    private Double montantEmployeur;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fiche_de_paie_id")
    private FicheDePaie ficheDePaie;
}
