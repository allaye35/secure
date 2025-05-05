// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/FicheDePaieMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.*;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class FicheDePaieMapper {

    private final AgentDeSecuriteRepository agentRepo;
    private final ContratDeTravailRepository contratRepo;
    private final LigneCotisationRepository ligneRepo;

    /** Entity → DTO */
    public FicheDePaieDto toDto(FicheDePaie f) {
        return FicheDePaieDto.builder()
                .id(f.getId())
                .reference(f.getReference())
                .periodeDebut(f.getPeriodeDebut())
                .periodeFin(f.getPeriodeFin())
                .salaireDeBase(f.getSalaireDeBase())
                .heuresTravaillees(f.getHeuresTravaillées())
                .primeNuit(f.getPrimeNuit())
                .heuresSupplementaires(f.getHeuresSupplementaires())
                .primeDiverses(f.getPrimeDiverses())
                .totalCotisationsSalariales(f.getTotalCotisationsSalariales())
                .totalCotisationsEmployeur(f.getTotalCotisationsEmployeur())
                .totalBrut(f.getTotalBrut())
                .netImposable(f.getNetImposable())
                .netAPayer(f.getNetAPayer())
                .agentId(f.getAgentDeSecurite().getId())
                .contratDeTravailId(
                        f.getContratDeTravail()!=null ? f.getContratDeTravail().getId() : null
                )
                .lignesCotisationIds(
                        f.getLignesCotisation().stream()
                                .map(l -> l.getId())
                                .collect(Collectors.toList())
                )
                .build();
    }

    /** DTO création → Entity */
    public FicheDePaie toEntity(FicheDePaieCreationDto dto) {
        FicheDePaie f = new FicheDePaie();
        f.setReference(dto.getReference());
        f.setPeriodeDebut(dto.getPeriodeDebut());
        f.setPeriodeFin(dto.getPeriodeFin());
        f.setSalaireDeBase(dto.getSalaireDeBase());
        f.setHeuresTravaillées(dto.getHeuresTravaillees());
        f.setPrimeNuit(dto.getPrimeNuit());
        f.setHeuresSupplementaires(dto.getHeuresSupplementaires());
        f.setPrimeDiverses(dto.getPrimeDiverses());
        f.setTotalCotisationsSalariales(dto.getTotalCotisationsSalariales());
        f.setTotalCotisationsEmployeur(dto.getTotalCotisationsEmployeur());
        f.setTotalBrut(dto.getTotalBrut());
        f.setNetImposable(dto.getNetImposable());
        f.setNetAPayer(dto.getNetAPayer());

        // associations
        agentRepo.findById(dto.getAgentId())
                .ifPresentOrElse(
                        f::setAgentDeSecurite,
                        () -> { throw new IllegalArgumentException("Agent introuvable id=" + dto.getAgentId()); }
                );
        if (dto.getContratDeTravailId()!=null) {
            contratRepo.findById(dto.getContratDeTravailId())
                    .ifPresentOrElse(
                            f::setContratDeTravail,
                            () -> { throw new IllegalArgumentException("Contrat introuvable id=" + dto.getContratDeTravailId()); }
                    );
        }
        return f;
    }

    /** DTO mise à jour → Entity existant */
    public void updateEntityFromDto(FicheDePaieCreationDto dto, FicheDePaie f) {
        if (dto.getReference() != null) f.setReference(dto.getReference());
        if (dto.getPeriodeDebut() != null) f.setPeriodeDebut(dto.getPeriodeDebut());
        if (dto.getPeriodeFin() != null) f.setPeriodeFin(dto.getPeriodeFin());
        if (dto.getSalaireDeBase() != null) f.setSalaireDeBase(dto.getSalaireDeBase());
        if (dto.getHeuresTravaillees() != null) f.setHeuresTravaillées(dto.getHeuresTravaillees());
        if (dto.getPrimeNuit() != null) f.setPrimeNuit(dto.getPrimeNuit());
        if (dto.getHeuresSupplementaires() != null) f.setHeuresSupplementaires(dto.getHeuresSupplementaires());
        if (dto.getPrimeDiverses() != null) f.setPrimeDiverses(dto.getPrimeDiverses());
        if (dto.getTotalCotisationsSalariales()!=null) f.setTotalCotisationsSalariales(dto.getTotalCotisationsSalariales());
        if (dto.getTotalCotisationsEmployeur()!=null) f.setTotalCotisationsEmployeur(dto.getTotalCotisationsEmployeur());
        if (dto.getTotalBrut()!=null) f.setTotalBrut(dto.getTotalBrut());
        if (dto.getNetImposable()!=null) f.setNetImposable(dto.getNetImposable());
        if (dto.getNetAPayer()!=null) f.setNetAPayer(dto.getNetAPayer());
        // associations idem création si besoin…
    }
}
