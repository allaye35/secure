package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.ModeContactPrefere;
import com.boulevardsecurity.securitymanagementapp.Enums.Role;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeClient;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /**
     * Stocké en base mais jamais exposé en JSON
     */
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    /** Role (CLIENT / ADMIN / etc.) */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.CLIENT;

    /** Particulier ou Entreprise */
    @Enumerated(EnumType.STRING)
    private TypeClient typeClient;

    /** ==== Si c’est un particulier ==== */
    private String nom;
    private String prenom;

    /** ==== Si c’est une entreprise ==== */
    private String siege;
    private String representant;
    private String numeroSiret;

    /** ==== Coordonnées de contact ==== */
    @Column(nullable = false, unique = true)
    private String email;
    private String telephone;
    private String adresse;
    private String codePostal;
    private String ville;
    private String pays;
    private String numeroRue;

    @Enumerated(EnumType.STRING)
    private ModeContactPrefere modeContactPrefere;

    /** Relations vers Devis */
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Devis> devisList = new ArrayList<>();

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GestionnaireNotifications> notifications = new ArrayList<>();

}