// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/GeolocalisationGpsServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.GeolocalisationGpsCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.GeolocalisationGpsDto;
import com.boulevardsecurity.securitymanagementapp.mapper.GeolocalisationGpsMapper;
import com.boulevardsecurity.securitymanagementapp.model.GeolocalisationGPS;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.repository.GeolocalisationGPSRepository;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import com.boulevardsecurity.securitymanagementapp.service.GeolocalisationGpsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeolocalisationGpsServiceImpl implements GeolocalisationGpsService {

    private final GeolocalisationGPSRepository gpsRepository;
    private final MissionRepository missionRepository;
    private final GeolocalisationGpsMapper mapper;

    @Override
    public List<GeolocalisationGpsDto> getAll() {
        return gpsRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<GeolocalisationGpsDto> getById(Long id) {
        return gpsRepository.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public GeolocalisationGpsDto create(GeolocalisationGpsCreateDto dto) {
        GeolocalisationGPS ent = mapper.toEntity(dto);
        GeolocalisationGPS saved = gpsRepository.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public GeolocalisationGpsDto update(Long id, GeolocalisationGpsCreateDto dto) {
        GeolocalisationGPS existing = gpsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GeolocalisationGPS non trouvée id=" + id));
        mapper.updateEntityFromDto(dto, existing);
        GeolocalisationGPS saved = gpsRepository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!gpsRepository.existsById(id)) {
            throw new RuntimeException("GeolocalisationGPS non trouvée id=" + id);
        }
        gpsRepository.deleteById(id);
    }

    @Override
    public List<Long> addMission(Long gpsId, Long missionId) {
        GeolocalisationGPS gps = gpsRepository.findById(gpsId)
                .orElseThrow(() -> new RuntimeException("GeolocalisationGPS non trouvée id=" + gpsId));
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée id=" + missionId));

        if (gps.getMissions() == null) {
            gps.setMissions(new java.util.ArrayList<>());
        }
        // lie la mission et la géolocalisation
        mission.setGeolocalisationGPS(gps);
        gps.getMissions().add(mission);

        // on persiste les deux côtés
        gpsRepository.save(gps);
        missionRepository.save(mission);

        // on renvoie la liste des IDs actuels
        return gps.getMissions()
                .stream()
                .map(Mission::getId)
                .collect(Collectors.toList());
    }
}
