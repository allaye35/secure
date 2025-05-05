package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeZone;
import com.boulevardsecurity.securitymanagementapp.dto.ZoneDeTravailCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ZoneDeTravailDto;
import com.boulevardsecurity.securitymanagementapp.service.ZoneDeTravailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ZoneDeTravailController {

    private final ZoneDeTravailService service;

    /** Crée une nouvelle zone */
    @PostMapping
    public ResponseEntity<ZoneDeTravailDto> create(@RequestBody ZoneDeTravailCreateDto dto) {
        try {
            ZoneDeTravailDto created = service.createZone(dto);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** Toutes les zones */
    @GetMapping
    public ResponseEntity<List<ZoneDeTravailDto>> getAll() {
        return ResponseEntity.ok(service.getAllZones());
    }

    /** Par ID */
    @GetMapping("/{id}")
    public ResponseEntity<ZoneDeTravailDto> getById(@PathVariable Long id) {
        return service.getZoneById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Recherche par nom (contains) */
    @GetMapping("/recherche")
    public ResponseEntity<List<ZoneDeTravailDto>> searchByName(@RequestParam String nom) {
        return ResponseEntity.ok(service.searchZonesByName(nom));
    }

    /** Recherche par type */
    @GetMapping("/type/{typeZone}")
    public ResponseEntity<List<ZoneDeTravailDto>> searchByType(@PathVariable TypeZone typeZone) {
        return ResponseEntity.ok(service.searchZonesByType(typeZone));
    }

    /** Mise à jour */
    @PutMapping("/{id}")
    public ResponseEntity<ZoneDeTravailDto> update(
            @PathVariable Long id,
            @RequestBody ZoneDeTravailCreateDto dto
    ) {
        try {
            ZoneDeTravailDto updated = service.updateZone(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Suppression */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deleteZone(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
