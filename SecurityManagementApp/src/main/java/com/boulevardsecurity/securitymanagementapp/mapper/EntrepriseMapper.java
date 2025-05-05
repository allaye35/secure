// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/EntrepriseMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.Entreprise;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EntrepriseMapper {

    private final DevisRepository devisRepo;
    private final ContratDeTravailRepository contratTravailRepo;

    /** ENTITÉ → DTO */
    public EntrepriseDto toDto(Entreprise e) {
        return EntrepriseDto.builder()
                .id(e.getId())
                .nom(e.getNom())
                .siretPrestataire(e.getSiretPrestataire())
                .representantPrestataire(e.getRepresentantPrestataire())
                .numeroRue(e.getNumeroRue())
                .rue(e.getRue())
                .codePostal(e.getCodePostal())
                .ville(e.getVille())
                .pays(e.getPays())
                .telephone(e.getTelephone())
                .devisIds(e.getDevisList().stream()
                        .map(d -> d.getId())
                        .collect(Collectors.toList()))
                .contratsDeTravailIds(e.getContratsDeTravail().stream()
                        .map(ct -> ct.getId())
                        .collect(Collectors.toList()))
                .build();
    }

    /** DTO création → ENTITÉ */
    public Entreprise toEntity(EntrepriseCreateDto dto) {
        return Entreprise.builder()
                .nom(dto.getNom())
                .siretPrestataire(dto.getSiretPrestataire())
                .representantPrestataire(dto.getRepresentantPrestataire())
                .numeroRue(dto.getNumeroRue())
                .rue(dto.getRue())
                .codePostal(dto.getCodePostal())
                .ville(dto.getVille())
                .pays(dto.getPays())
                .telephone(dto.getTelephone())
                .build();
    }

    /** Mise à jour partielle (DTO → ENTITÉ existante) */
    public void updateEntityFromDto(EntrepriseDto dto, Entreprise ent) {
        if (dto.getNom() != null) ent.setNom(dto.getNom());
        if (dto.getSiretPrestataire() != null) ent.setSiretPrestataire(dto.getSiretPrestataire());
        if (dto.getRepresentantPrestataire() != null)
            ent.setRepresentantPrestataire(dto.getRepresentantPrestataire());

        if (dto.getNumeroRue() != null) ent.setNumeroRue(dto.getNumeroRue());
        if (dto.getRue() != null)       ent.setRue(dto.getRue());
        if (dto.getCodePostal() != null)ent.setCodePostal(dto.getCodePostal());
        if (dto.getVille() != null)     ent.setVille(dto.getVille());
        if (dto.getPays() != null)      ent.setPays(dto.getPays());

        if (dto.getTelephone() != null) ent.setTelephone(dto.getTelephone());

        /* gestion des relations existantes */
        if (dto.getDevisIds() != null) {
            ent.setDevisList(dto.getDevisIds().stream()
                    .map(id -> devisRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Devis id=" + id + " introuvable")))
                    .peek(d -> d.setEntreprise(ent))
                    .collect(Collectors.toList()));
        }

        if (dto.getContratsDeTravailIds() != null) {
            ent.setContratsDeTravail(dto.getContratsDeTravailIds().stream()
                    .map(id -> contratTravailRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("ContratDeTravail id=" + id + " introuvable")))
                    .peek(ct -> ct.setEntreprise(ent))
                    .collect(Collectors.toList()));
        }
    }
}
