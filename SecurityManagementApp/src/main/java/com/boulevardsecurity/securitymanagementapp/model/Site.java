package com.boulevardsecurity.securitymanagementapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sites")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@ToString(exclude = "missions")
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;
    private String numero;
    private String rue;
    private String codePostal;
    private String ville;
    private String departement;
    private String region;
    private String pays;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Mission> missions = new ArrayList<>();
}
