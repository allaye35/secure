package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.CarteProfessionnelleCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.CarteProfessionnelleDto;
import com.boulevardsecurity.securitymanagementapp.service.CarteProfessionnelleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cartes-professionnelles")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CarteProfessionnelleController {

    private final CarteProfessionnelleService service;

    @GetMapping
    public ResponseEntity<List<CarteProfessionnelleDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarteProfessionnelleDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<CarteProfessionnelleDto>> getByAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(service.getByAgent(agentId));
    }

    @PostMapping
    public ResponseEntity<CarteProfessionnelleDto> create(
            @RequestBody CarteProfessionnelleCreationDto dto
    ) {
        CarteProfessionnelleDto created = service.create(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarteProfessionnelleDto> update(
            @PathVariable Long id,
            @RequestBody CarteProfessionnelleDto dto
    ) {
        try {
            CarteProfessionnelleDto updated = service.update(id, dto);
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
