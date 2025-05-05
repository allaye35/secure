package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutFacture;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Représente la facture générée pour un client, à partir d'un devis.
 */
@Entity
@Table(name = "factures")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String referenceFacture;

    @Column(nullable = false)
    private LocalDate dateEmission;

    @Enumerated(EnumType.STRING)
    private StatutFacture statut; // EN_ATTENTE, PAYÉE, EN_RETARD, etc.

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantHT;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTVA;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTTC;

    // === Liaisons ===

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "devis_id")
    private Devis devis;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id")
    private Contrat contrat;

    // Si tu veux rattacher plusieurs missions facturées
    @ManyToMany
    @JoinTable(
            name = "facture_missions",
            joinColumns = @JoinColumn(name = "facture_id"),
            inverseJoinColumns = @JoinColumn(name = "mission_id")
    )
    @Builder.Default
    private List<Mission> missions = new ArrayList<>();


}
