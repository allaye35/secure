package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.NiveauSSIAP;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "diplomes_ssiap")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DiplomeSSIAP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauSSIAP niveau;

    @Temporal(TemporalType.DATE)
    private Date dateObtention;

    @Temporal(TemporalType.DATE)
    private Date dateExpiration;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private AgentDeSecurite agentDeSecurite;
}
