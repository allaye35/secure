package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.RapportStatus;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rapport_intervention")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RapportIntervention {

    /* ----- clef ----- */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ----- contenu métier ----- */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")       // pour l’échange JSON
    private LocalDateTime dateIntervention;

    @Column(columnDefinition="TEXT")  private String description;
    @Column(columnDefinition="TEXT")  private String contenu;

    private String agentNom;
    private String agentEmail;
    private String agentTelephone;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RapportStatus status = RapportStatus.EN_COURS;

    /* ----- audit ----- */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime dateCreation;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime dateModification;

    /* ----- relation : beaucoup‑de rapports pour 1 mission ----- */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mission_id")
//    @JsonBackReference
//    @JsonIgnoreProperties("rapports")
//    @JsonIgnore
    private Mission mission;

    /* ----- callbacks ----- */
    @PrePersist   public void prePersist() { dateCreation = LocalDateTime.now(); }
    @PreUpdate    public void preUpdate () { dateModification = LocalDateTime.now(); }
}