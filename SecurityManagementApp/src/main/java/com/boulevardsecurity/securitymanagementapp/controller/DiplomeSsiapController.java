package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.DiplomeSsiapCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.DiplomeSsiapDto;
import com.boulevardsecurity.securitymanagementapp.service.DiplomeSsiapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diplomes-ssiap")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class DiplomeSsiapController {

    private final DiplomeSsiapService service;

    @GetMapping
    public ResponseEntity<List<DiplomeSsiapDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiplomeSsiapDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<DiplomeSsiapDto>> getByAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(service.getByAgent(agentId));
    }

    @PostMapping
    public ResponseEntity<DiplomeSsiapDto> create(@RequestBody DiplomeSsiapCreationDto dto) {
        DiplomeSsiapDto created = service.create(dto);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiplomeSsiapDto> update(
            @PathVariable Long id,
            @RequestBody DiplomeSsiapCreationDto dto
    ) {
        try {
            DiplomeSsiapDto updated = service.update(id, dto);
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
