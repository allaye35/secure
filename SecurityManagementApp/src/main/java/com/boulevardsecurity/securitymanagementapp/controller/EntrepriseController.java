// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/EntrepriseController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.EntrepriseCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.EntrepriseDto;
import com.boulevardsecurity.securitymanagementapp.service.EntrepriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entreprises")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class EntrepriseController {

    private final EntrepriseService service;

    @PostMapping
    public ResponseEntity<EntrepriseDto> create(@RequestBody EntrepriseCreateDto dto) {
        EntrepriseDto created = service.createEntreprise(dto);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public ResponseEntity<List<EntrepriseDto>> getAll() {
        return ResponseEntity.ok(service.getAllEntreprises());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntrepriseDto> getById(@PathVariable Long id) {
        return service.getEntrepriseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nom/{nom}")
    public ResponseEntity<EntrepriseDto> getByNom(@PathVariable String nom) {
        return service.getEntrepriseByNom(nom)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PutMapping("/{id}")
    public ResponseEntity<EntrepriseDto> update(
            @PathVariable Long id,
            @RequestBody EntrepriseDto dto
    ) {
        try {
            EntrepriseDto updated = service.updateEntreprise(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deleteEntreprise(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
