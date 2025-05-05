// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/GeolocalisationGpsMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class GeolocalisationGpsMapper {
    private final MissionMapper missionMapper;

    /** ENTITÉ → DTO **/
    public GeolocalisationGpsDto toDto(GeolocalisationGPS entity) {
        GeoPointDto pointDto = null;
        if (entity.getPosition() != null) {
            pointDto = GeoPointDto.builder()
                    .latitude(entity.getPosition().getLatitude())
                    .longitude(entity.getPosition().getLongitude())
                    .build();
        }

        return GeolocalisationGpsDto.builder()
                .id(entity.getId())
                .gpsPrecision(entity.getGps_precision())
                .position(pointDto)
                .missions(
                        entity.getMissions()!=null
                                ? entity.getMissions().stream()
                                .map(missionMapper::toDto)
                                .collect(Collectors.toList())
                                : List.of()
                )
                .build();
    }
    /** DTO création → ENTITÉ **/
    public GeolocalisationGPS toEntity(GeolocalisationGpsCreateDto dto) {
        GeoPoint point = GeoPoint.builder()
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();

        return GeolocalisationGPS.builder()
                .gps_precision(dto.getGpsPrecision())
                .position(point)
                .build();
    }

    /** Mise à jour partielle (patch) **/
    public void updateEntityFromDto(GeolocalisationGpsCreateDto dto, GeolocalisationGPS entity) {
        if (dto.getGpsPrecision() != 0f) {
            entity.setGps_precision(dto.getGpsPrecision());
        }
        if (dto.getLatitude() != null && dto.getLongitude() != null) {
            GeoPoint pos = entity.getPosition();
            if (pos == null) {
                pos = new GeoPoint();
                entity.setPosition(pos);
            }
            pos.setLatitude(dto.getLatitude());
            pos.setLongitude(dto.getLongitude());
        }
    }
}
