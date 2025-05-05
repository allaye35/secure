package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.TarifMissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.TarifMissionDto;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.TarifMission;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TarifMissionMapper {

    private final MissionRepository missionRepo;

    /**
     * ENTITÉ → DTO de lecture complet (avec missionsIds)
     */
    public TarifMissionDto toDto(TarifMission entity) {
        return TarifMissionDto.builder()
                .id(entity.getId())
                .typeMission(entity.getTypeMission())
                .prixUnitaireHT(entity.getPrixUnitaireHT())
                .majorationNuit(entity.getMajorationNuit())
                .majorationWeekend(entity.getMajorationWeekend())
                .majorationDimanche(entity.getMajorationDimanche())
                .majorationFerie(entity.getMajorationFerie())
                .tauxTVA(entity.getTauxTVA())
                .missionIds(
                        entity.getId() == null
                                ? null
                                : missionRepo.findByTarif_Id(entity.getId())
                                .stream()
                                .map(Mission::getId)
                                .collect(Collectors.toList())
                )
                .build();
    }

    /**
     * DTO de création → nouvelle ENTITÉ
     */
    public TarifMission toEntity(TarifMissionCreateDto dto) {
        return TarifMission.builder()
                .typeMission(dto.getTypeMission())
                .prixUnitaireHT(dto.getPrixUnitaireHT())
                .majorationNuit(dto.getMajorationNuit())
                .majorationWeekend(dto.getMajorationWeekend())
                .majorationDimanche(dto.getMajorationDimanche())
                .majorationFerie(dto.getMajorationFerie())
                .tauxTVA(dto.getTauxTVA())
                .build();
    }

    /**
     * DTO complet → ENTITÉ (pour mise à jour)
     */
    public TarifMission toEntity(TarifMissionDto dto) {
        TarifMission t = TarifMission.builder()
                .id(dto.getId())
                .typeMission(dto.getTypeMission())
                .prixUnitaireHT(dto.getPrixUnitaireHT())
                .majorationNuit(dto.getMajorationNuit())
                .majorationWeekend(dto.getMajorationWeekend())
                .majorationDimanche(dto.getMajorationDimanche())
                .majorationFerie(dto.getMajorationFerie())
                .tauxTVA(dto.getTauxTVA())
                .build();

        // rattachement bidirectionnel optionnel des missions existantes
        if (dto.getMissionIds() != null) {
            dto.getMissionIds().forEach(mid -> {
                Mission m = missionRepo.findById(mid)
                        .orElseThrow(() -> new IllegalArgumentException("Mission id=" + mid + " introuvable"));
                m.setTarif(t);
            });
        }
        return t;
    }
}
