package com.boulevardsecurity.securitymanagementapp.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "geolocalisation_gps")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "missions")
public class GeolocalisationGPS {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private float gps_precision;

    @Embedded // Intègre directement latitude et longitude dans la table
    private GeoPoint position;

    @OneToMany(mappedBy = "geolocalisationGPS", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Mission> missions;
}
