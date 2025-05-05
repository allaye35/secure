// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/RapportInterventionController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.RapportInterventionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.RapportInterventionDto;
import com.boulevardsecurity.securitymanagementapp.service.RapportInterventionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rapports")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class RapportInterventionController {

    private final RapportInterventionService service;

    @GetMapping
    public ResponseEntity<List<RapportInterventionDto>> getAll() {
        return ResponseEntity.ok(service.getAllRapports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RapportInterventionDto> getById(@PathVariable Long id) {
        return service.getRapportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mission/{missionId}")
    public ResponseEntity<List<RapportInterventionDto>> getByMission(
            @PathVariable Long missionId
    ) {
        return ResponseEntity.ok(service.getRapportsByMissionId(missionId));
    }

    @PostMapping
    public ResponseEntity<RapportInterventionDto> create(
            @RequestBody RapportInterventionCreateDto dto
    ) {
        RapportInterventionDto created = service.createRapport(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RapportInterventionDto> update(
            @PathVariable Long id,
            @RequestBody RapportInterventionCreateDto dto
    ) {
        try {
            RapportInterventionDto updated = service.updateRapport(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deleteRapport(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
