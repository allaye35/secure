// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/PlanningController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.PlanningCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.PlanningDto;
import com.boulevardsecurity.securitymanagementapp.service.PlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plannings")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService service;

    @GetMapping
    public ResponseEntity<List<PlanningDto>> getAll() {
        return ResponseEntity.ok(service.getAllPlannings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanningDto> getById(@PathVariable Long id) {
        return service.getPlanningById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PlanningDto> create(@RequestBody PlanningCreateDto dto) {
        PlanningDto created = service.createPlanning(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanningDto> update(
            @PathVariable Long id,
            @RequestBody PlanningCreateDto dto
    ) {
        try {
            PlanningDto updated = service.updatePlanning(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deletePlanning(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{planningId}/missions/{missionId}")
    public ResponseEntity<PlanningDto> addMission(
            @PathVariable Long planningId,
            @PathVariable Long missionId
    ) {
        try {
            PlanningDto updated = service.addMissionToPlanning(planningId, missionId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{planningId}/missions/{missionId}")
    public ResponseEntity<PlanningDto> removeMission(
            @PathVariable Long planningId,
            @PathVariable Long missionId
    ) {
        try {
            PlanningDto updated = service.removeMissionFromPlanning(planningId, missionId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
