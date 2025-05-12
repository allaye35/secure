package com.boulevardsecurity.securitymanagementapp.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "entreprises")
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;
    // ==== Informations Prestataire ====
    private String siretPrestataire;        // ex: "521 478 800"
    private String representantPrestataire; // ex: "Madame Yolande Kamal"

    private String numeroRue;
    private String rue;         // ex. "Cas du Vauniel"
    private String codePostal;
    private String ville;
    private String pays;


    @Column(nullable = false, unique = true)
    private String telephone;

    private String email;

    // Relation avec les devis (OPTIONNEL : si tu veux stocker quel devis a été fait par quelle entreprise)
    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Devis> devisList = new ArrayList<>();

    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ContratDeTravail> contratsDeTravail = new ArrayList<>();


            ;
}
