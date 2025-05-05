package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.Site;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class SiteMapper {

    private final MissionRepository missionRepo;

    public SiteMapper(MissionRepository missionRepo) {
        this.missionRepo = missionRepo;
    }

    /* ===== ENTITÉ ➜ DTO ===== */
    public SiteDto toDto(Site entity) {

        return SiteDto.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .numero(entity.getNumero())
                .rue(entity.getRue())
                .codePostal(entity.getCodePostal())
                .ville(entity.getVille())
                .departement(entity.getDepartement())
                .region(entity.getRegion())
                .pays(entity.getPays())
                .missionsIds(
                        entity.getMissions() != null
                                ? entity.getMissions().stream()
                                .map(Mission::getId)
                                .toList()
                                : null
                )
                .build();
    }

    /* ===== DTO (create) ➜ nouvelle ENTITÉ ===== */
    public Site toEntity(SiteCreateDto dto) {

        Site site = Site.builder()
                .nom(dto.getNom())
                .numero(dto.getNumero())
                .rue(dto.getRue())
                .codePostal(dto.getCodePostal())
                .ville(dto.getVille())
                .departement(dto.getDepartement())
                .region(dto.getRegion())
                .pays(dto.getPays())
                .build();

        /* Rattachement optionnel des missions */
        if (dto.getMissionsIds() != null) {
            site.setMissions(
                    dto.getMissionsIds().stream()
                            .map(id -> missionRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Mission id " + id + " introuvable")))
                            .collect(Collectors.toList())
            );

            /* Mise à jour de l’autre côté (bidirectionnel) */
            site.getMissions().forEach(m -> m.setSite(site));
        }

        return site;
    }

    /* ===== PATCH (mise à jour partielle) ===== */
    public void updateEntity(Site entity, SiteCreateDto dto) {

        if (dto.getNom()         != null) entity.setNom(dto.getNom());
        if (dto.getNumero()      != null) entity.setNumero(dto.getNumero());
        if (dto.getRue()         != null) entity.setRue(dto.getRue());
        if (dto.getCodePostal()  != null) entity.setCodePostal(dto.getCodePostal());
        if (dto.getVille()       != null) entity.setVille(dto.getVille());
        if (dto.getDepartement() != null) entity.setDepartement(dto.getDepartement());
        if (dto.getRegion()      != null) entity.setRegion(dto.getRegion());
        if (dto.getPays()        != null) entity.setPays(dto.getPays());

        /*  Gestion (facultative) de la liste de missions */
        if (dto.getMissionsIds() != null) {

            var nouvellesMissions = dto.getMissionsIds().stream()
                    .map(id -> missionRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Mission id " + id + " introuvable")))
                    .collect(Collectors.toList());

            /* 1) On enlève les missions plus rattachées */
            entity.getMissions().stream()
                    .filter(m -> !nouvellesMissions.contains(m))
                    .forEach(m -> m.setSite(null));

            /* 2) On rattache les nouvelles missions */
            nouvellesMissions.forEach(m -> m.setSite(entity));

            entity.setMissions(nouvellesMissions);
        }
    }
}
