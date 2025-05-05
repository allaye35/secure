// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/ContratDeTravailController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailDto;
import com.boulevardsecurity.securitymanagementapp.service.ContratDeTravailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/contrats-de-travail")
@RequiredArgsConstructor
public class ContratDeTravailController {

    private final ContratDeTravailService service;

    @GetMapping
    public ResponseEntity<List<ContratDeTravailDto>> all() {
        return ResponseEntity.ok(service.getAllContrats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratDeTravailDto> one(@PathVariable Long id) {
        return service.getContratById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ContratDeTravailDto> create(
            @RequestBody ContratDeTravailCreationDto dto
    ) {
        ContratDeTravailDto created = service.createContrat(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContratDeTravailDto> update(
            @PathVariable Long id,
            @RequestBody ContratDeTravailCreationDto dto
    ) {
        try {
            ContratDeTravailDto updated = service.updateContrat(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteContrat(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/prolonger")
    public ResponseEntity<Void> prolonger(
            @PathVariable Long id,
            @RequestParam("nouvelleDateFin") LocalDate nouvelleDateFin
    ) {
        boolean ok = service.prolongerContrat(id, nouvelleDateFin);
        return ok
                ? ResponseEntity.ok().build()
                : ResponseEntity.badRequest().build();
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<ContratDeTravailDto>> byAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(service.getContratsByAgentId(agentId));
    }
}
