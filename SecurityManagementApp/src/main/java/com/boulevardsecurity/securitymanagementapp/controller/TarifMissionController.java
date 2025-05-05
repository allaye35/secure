// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/TarifMissionController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.TarifMissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.TarifMissionDto;
import com.boulevardsecurity.securitymanagementapp.service.TarifMissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarifs")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class TarifMissionController {

    private final TarifMissionService service;

    /** Créer un nouveau tarif (avec DTO) */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody TarifMissionCreateDto dto) {
        try {
            TarifMissionDto created = service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Lister tous les tarifs */
    @GetMapping
    public ResponseEntity<List<TarifMissionDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /** Récupérer un tarif par ID */
    @GetMapping("/{id}")
    public ResponseEntity<TarifMissionDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Récupérer un tarif par type de mission */
    @GetMapping("/type/{type}")
    public ResponseEntity<TarifMissionDto> getByType(@PathVariable String type) {
        return service.getByType(type)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Mettre à jour un tarif existant */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody TarifMissionDto dto
    ) {
        try {
            TarifMissionDto updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /** Supprimer un tarif */
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
