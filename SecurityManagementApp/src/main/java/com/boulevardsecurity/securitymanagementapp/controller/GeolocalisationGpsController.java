package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.GeolocalisationGpsCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.GeolocalisationGpsDto;
import com.boulevardsecurity.securitymanagementapp.service.GeolocalisationGpsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/geolocalisations-gps")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class GeolocalisationGpsController {

    private final GeolocalisationGpsService service;

    /** Récupère toutes les géolocalisations */
    @GetMapping
    public ResponseEntity<List<GeolocalisationGpsDto>> getAll() {
        List<GeolocalisationGpsDto> list = service.getAll();
        return ResponseEntity.ok(list);
    }

    /** Récupère une géolocalisation par son ID */
    @GetMapping("/{id}")
    public ResponseEntity<GeolocalisationGpsDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Crée une nouvelle géolocalisation */
    @PostMapping
    public ResponseEntity<GeolocalisationGpsDto> create(
            @RequestBody GeolocalisationGpsCreateDto dto
    ) {
        GeolocalisationGpsDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** Met à jour une géolocalisation existante */
    @PutMapping("/{id}")
    public ResponseEntity<GeolocalisationGpsDto> update(
            @PathVariable Long id,
            @RequestBody GeolocalisationGpsCreateDto dto
    ) {
        try {
            GeolocalisationGpsDto updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Supprime une géolocalisation */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Lie une mission à une géolocalisation GPS.
     * Renvoie la liste des IDs de missions associées après mise à jour.
     */
    @PostMapping("/{gpsId}/missions/{missionId}")
    public ResponseEntity<List<Long>> addMission(
            @PathVariable Long gpsId,
            @PathVariable Long missionId
    ) {
        try {
            List<Long> missionIds = service.addMission(gpsId, missionId);
            return ResponseEntity.ok(missionIds);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
