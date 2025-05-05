package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.DisponibiliteCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.DisponibiliteDto;
import com.boulevardsecurity.securitymanagementapp.service.DisponibiliteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disponibilites")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class DisponibiliteController {

    private final DisponibiliteService service;

    @GetMapping
    public ResponseEntity<List<DisponibiliteDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisponibiliteDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<DisponibiliteDto>> getByAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(service.getByAgent(agentId));
    }

    @PostMapping
    public ResponseEntity<DisponibiliteDto> create(
            @RequestBody DisponibiliteCreationDto dto
    ) {
        DisponibiliteDto created = service.create(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DisponibiliteDto> update(
            @PathVariable Long id,
            @RequestBody DisponibiliteCreationDto dto
    ) {
        try {
            DisponibiliteDto updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
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
