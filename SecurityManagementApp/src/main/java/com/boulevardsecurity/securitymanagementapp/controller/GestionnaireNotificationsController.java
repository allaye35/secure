// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/GestionnaireNotificationsController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.service.GestionnaireNotificationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class GestionnaireNotificationsController {

    private final GestionnaireNotificationsService service;

    @GetMapping
    public ResponseEntity<List<GestionnaireNotificationsDto>> all() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GestionnaireNotificationsDto> byId(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<GestionnaireNotificationsDto>> byAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(service.getByAgent(agentId));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<GestionnaireNotificationsDto>> byClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(service.getByClient(clientId));
    }

    @PostMapping
    public ResponseEntity<GestionnaireNotificationsDto> create(
            @RequestBody GestionnaireNotificationsCreateDto dto
    ) {
        return ResponseEntity.status(201).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GestionnaireNotificationsDto> update(
            @PathVariable Long id,
            @RequestBody GestionnaireNotificationsCreateDto dto
    ) {
        try {
            return ResponseEntity.ok(service.update(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
