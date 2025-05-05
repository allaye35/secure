package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.SiteCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.SiteDto;
import com.boulevardsecurity.securitymanagementapp.service.SiteService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class SiteController {

    private static final Logger logger = LoggerFactory.getLogger(SiteController.class);
    
    private final SiteService siteService;

    /** Récupère tous les sites */
    @GetMapping
    public ResponseEntity<List<SiteDto>> getAll() {
        logger.info("GET /api/sites - Récupération de tous les sites");
        List<SiteDto> sites = siteService.getAllSites();
        logger.info("GET /api/sites - {} sites trouvés", sites.size());
        return ResponseEntity.ok(sites);
    }

    /** Récupère un site par son ID */
    @GetMapping("/{id}")
    public ResponseEntity<SiteDto> getById(@PathVariable Long id) {
        logger.info("GET /api/sites/{} - Récupération du site", id);
        return siteService.getSiteById(id)
                .map(site -> {
                    logger.info("GET /api/sites/{} - Site trouvé: {}", id, site.getNom());
                    return ResponseEntity.ok(site);
                })
                .orElseGet(() -> {
                    logger.warn("GET /api/sites/{} - Site non trouvé", id);
                    return ResponseEntity.notFound().build();
                });
    }

    /** Crée un nouveau site */
    @PostMapping
    public ResponseEntity<SiteDto> create(@RequestBody SiteCreateDto dto) {
        logger.info("POST /api/sites - Création d'un nouveau site: {}", dto.getNom());
        try {
            SiteDto created = siteService.createSite(dto);
            logger.info("POST /api/sites - Site créé avec l'ID: {}", created.getId());
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            logger.error("POST /api/sites - Erreur lors de la création du site", e);
            throw e;
        }
    }

    /** Met à jour un site existant */
    @PutMapping("/{id}")
    public ResponseEntity<SiteDto> update(
            @PathVariable Long id,
            @RequestBody SiteCreateDto dto
    ) {
        logger.info("PUT /api/sites/{} - Mise à jour du site: {}", id, dto.getNom());
        try {
            SiteDto updated = siteService.updateSite(id, dto);
            logger.info("PUT /api/sites/{} - Site mis à jour avec succès", id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.error("PUT /api/sites/{} - Erreur lors de la mise à jour du site: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /** Supprime un site */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        logger.info("DELETE /api/sites/{} - Suppression du site", id);
        try {
            siteService.deleteSite(id);
            logger.info("DELETE /api/sites/{} - Site supprimé avec succès", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("DELETE /api/sites/{} - Erreur lors de la suppression du site: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
