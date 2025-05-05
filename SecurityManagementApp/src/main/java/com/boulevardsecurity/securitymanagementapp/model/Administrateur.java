//package com.boulevardsecurity.securitymanagementapp.model;
//
//import com.boulevardsecurity.securitymanagementapp.Enums.Role;
//import com.fasterxml.jackson.annotation.JsonIdentityInfo;
//import com.fasterxml.jackson.annotation.ObjectIdGenerators;
//import jakarta.persistence.*;
//import jakarta.validation.constraints.Email;
//import jakarta.validation.constraints.NotBlank;
//import lombok.*;
//
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "administrateurs")
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//@ToString
//@EqualsAndHashCode(onlyExplicitlyIncluded = true)
//public class Administrateur {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @EqualsAndHashCode.Include
//    private Long id;
//
//    @Column(nullable = false, unique = true)
//    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
//    private String username;
//
//    @Column(nullable = false)
//    @NotBlank(message = "Le mot de passe est obligatoire")
//    private String password;
//
//    @Column(nullable = false)
//    @Email(message = "L'email doit être valide")
//    private String email;
//
//    @Enumerated(EnumType.STRING)
//    @Builder.Default
//    private Role role = Role.ADMIN; // Rôle par défaut ADMIN
//
//    @OneToMany(mappedBy = "administrateur", cascade = CascadeType.ALL, orphanRemoval = true)
//    @Builder.Default
//    private List<GestionnaireNotifications> notifications = new ArrayList<>();
//
//    @OneToMany(mappedBy = "creePar")
//    @Builder.Default
//    private List<ContratDeTravail> contratsDeTravailCrees = new ArrayList<>();
//
//    @OneToMany(mappedBy = "creePar")
//    @Builder.Default
//    private List<Mission> missionsCrees = new ArrayList<>();
//
//    @OneToMany(mappedBy = "creePar")
//    @Builder.Default
//    private List<Devis> devisCrees = new ArrayList<>();
//
//    @OneToMany(mappedBy = "creePar")
//    @Builder.Default
//    private List<Contrat> contratsCrees = new ArrayList<>();
//
//
//
//}
