// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/PointageServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.PointageCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.PointageDto;
import com.boulevardsecurity.securitymanagementapp.mapper.PointageMapper;
import com.boulevardsecurity.securitymanagementapp.model.GeoPoint;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.Pointage;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import com.boulevardsecurity.securitymanagementapp.repository.PointageRepository;
import com.boulevardsecurity.securitymanagementapp.service.PointageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PointageServiceImpl implements PointageService {

    private final PointageRepository pointageRepository;
    private final MissionRepository missionRepository;
    private final AgentDeSecuriteRepository agentRepository;
    private final PointageMapper mapper;

    @Override
    public List<PointageDto> recupererTousLesPointages() {
        return pointageRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PointageDto> recupererPointageParId(Long id) {
        return pointageRepository.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<PointageDto> recupererPointagesParMission(Long idMission) {
        return pointageRepository.findByMissionId(idMission).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PointageDto creerPointage(PointageCreateDto dto) {
        Pointage pointage = mapper.toEntity(dto);

        Mission mission = missionRepository.findById(dto.getMissionId())
                .orElseThrow(() -> new NoSuchElementException("Mission introuvable id=" + dto.getMissionId()));

        boolean estAffecte = mission.getAgents().stream()
                .anyMatch(a -> a.getId().equals(dto.getAgentId()));
        if (!estAffecte) {
            throw new IllegalArgumentException("Agent non affecté à la mission id=" + dto.getAgentId());
        }

        if (!missionEnCours(mission)) {
            throw new IllegalArgumentException("Mission non en cours id=" + dto.getMissionId());
        }

        GeoPoint centre = mission.getGeolocalisationGPS().getPosition();
        if (centre == null) {
            throw new IllegalArgumentException("Mission sans position GPS id=" + dto.getMissionId());
        }
        if (!dansLaZone(centre, pointage.getPositionActuelle(), 100f)) {
            throw new IllegalArgumentException("Position hors zone autorisée");
        }

        pointage.setDatePointage(new Date());
        pointage.setMission(mission);
        Pointage enregistre = pointageRepository.save(pointage);
        return mapper.toDto(enregistre);
    }

    @Override
    public PointageDto modifierPointage(Long id, PointageCreateDto dto) {
        Pointage existant = pointageRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Pointage introuvable id=" + id));
        mapper.updateEntity(dto, existant);
        Pointage sauvegarde = pointageRepository.save(existant);
        return mapper.toDto(sauvegarde);
    }

    @Override
    public void supprimerPointage(Long id) {
        if (!pointageRepository.existsById(id)) {
            throw new NoSuchElementException("Pointage introuvable id=" + id);
        }
        pointageRepository.deleteById(id);
    }

    // ── Méthodes utilitaires ─────────────────────────────────────────────────

    private boolean missionEnCours(Mission mission) {
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime debut = LocalDateTime.of(mission.getDateDebut(), mission.getHeureDebut());
        LocalDateTime fin   = LocalDateTime.of(mission.getDateFin(),   mission.getHeureFin());
        return maintenant.isAfter(debut) && maintenant.isBefore(fin);
    }

    private boolean dansLaZone(GeoPoint centre, GeoPoint pt, float toleranceMetres) {
        final double R = 6_371_000; // rayon Terre en m
        double dLat = Math.toRadians(pt.getLatitude()  - centre.getLatitude());
        double dLon = Math.toRadians(pt.getLongitude() - centre.getLongitude());
        double a = Math.sin(dLat/2)*Math.sin(dLat/2)
                + Math.cos(Math.toRadians(centre.getLatitude()))
                * Math.cos(Math.toRadians(pt.getLatitude()))
                * Math.sin(dLon/2)*Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c <= toleranceMetres;
    }
}
