/* ---------- entity ---------- */

package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.PeriodiciteSalaire;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeContrat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contrats_de_travail")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContratDeTravail {

    /* ---------- clé ---------- */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ---------- informations générales ---------- */
    @Column(nullable = false, unique = true, length = 60)
    @NotBlank
    private String referenceContrat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TypeContrat typeContrat;

    @PastOrPresent
    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column
    private LocalDate dateFin;

    @Size(max = 2_000)
    private String description;

    /* ---------- rémunération ---------- */
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salaireDeBase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PeriodiciteSalaire periodiciteSalaire;

    /* ---------- relations ---------- */
    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private AgentDeSecurite agentDeSecurite;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    /** Facultatif : pour un CDD / intérim rattaché à UNE mission précise */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id")
    private Mission mission;

    /** Bulletins de paie émis dans le cadre de ce contrat */
    @OneToMany(mappedBy = "contratDeTravail",
            cascade = CascadeType.ALL)
    @Builder.Default
    private List<FicheDePaie> fichesDePaie = new ArrayList<>();

    /** Fichier PDF du contrat signé (optionnel) */
    @Lob
    private byte[] documentPdf;

    /* ---------- audit ---------- */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy="contratDeTravail", cascade=CascadeType.ALL)
    @Builder.Default
    private List<ArticleContratTravail> clauses = new ArrayList<>();



    @PrePersist
    private void prePersist() {
        createdAt = updatedAt = LocalDateTime.now();
        if (dateDebut == null) dateDebut = LocalDate.now();
    }
    @PreUpdate
    private void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
