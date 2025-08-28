package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutDevis;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Entity
@Table(name = "devis")
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Devis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Référence unique du devis (ex: DEV-2025-001) */
    @Column(unique = true, length = 50)
    private String referenceDevis;

    /** Description libre */
    @Column(length = 2000)
    private String description;

    /** Statut du devis */
    @Enumerated(EnumType.STRING)
    private StatutDevis statut;

    /** Entreprise prestataire */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    /** Client bénéficiaire */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id")
    private Client client;

    /** Dates */
    @Column(nullable = false)
    private LocalDate dateCreation;

    @Column(nullable = false)
    private LocalDate dateValidite;

    /** Conditions générales */
    @Column(columnDefinition = "TEXT")
    private String conditionsGenerales;

    /** Contrat associé (le cas échéant) */
    @OneToOne(mappedBy = "devis",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private Contrat contrat;

    /** Missions liées à ce devis */
    @OneToMany(
            mappedBy = "devis",
            cascade = CascadeType.ALL
    )
    @Builder.Default
    private List<Mission> missions = new ArrayList<>();

    /** Totaux agrégés (calculés à partir des missions) */
    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal montantHT = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal montantTVA = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal montantTTC = BigDecimal.ZERO;

    /** Recalcule les totaux à partir des missions liées */
    public void recalculerTotaux() {
        this.montantHT = missions.stream()
                .map(m -> m.getMontantHT() == null ? BigDecimal.ZERO : m.getMontantHT())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.montantTVA = missions.stream()
                .map(m -> m.getMontantTVA() == null ? BigDecimal.ZERO : m.getMontantTVA())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.montantTTC = missions.stream()
                .map(m -> m.getMontantTTC() == null ? BigDecimal.ZERO : m.getMontantTTC())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
