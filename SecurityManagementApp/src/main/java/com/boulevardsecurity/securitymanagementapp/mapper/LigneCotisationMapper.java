// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/LigneCotisationMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.LigneCotisation;
import com.boulevardsecurity.securitymanagementapp.repository.FicheDePaieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LigneCotisationMapper {

    private final FicheDePaieRepository ficheRepo;

    /** ENTITÉ → DTO */
    public LigneCotisationDto toDto(LigneCotisation e) {
        return LigneCotisationDto.builder()
                .id(e.getId())
                .libelle(e.getLibelle())
                .tauxSalarial(e.getTauxSalarial())
                .montantSalarial(e.getMontantSalarial())
                .tauxEmployeur(e.getTauxEmployeur())
                .montantEmployeur(e.getMontantEmployeur())
                .ficheDePaieId(e.getFicheDePaie() != null
                        ? e.getFicheDePaie().getId()
                        : null)
                .build();
    }

    /** DTO de création → ENTITÉ */
    public LigneCotisation toEntity(LigneCotisationCreationDto dto) {
        LigneCotisation e = new LigneCotisation();
        e.setLibelle(dto.getLibelle());
        e.setTauxSalarial(dto.getTauxSalarial());
        e.setMontantSalarial(dto.getMontantSalarial());
        e.setTauxEmployeur(dto.getTauxEmployeur());
        e.setMontantEmployeur(dto.getMontantEmployeur());
        ficheRepo.findById(dto.getFicheDePaieId())
                .ifPresentOrElse(
                        e::setFicheDePaie,
                        () -> { throw new IllegalArgumentException(
                                "FicheDePaie introuvable id=" + dto.getFicheDePaieId());
                        }
                );
        return e;
    }

    /** Mise à jour d’une ENTITÉ existante à partir d’un DTO de création */
    public void updateEntityFromDto(LigneCotisationCreationDto dto, LigneCotisation e) {
        if (dto.getLibelle()           != null) e.setLibelle(dto.getLibelle());
        if (dto.getTauxSalarial()      != null) e.setTauxSalarial(dto.getTauxSalarial());
        if (dto.getMontantSalarial()   != null) e.setMontantSalarial(dto.getMontantSalarial());
        if (dto.getTauxEmployeur()     != null) e.setTauxEmployeur(dto.getTauxEmployeur());
        if (dto.getMontantEmployeur()  != null) e.setMontantEmployeur(dto.getMontantEmployeur());
        if (dto.getFicheDePaieId()     != null) {
            ficheRepo.findById(dto.getFicheDePaieId())
                    .ifPresentOrElse(
                            e::setFicheDePaie,
                            () -> { throw new IllegalArgumentException(
                                    "FicheDePaie introuvable id=" + dto.getFicheDePaieId());
                            }
                    );
        }
    }
}
