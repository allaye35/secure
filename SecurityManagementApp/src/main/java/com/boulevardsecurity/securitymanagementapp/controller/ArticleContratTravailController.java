// src/main/java/com/boulevardsecurity/securitymanagementapp/controller/ArticleContratTravailController.java
package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratTravailDto;
import com.boulevardsecurity.securitymanagementapp.service.ArticleContratTravailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles-contrat-travail")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ArticleContratTravailController {

    private final ArticleContratTravailService service;

    /** Récupère tous les articles de contrat de travail */
    @GetMapping
    public ResponseEntity<List<ArticleContratTravailDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /** Récupère un article par son ID */
    @GetMapping("/{id}")
    public ResponseEntity<ArticleContratTravailDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Récupère les articles d’un contrat de travail donné */
    @GetMapping("/contrat-travail/{contratTravailId}")
    public ResponseEntity<List<ArticleContratTravailDto>> getByContratTravail(
            @PathVariable Long contratTravailId
    ) {
        return ResponseEntity.ok(service.getByContratTravail(contratTravailId));
    }

    /** Crée un nouvel article pour un contrat de travail */
    @PostMapping
    public ResponseEntity<ArticleContratTravailDto> create(
            @RequestBody ArticleContratTravailCreationDto dto
    ) {
        ArticleContratTravailDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** Met à jour un article existant */
    @PutMapping("/{id}")
    public ResponseEntity<ArticleContratTravailDto> update(
            @PathVariable Long id,
            @RequestBody ArticleContratTravailCreationDto dto
    ) {
        try {
            ArticleContratTravailDto updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Supprime un article */
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
