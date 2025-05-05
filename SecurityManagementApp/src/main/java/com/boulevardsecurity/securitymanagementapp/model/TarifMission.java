package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tarifs_mission")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TarifMission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Type de mission (correspond à ton enum) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private TypeMission typeMission;

    /** Prix de base HT pour 1 agent / 1 heure */
    @Column(nullable = false)
    private BigDecimal prixUnitaireHT;

    /** Majoration en fraction (10% → 0.10), ou ZERO si inclus */
    @Column(nullable = false)
    private BigDecimal majorationNuit;

    @Column(nullable = false)
    private BigDecimal majorationWeekend;

    @Column(nullable = false)
    private BigDecimal majorationDimanche;

    @Column(nullable = false)
    private BigDecimal majorationFerie;

    @Column(nullable = false)
    private BigDecimal tauxTVA;
}
