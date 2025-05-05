package com.boulevardsecurity.securitymanagementapp.model;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeZone;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "zones_de_travail")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "agents")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ZoneDeTravail {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String nom;  // Nom de la zone (Paris, Île-de-France, 75000, etc.)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeZone typeZone;  // VILLE, DEPARTEMENT, REGION, CODE_POSTAL

    @Column(nullable = true)
    private String codePostal;  // Code Postal (ex: 75001)

    @Column(nullable = true)
    private String ville;  // Ville (ex: Paris)

    @Column(nullable = true)
    private String departement;  // Département (ex: Paris)

    @Column(nullable = true)
    private String region;  // Région (ex: Île-de-France)

    @Column(nullable = true)
    private String pays;  // Pays (ex: France)

    //  Lien avec les agents qui peuvent travailler dans cette zone
    @ManyToMany(mappedBy = "zonesDeTravail")
    @Builder.Default
    private Set<AgentDeSecurite> agents = new HashSet<>();
}