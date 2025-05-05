package com.boulevardsecurity.securitymanagementapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fiches_de_paie")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FicheDePaie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;  // Exemple : "PAIE-2025-001"

    // Période de paie (ex : 01/05/2025 - 31/05/2025)
    @Column(nullable = false)
    private LocalDate periodeDebut;

    @Column(nullable = false)
    private LocalDate periodeFin;

    // Salaire de base et heures
    private Double salaireDeBase;  // Montant brut du salaire de base
    private Double heuresTravaillées;  // Exemple : 151,67h

    // Primes et heures supplémentaires
    private Double primeNuit;            // Majoration nuit
    private Double heuresSupplementaires;
    private Double primeDiverses;        // Autres primes éventuelles

    // Cotisations
    private Double totalCotisationsSalariales;
    private Double totalCotisationsEmployeur;

    // Totaux finaux
    private Double totalBrut;
    private Double netImposable;
    private Double netAPayer;

    // Relations
    @ManyToOne(optional = false)
    @JoinColumn(name = "agent_id")
    private AgentDeSecurite agentDeSecurite;


    // Document PDF (bulletin de paie stocké sous forme de fichier binaire)
    @Lob
    private byte[] documentPdf;

    // Cotisations détaillées par ligne (optionnel mais recommandé si tu veux détailler chaque cotisation)
    @OneToMany(mappedBy = "ficheDePaie", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LigneCotisation> lignesCotisation = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_de_travail_id")
    private ContratDeTravail contratDeTravail;

}
