// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/AgentDeSecuriteMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.AgentDeSecuriteCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.AgentDeSecuriteDto;
import com.boulevardsecurity.securitymanagementapp.model.AgentDeSecurite;
import com.boulevardsecurity.securitymanagementapp.model.ZoneDeTravail;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.Disponibilite;
import com.boulevardsecurity.securitymanagementapp.model.CarteProfessionnelle;
import com.boulevardsecurity.securitymanagementapp.model.DiplomeSSIAP;
import com.boulevardsecurity.securitymanagementapp.model.ContratDeTravail;
import com.boulevardsecurity.securitymanagementapp.model.GestionnaireNotifications;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AgentDeSecuriteMapper {

    private final ZoneDeTravailRepository zoneRepo;
    private final MissionRepository missionRepo;
    private final DisponibiliteRepository dispoRepo;
    private final CarteProfessionnelleRepository carteRepo;
    private final DiplomeSSIAPRepository ssiapRepo;
    private final ContratDeTravailRepository contratRepo;
    private final GestionnaireNotificationsRepository notifRepo;

    /**
     * === ENTITÉ ➜ DTO ===
     */
    public AgentDeSecuriteDto toDto(AgentDeSecurite a) {
        return AgentDeSecuriteDto.builder()
                .id(a.getId())
                .nom(a.getNom())
                .prenom(a.getPrenom())
                .email(a.getEmail())
                .telephone(a.getTelephone())
                .adresse(a.getAdresse())
                .dateNaissance(a.getDateNaissance())
                .statut(a.getStatut())
                .role(a.getRole())
                .zonesDeTravailIds(
                        a.getZonesDeTravail().stream()
                                .map(ZoneDeTravail::getId)
                                .collect(Collectors.toSet())
                )
                .missionsIds(
                        a.getMissions().stream()
                                .map(Mission::getId)
                                .collect(Collectors.toSet())
                )
                .disponibilitesIds(
                        a.getDisponibilites().stream()
                                .map(Disponibilite::getId)
                                .collect(Collectors.toList())
                )
                .cartesProfessionnellesIds(
                        a.getCartesProfessionnelles().stream()
                                .map(CarteProfessionnelle::getId)
                                .collect(Collectors.toList())
                )
                .diplomesSSIAPIds(
                        a.getDiplomesSSIAP().stream()
                                .map(DiplomeSSIAP::getId)
                                .collect(Collectors.toList())
                )
                .contratsDeTravailIds(
                        a.getContratsDeTravail().stream()
                                .map(ContratDeTravail::getId)
                                .collect(Collectors.toList())
                )
                .notificationsIds(
                        a.getNotifications().stream()
                                .map(GestionnaireNotifications::getId)
                                .collect(Collectors.toList())
                )
                .build();
    }

    /**
     * === DTO création ➜ ENTITÉ ===
     */
    public AgentDeSecurite toEntity(AgentDeSecuriteCreationDto dto) {
        AgentDeSecurite a = AgentDeSecurite.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .telephone(dto.getTelephone())
                .adresse(dto.getAdresse())
                .dateNaissance(dto.getDateNaissance())
                .statut(dto.getStatut())
                .role(dto.getRole())
                .build();

        if (dto.getZonesDeTravailIds() != null) {
            a.setZonesDeTravail(
                    dto.getZonesDeTravailIds().stream()
                            .map(id -> zoneRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Zone " + id + " introuvable")))
                            .collect(Collectors.toSet())
            );
        }
        if (dto.getMissionsIds() != null) {
            a.setMissions(
                    dto.getMissionsIds().stream()
                            .map(id -> missionRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Mission " + id + " introuvable")))
                            .collect(Collectors.toSet())
            );
        }
        if (dto.getDisponibilitesIds() != null) {
            a.setDisponibilites(
                    dto.getDisponibilitesIds().stream()
                            .map(id -> dispoRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Disponibilité " + id + " introuvable")))
                            .collect(Collectors.toList())
            );
        }
        if (dto.getCartesProfessionnellesIds() != null) {
            a.setCartesProfessionnelles(
                    dto.getCartesProfessionnellesIds().stream()
                            .map(id -> carteRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Carte " + id + " introuvable")))
                            .collect(Collectors.toList())
            );
        }
        if (dto.getDiplomesSSIAPIds() != null) {
            a.setDiplomesSSIAP(
                    dto.getDiplomesSSIAPIds().stream()
                            .map(id -> ssiapRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Diplôme " + id + " introuvable")))
                            .collect(Collectors.toList())
            );
        }
        if (dto.getContratsDeTravailIds() != null) {
            a.setContratsDeTravail(
                    dto.getContratsDeTravailIds().stream()
                            .map(id -> contratRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Contrat " + id + " introuvable")))
                            .collect(Collectors.toList())
            );
        }
        if (dto.getNotificationsIds() != null) {
            a.setNotifications(
                    dto.getNotificationsIds().stream()
                            .map(id -> notifRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Notification " + id + " introuvable")))
                            .collect(Collectors.toList())
            );
        }

        return a;
    }

    /**
     * Mets à jour **tous** les champs modifiables d’une entité existante
     * à partir d’un AgentDeSecuriteCreationDto (utilisé pour PUT).
     */
    public void updateEntityFromCreationDto(AgentDeSecuriteCreationDto dto,
                                            AgentDeSecurite entity) {

        /* ─────────── champs simples ─────────── */
        if (dto.getNom() != null) entity.setNom(dto.getNom());
        if (dto.getPrenom() != null) entity.setPrenom(dto.getPrenom());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getPassword() != null) entity.setPassword(dto.getPassword());
        if (dto.getTelephone() != null) entity.setTelephone(dto.getTelephone());
        if (dto.getAdresse() != null) entity.setAdresse(dto.getAdresse());
        if (dto.getDateNaissance() != null) entity.setDateNaissance(dto.getDateNaissance());
        if (dto.getStatut() != null) entity.setStatut(dto.getStatut());
        if (dto.getRole() != null) entity.setRole(dto.getRole());

        /* ─────────── relations sans orphanRemoval ─────────── */
        if (dto.getZonesDeTravailIds() != null) {
            entity.setZonesDeTravail(
                    dto.getZonesDeTravailIds().stream()
                            .map(id -> zoneRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Zone " + id + " introuvable")))
                            .collect(Collectors.toSet())
            );
        }
        if (dto.getMissionsIds() != null) {
            entity.setMissions(
                    dto.getMissionsIds().stream()
                            .map(id -> missionRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Mission " + id + " introuvable")))
                            .collect(Collectors.toSet())
            );
        }

        /* ─────────── relations orphanRemoval=true ─────────── */

        // 1. Disponibilités
        if (dto.getDisponibilitesIds() != null) {
            entity.getDisponibilites().clear();
            dto.getDisponibilitesIds().forEach(id -> {
                Disponibilite d = dispoRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Disponibilité " + id + " introuvable"));
                d.setAgentDeSecurite(entity);          // côté inverse
                entity.getDisponibilites().add(d);
            });
        }

        // 2. Cartes professionnelles
        if (dto.getCartesProfessionnellesIds() != null) {
            entity.getCartesProfessionnelles().clear();
            dto.getCartesProfessionnellesIds().forEach(id -> {
                CarteProfessionnelle c = carteRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Carte " + id + " introuvable"));
                c.setAgentDeSecurite(entity);
                entity.getCartesProfessionnelles().add(c);
            });
        }

        // 3. Diplômes SSIAP
        if (dto.getDiplomesSSIAPIds() != null) {
            entity.getDiplomesSSIAP().clear();
            dto.getDiplomesSSIAPIds().forEach(id -> {
                DiplomeSSIAP s = ssiapRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Diplôme " + id + " introuvable"));
                s.setAgentDeSecurite(entity);
                entity.getDiplomesSSIAP().add(s);
            });
        }

        // 4. Contrats de travail
        if (dto.getContratsDeTravailIds() != null) {
            entity.getContratsDeTravail().clear();
            dto.getContratsDeTravailIds().forEach(id -> {
                ContratDeTravail c = contratRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Contrat " + id + " introuvable"));
                c.setAgentDeSecurite(entity);
                entity.getContratsDeTravail().add(c);
            });
        }

        // 5. Notifications
        if (dto.getNotificationsIds() != null) {
            entity.getNotifications().clear();
            dto.getNotificationsIds().forEach(id -> {
                GestionnaireNotifications n = notifRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Notification " + id + " introuvable"));
                n.setAgentDeSecurite(entity);
                entity.getNotifications().add(n);
            });
        }
    }
}