package com.boulevardsecurity.securitymanagementapp.model;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeNotification;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

    @Entity
    @Table(name = "notifications")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @ToString
    public class GestionnaireNotifications {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String titre;

        @Column(columnDefinition = "TEXT")
        private String message;

        @Column(nullable = false)
        private String destinataire; // Peut être l'email, le username, ou "TOUS"

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private TypeNotification typeNotification;
        // Exemple: INFO, WARNING, ALERT, SUCCESS

        @Column(nullable = false)
        @Builder.Default
        private boolean lu = false;  // Permet de savoir si le destinataire a lu la notification

        @Column(nullable = false)
        private LocalDateTime dateEnvoi;

        @PrePersist
        public void prePersist() {
            this.dateEnvoi = LocalDateTime.now();
        }

        // Relation facultative : à qui est liée la notification (agent, admin, client...)
        @ManyToOne
        @JoinColumn(name = "agent_id")
        private AgentDeSecurite agentDeSecurite;

        @ManyToOne
        @JoinColumn(name = "client_id")
        private Client client;


    }

