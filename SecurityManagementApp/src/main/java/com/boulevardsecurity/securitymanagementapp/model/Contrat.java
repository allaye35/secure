package com.boulevardsecurity.securitymanagementapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contrats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Référence unique du contrat (ex: CONTRAT-2025-001) */
    @Column(unique = true, nullable = false)
    private String referenceContrat;

    /** Date de signature effective */
    private LocalDate dateSignature;

    // ==== Lien vers le devis accepté ====
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devis_id")
    private Devis devis;

    // ==== Missions réellement affectées à ce contrat ====
    @OneToMany(mappedBy = "contrat", cascade   = { CascadeType.PERSIST, CascadeType.MERGE })
    @Builder.Default
    private List<Mission> missions = new ArrayList<>();

    // ==== Articles juridiques du contrat ====
    @OneToMany(mappedBy = "contrat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ArticleContrat> articles = new ArrayList<>();

    // ==== Informations sur la durée du contrat ====
    @Column(nullable = true)
    private Integer dureeMois;

    @Column(nullable = true)
    private Boolean taciteReconduction;

    @Column(nullable = true)
    private Integer preavisMois;

    // ==== Fichier PDF signé du contrat (en base64/byte[]) ====
    @Lob
    @Column(name = "document_pdf")
    private byte[] documentPdf;
}
