package com.boulevardsecurity.securitymanagementapp.model;
import com.boulevardsecurity.securitymanagementapp.Enums.StatutMission;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "missions")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;    @Column(nullable = true)
    private String titre;

    @Column(nullable = true)
    private String description;

    @Column(nullable = true)
    private LocalDate dateDebut;

    @Column(nullable = true)
    private LocalDate dateFin;

    @Column(nullable = true)
    private LocalTime heureDebut;

    @Column(nullable = true)
    private LocalTime heureFin;
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_mission", nullable = true)
    private StatutMission statutMission;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "mission_agents",
            joinColumns = @JoinColumn(name = "mission_id"),
            inverseJoinColumns = @JoinColumn(name = "agent_id")
    )
    @Builder.Default
    private Set<AgentDeSecurite> agents = new HashSet<>();


    // Relation avec Planning (Une mission appartient à un seul planning)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "planning_id", nullable = true)
    private Planning planning;

    // Mission.java
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "site_id", nullable = true)
    private Site site;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "geolocalisation_id", nullable = true)
    private GeolocalisationGPS geolocalisationGPS;

    // Relation avec RapportIntervention (une mission peut avoir plusieurs rapports)
    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL)
//    @JsonManagedReference      //
//    @JsonIgnoreProperties("mission")
//    @JsonIgnore
    @Builder.Default
    private List<RapportIntervention> rapports = new ArrayList<>();
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private TypeMission typeMission;

    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Pointage> pointages = new ArrayList<>();  //


    // ----------------------------------------------
    // RELATION AVEC Contrat (pour la copie éventuelle)
    // ----------------------------------------------
    @ManyToOne
    @JoinColumn(name = "contrat_id", nullable = true)
    private Contrat contrat;

    @Column(nullable = true)
    private Integer nombreAgents;

    @Column(nullable = true)
    private Integer quantite;    // --- tarif et chiffrage calculé ---
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "tarif_mission_id", nullable = true)
    private TarifMission tarif;

    @Column(nullable = true)
    private BigDecimal montantHT;
    
    @Column(nullable = true)
    private BigDecimal montantTVA;
    
    @Column(nullable = true)
    private BigDecimal montantTTC;

    // --- lien vers le devis parent ---
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "devis_id")
    private Devis devis;

    @ManyToMany(fetch = FetchType.EAGER, mappedBy = "missions")
    @Builder.Default
    private List<Facture> factures = new ArrayList<>();

    @OneToMany(mappedBy = "mission", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ContratDeTravail> contratsDeTravail = new ArrayList<>();


}