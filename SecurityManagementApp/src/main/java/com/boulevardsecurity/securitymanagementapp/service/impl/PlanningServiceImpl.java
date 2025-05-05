// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/PlanningServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.PlanningCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.PlanningDto;
import com.boulevardsecurity.securitymanagementapp.mapper.PlanningMapper;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.Planning;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import com.boulevardsecurity.securitymanagementapp.repository.PlanningRepository;
import com.boulevardsecurity.securitymanagementapp.service.PlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanningServiceImpl implements PlanningService {

    private final PlanningRepository planningRepo;
    private final MissionRepository missionRepo;
    private final PlanningMapper planningMapper;

    @Override
    public List<PlanningDto> getAllPlannings() {
        return planningRepo.findAll().stream()
                .map(planningMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PlanningDto> getPlanningById(Long id) {
        return planningRepo.findById(id)
                .map(planningMapper::toDto);
    }

    @Override
    public PlanningDto createPlanning(PlanningCreateDto dto) {
        Planning entity = planningMapper.toEntity(dto);
        Planning saved = planningRepo.save(entity);
        return planningMapper.toDto(saved);
    }

    @Override
    public PlanningDto updatePlanning(Long id, PlanningCreateDto dto) {
        Planning existing = planningRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Planning introuvable id=" + id));
        planningMapper.updateEntity(existing, dto);
        Planning saved = planningRepo.save(existing);
        return planningMapper.toDto(saved);
    }

    @Override
    public void deletePlanning(Long id) {
        if (!planningRepo.existsById(id)) {
            throw new IllegalArgumentException("Planning introuvable id=" + id);
        }
        planningRepo.deleteById(id);
    }

    @Override
    public PlanningDto addMissionToPlanning(Long planningId, Long missionId) {
        Planning planning = planningRepo.findById(planningId)
                .orElseThrow(() -> new IllegalArgumentException("Planning introuvable id=" + planningId));
        Mission mission = missionRepo.findById(missionId)
                .orElseThrow(() -> new IllegalArgumentException("Mission introuvable id=" + missionId));
        mission.setPlanning(planning);
        planning.getMissions().add(mission);
        Planning saved = planningRepo.save(planning);
        return planningMapper.toDto(saved);
    }

    @Override
    public PlanningDto removeMissionFromPlanning(Long planningId, Long missionId) {
        Planning planning = planningRepo.findById(planningId)
                .orElseThrow(() -> new IllegalArgumentException("Planning introuvable id=" + planningId));
        Mission mission = missionRepo.findById(missionId)
                .orElseThrow(() -> new IllegalArgumentException("Mission introuvable id=" + missionId));
        if (mission.getPlanning() != null && planningId.equals(mission.getPlanning().getId())) {
            mission.setPlanning(null);
            missionRepo.save(mission);
        } else {
            throw new IllegalArgumentException("Mission non associée à ce planning");
        }
        return planningMapper.toDto(planning);
    }
}
