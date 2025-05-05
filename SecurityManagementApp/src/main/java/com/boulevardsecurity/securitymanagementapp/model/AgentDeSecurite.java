package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.Role;
import com.boulevardsecurity.securitymanagementapp.Enums.StatutAgent;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "agents_de_securite")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"missions", "disponibilites"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AgentDeSecurite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;


    @Column(nullable = true, unique = true)
    private String telephone;

    private String adresse;

    private LocalDate dateNaissance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private StatutAgent statut; // EN_SERVICE, EN_CONGE, ABSENT

    @ManyToMany
    @JoinTable(
            name = "agents_zones",
            joinColumns = @JoinColumn(name = "agent_id"),
            inverseJoinColumns = @JoinColumn(name = "zone_id")
    )
    @Builder.Default
    private Set<ZoneDeTravail> zonesDeTravail = new HashSet<>();

    @ManyToMany(mappedBy = "agents")
    @Builder.Default
    private Set<Mission> missions = new HashSet<>();

    @OneToMany(mappedBy = "agentDeSecurite", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Disponibilite> disponibilites = new ArrayList<>();

    @OneToMany(mappedBy = "agentDeSecurite", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CarteProfessionnelle> cartesProfessionnelles = new ArrayList<>();

    @OneToMany(mappedBy = "agentDeSecurite", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DiplomeSSIAP> diplomesSSIAP = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.AGENT_SECURITE;

    @OneToMany(mappedBy = "agentDeSecurite", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ContratDeTravail> contratsDeTravail = new ArrayList<>();

    @OneToMany(mappedBy = "agentDeSecurite", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GestionnaireNotifications> notifications = new ArrayList<>();



}