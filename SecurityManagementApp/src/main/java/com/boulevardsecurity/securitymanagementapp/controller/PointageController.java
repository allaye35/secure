// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/PointageController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.PointageCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.PointageDto;
import com.boulevardsecurity.securitymanagementapp.service.PointageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/pointages")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PointageController {

    private final PointageService service;

    @GetMapping
    public ResponseEntity<List<PointageDto>> recupererTous() {
        return ResponseEntity.ok(service.recupererTousLesPointages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PointageDto> recupererParId(@PathVariable Long id) {
        return service.recupererPointageParId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/mission/{idMission}")
    public ResponseEntity<List<PointageDto>> recupererParMission(@PathVariable Long idMission) {
        return ResponseEntity.ok(service.recupererPointagesParMission(idMission));
    }

    @PostMapping
    public ResponseEntity<PointageDto> creer(@RequestBody PointageCreateDto dto) {
        try {
            PointageDto cree = service.creerPointage(dto);
            return ResponseEntity.ok(cree);
        } catch (IllegalArgumentException | NoSuchElementException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PointageDto> modifier(
            @PathVariable Long id,
            @RequestBody PointageCreateDto dto
    ) {
        try {
            PointageDto modifie = service.modifierPointage(id, dto);
            return ResponseEntity.ok(modifie);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        try {
            service.supprimerPointage(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
