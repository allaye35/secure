// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/ArticleContratTravailMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratTravailDto;
import com.boulevardsecurity.securitymanagementapp.model.ArticleContratTravail;
import com.boulevardsecurity.securitymanagementapp.repository.ContratDeTravailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ArticleContratTravailMapper {

    private final ContratDeTravailRepository contratTravailRepo;

    /** ENTITÉ → DTO */
    public ArticleContratTravailDto toDto(ArticleContratTravail art) {
        return ArticleContratTravailDto.builder()
                .id(art.getId())
                .libelle(art.getLibelle())
                .contenu(art.getContenu())
                .contratDeTravailId(
                        art.getContratDeTravail() != null
                                ? art.getContratDeTravail().getId()
                                : null
                )
                .build();
    }

    /** DTO de création → ENTITÉ */
    public ArticleContratTravail toEntity(ArticleContratTravailCreationDto dto) {
        ArticleContratTravail ent = new ArticleContratTravail();
        ent.setLibelle(dto.getLibelle());
        ent.setContenu(dto.getContenu());
        if (dto.getContratDeTravailId() != null) {
            ent.setContratDeTravail(
                    contratTravailRepo.findById(dto.getContratDeTravailId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "ContratDeTravail introuvable id=" + dto.getContratDeTravailId()
                            ))
            );
        }
        return ent;
    }

    /** Mise à jour partielle d’une ENTITÉ existante à partir d’un DTO plat */
    public void updateEntityFromDto(ArticleContratTravailDto dto,
                                    ArticleContratTravail ent) {
        if (dto.getLibelle() != null) {
            ent.setLibelle(dto.getLibelle());
        }
        if (dto.getContenu() != null) {
            ent.setContenu(dto.getContenu());
        }
        if (dto.getContratDeTravailId() != null &&
                (ent.getContratDeTravail() == null ||
                        !dto.getContratDeTravailId().equals(ent.getContratDeTravail().getId()))) {

            ent.setContratDeTravail(
                    contratTravailRepo.findById(dto.getContratDeTravailId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "ContratDeTravail introuvable id=" + dto.getContratDeTravailId()
                            ))
            );
        }
    }
}
