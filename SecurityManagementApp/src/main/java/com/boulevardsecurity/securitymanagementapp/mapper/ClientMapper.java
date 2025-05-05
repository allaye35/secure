package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.ClientCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ClientDto;
import com.boulevardsecurity.securitymanagementapp.model.Client;
import com.boulevardsecurity.securitymanagementapp.model.Devis;
import com.boulevardsecurity.securitymanagementapp.model.GestionnaireNotifications;
import com.boulevardsecurity.securitymanagementapp.repository.DevisRepository;
import com.boulevardsecurity.securitymanagementapp.repository.GestionnaireNotificationsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ClientMapper {

    private final DevisRepository devisRepo;
    private final GestionnaireNotificationsRepository notifRepo;

    /** === ENTITÉ ➜ DTO de lecture === */
    public ClientDto toDto(Client c) {
        return ClientDto.builder()
                .id(c.getId())
                .role(c.getRole())
                .typeClient(c.getTypeClient())
                .nom(c.getNom())
                .prenom(c.getPrenom())
                .siege(c.getSiege())
                .representant(c.getRepresentant())
                .numeroSiret(c.getNumeroSiret())
                .email(c.getEmail())
                .telephone(c.getTelephone())
                .adresse(c.getAdresse())
                .numeroRue(c.getNumeroRue())
                .codePostal(c.getCodePostal())
                .ville(c.getVille())
                .pays(c.getPays())
                .modeContactPrefere(c.getModeContactPrefere())
                .devisIds(c.getDevisList().stream()
                        .map(Devis::getId)
                        .collect(Collectors.toList()))
                .notificationIds(c.getNotifications().stream()
                        .map(GestionnaireNotifications::getId)
                        .collect(Collectors.toList()))
                .build();
    }

    /** === DTO de création ➜ ENTITÉ === */
    public Client toEntity(ClientCreateDto dto) {
        Client c = Client.builder()
                .password(dto.getPassword())
                .typeClient(dto.getTypeClient())
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .siege(dto.getSiege())
                .representant(dto.getRepresentant())
                .numeroSiret(dto.getNumeroSiret())
                .email(dto.getEmail())
                .telephone(dto.getTelephone())
                .adresse(dto.getAdresse())
                .numeroRue(dto.getNumeroRue())
                .codePostal(dto.getCodePostal())
                .ville(dto.getVille())
                .pays(dto.getPays())
                .modeContactPrefere(dto.getModeContactPrefere())
                .build();

        if (dto.getDevisIds() != null) {
            dto.getDevisIds().forEach(id -> {
                Devis d = devisRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Devis id=" + id + " introuvable"));
                d.setClient(c);
                c.getDevisList().add(d);
            });
        }
        if (dto.getNotificationIds() != null) {
            dto.getNotificationIds().forEach(id -> {
                GestionnaireNotifications n = notifRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Notification id=" + id + " introuvable"));
                n.setClient(c);
                c.getNotifications().add(n);
            });
        }

        return c;
    }

    /** === DTO lecture / update ➜ ENTITÉ existante === */
    public void updateEntityFromDto(ClientDto dto, Client c) {
        // mise à jour des champs simples
        c.setNom(dto.getNom());
        c.setPrenom(dto.getPrenom());
        c.setSiege(dto.getSiege());
        c.setRepresentant(dto.getRepresentant());
        c.setNumeroSiret(dto.getNumeroSiret());
        c.setTelephone(dto.getTelephone());
        c.setAdresse(dto.getAdresse());
        c.setNumeroRue(dto.getNumeroRue());
        c.setCodePostal(dto.getCodePostal());
        c.setVille(dto.getVille());
        c.setPays(dto.getPays());
        c.setModeContactPrefere(dto.getModeContactPrefere());

        // —— DEVIS — ne jamais appeler c.setDevisList(...) sur une entité déjà gérée
        if (dto.getDevisIds() != null) {
            // vider ou maintenir
            if (dto.getDevisIds().isEmpty()) {
                c.getDevisList().clear();
            } else {
                Set<Long> existants = c.getDevisList().stream()
                        .map(Devis::getId)
                        .collect(Collectors.toSet());
                // ajout des nouveaux
                for (Long id : dto.getDevisIds()) {
                    if (!existants.contains(id)) {
                        Devis d = devisRepo.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Devis id=" + id + " introuvable"));
                        d.setClient(c);
                        c.getDevisList().add(d);
                    }
                }
                // suppression de ceux non mentionnés
                c.getDevisList().removeIf(d -> !dto.getDevisIds().contains(d.getId()));
            }
        }

        // —— NOTIFICATIONS — même principe
        if (dto.getNotificationIds() != null) {
            if (dto.getNotificationIds().isEmpty()) {
                c.getNotifications().clear();
            } else {
                Set<Long> existants = c.getNotifications().stream()
                        .map(GestionnaireNotifications::getId)
                        .collect(Collectors.toSet());
                for (Long id : dto.getNotificationIds()) {
                    if (!existants.contains(id)) {
                        GestionnaireNotifications n = notifRepo.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Notification id=" + id + " introuvable"));
                        n.setClient(c);
                        c.getNotifications().add(n);
                    }
                }
                c.getNotifications().removeIf(n -> !dto.getNotificationIds().contains(n.getId()));
            }
        }
    }
}
