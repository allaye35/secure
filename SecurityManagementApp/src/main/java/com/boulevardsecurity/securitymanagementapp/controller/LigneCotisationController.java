// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/LigneCotisationController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.LigneCotisationCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.LigneCotisationDto;
import com.boulevardsecurity.securitymanagementapp.service.LigneCotisationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lignes-cotisation")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class LigneCotisationController {

    private final LigneCotisationService service;

    @GetMapping
    public ResponseEntity<List<LigneCotisationDto>> all() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LigneCotisationDto> byId(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/fiche/{ficheId}")
    public ResponseEntity<List<LigneCotisationDto>> byFiche(
            @PathVariable Long ficheId
    ) {
        return ResponseEntity.ok(service.getByFicheDePaieId(ficheId));
    }

    @PostMapping
    public ResponseEntity<LigneCotisationDto> create(
            @RequestBody LigneCotisationCreationDto dto
    ) {
        LigneCotisationDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LigneCotisationDto> update(
            @PathVariable Long id,
            @RequestBody LigneCotisationCreationDto dto
    ) {
        try {
            LigneCotisationDto updated = service.update(id, dto);
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
