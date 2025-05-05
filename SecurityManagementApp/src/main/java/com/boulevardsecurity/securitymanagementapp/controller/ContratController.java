package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.ContratCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDto;
import com.boulevardsecurity.securitymanagementapp.dto.ErrorResponseDto;
import com.boulevardsecurity.securitymanagementapp.service.ContratService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class ContratController {

    private final ContratService service;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ContratCreateDto dto) {
        try {
            ContratDto created = service.createContrat(dto);
            return ResponseEntity.status(201).body(created);
        } catch (IllegalArgumentException ex) {
            log.error("Erreur lors de la création du contrat", ex);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponseDto(400, ex.getMessage()));
        } catch (Exception ex) {
            log.error("Erreur inattendue lors de la création du contrat", ex);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponseDto(500, "Erreur serveur: " + ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ContratDto>> getAll() {
        return ResponseEntity.ok(service.getAllContrats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratDto> getById(@PathVariable Long id) {
        return service.getContratById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ref/{reference}")
    public ResponseEntity<ContratDto> getByReference(@PathVariable String reference) {
        return service.getContratByReference(reference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContratDto> update(
            @PathVariable Long id,
            @RequestBody ContratCreateDto dto
    ) {
        try {
            ContratDto updated = service.updateContrat(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deleteContrat(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
