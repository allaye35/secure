package com.boulevardsecurity.securitymanagementapp.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;


@Entity
@Table(name = "pointages")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Pointage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date datePointage;

    private boolean estPresent;
    private boolean estRetard;

    @Embedded  // Position GPS envoyée par l’agent au moment du pointage
    private GeoPoint positionActuelle;

    @ManyToOne
    @JoinColumn(name = "mission_id")
    private Mission mission;  //  Plus de lien direct avec AgentDeSecurite
}

