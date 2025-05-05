// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/FicheDePaieController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.service.FicheDePaieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fiches-paie")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class FicheDePaieController {

    private final FicheDePaieService service;

    @PostMapping
    public ResponseEntity<FicheDePaieDto> create(@RequestBody FicheDePaieCreationDto dto) {
        FicheDePaieDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FicheDePaieDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<FicheDePaieDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<FicheDePaieDto> update(
            @PathVariable Long id,
            @RequestBody FicheDePaieCreationDto dto
    ) {
        try {
            FicheDePaieDto updated = service.update(id, dto);
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
