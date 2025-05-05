    // src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/PointageMapper.java
    package com.boulevardsecurity.securitymanagementapp.mapper;

    import com.boulevardsecurity.securitymanagementapp.dto.PointageCreateDto;
    import com.boulevardsecurity.securitymanagementapp.dto.PointageDto;
    import com.boulevardsecurity.securitymanagementapp.model.GeoPoint;
    import com.boulevardsecurity.securitymanagementapp.model.Pointage;
    import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Component;

    @Component
    @RequiredArgsConstructor
    public class PointageMapper {

        private final MissionRepository missionRepo;

        /** ENTITÉ → DTO */
        public PointageDto toDto(Pointage ent) {
            var pos = ent.getPositionActuelle();
            return PointageDto.builder()
                    .id(ent.getId())
                    .datePointage(ent.getDatePointage())
                    .estPresent(ent.isEstPresent())
                    .estRetard(ent.isEstRetard())
                    .latitude(pos != null ? pos.getLatitude() : 0.0)
                    .longitude(pos != null ? pos.getLongitude() : 0.0)
                    .missionId(ent.getMission() != null ? ent.getMission().getId() : null)
                    .build();
        }

        /** DTO de création → ENTITÉ */
        public Pointage toEntity(PointageCreateDto dto) {
            // Construire l’embedded GeoPoint
            GeoPoint point = GeoPoint.builder()
                    .latitude(dto.getLatitude())
                    .longitude(dto.getLongitude())
                    .build();

            // Récupérer la mission
            var mission = missionRepo.findById(dto.getMissionId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Mission introuvable, id=" + dto.getMissionId()));

            // Construire l’entité Pointage
            return Pointage.builder()
                    .datePointage(dto.getDatePointage())
                    .estPresent(dto.isEstPresent())
                    .estRetard(dto.isEstRetard())
                    .positionActuelle(point)
                    .mission(mission)
                    .build();
        }

        /** MAJ partielle d’une ENTITÉ existante à partir du DTO de création */
        public void updateEntity(PointageCreateDto dto, Pointage ent) {
            if (dto.getDatePointage() != null) {
                ent.setDatePointage(dto.getDatePointage());
            }
            // On met toujours à jour présence/retard
            ent.setEstPresent(dto.isEstPresent());
            ent.setEstRetard(dto.isEstRetard());

            // Mise à jour de la position GPS
            if (ent.getPositionActuelle() == null) {
                ent.setPositionActuelle(new GeoPoint());
            }
            ent.getPositionActuelle().setLatitude(dto.getLatitude());
            ent.getPositionActuelle().setLongitude(dto.getLongitude());

            // (Optionnel) rattacher une nouvelle mission si l’ID diffère
            if (dto.getMissionId() != null
                    && (ent.getMission() == null || !dto.getMissionId().equals(ent.getMission().getId()))) {
                var mission = missionRepo.findById(dto.getMissionId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Mission introuvable, id=" + dto.getMissionId()));
                ent.setMission(mission);
            }
        }
    }
