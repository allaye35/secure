package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.FactureCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.FactureDto;
import com.boulevardsecurity.securitymanagementapp.dto.PeriodeFacturationDto;
import com.boulevardsecurity.securitymanagementapp.model.Facture;
import com.boulevardsecurity.securitymanagementapp.service.FactureService;
import com.boulevardsecurity.securitymanagementapp.service.impl.FactureServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class FactureController {

    private final FactureService service;
    private final FactureServiceImpl serviceImpl;

    /** Crée une nouvelle facture */
    @PostMapping
    public ResponseEntity<FactureDto> create(@RequestBody FactureCreateDto dto) {
        FactureDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** Récupère toutes les factures */
    @GetMapping
    public ResponseEntity<List<FactureDto>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    /** Récupère une facture par son ID */
    @GetMapping("/{id}")
    public ResponseEntity<FactureDto> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Récupère une facture par sa référence */
    @GetMapping("/reference/{ref}")
    public ResponseEntity<FactureDto> getByReference(@PathVariable String ref) {
        return service.findByReference(ref)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Met à jour une facture existante */
    @PutMapping("/{id}")
    public ResponseEntity<FactureDto> update(
            @PathVariable Long id,
            @RequestBody FactureCreateDto dto
    ) {
        try {
            FactureDto updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Supprime une facture */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /** Crée une facture pour un client sur une période donnée */
    @PostMapping("/periode")
    public ResponseEntity<?> createForPeriod(@RequestBody PeriodeFacturationDto periodeDto) {
        try {
            Facture facture = serviceImpl.creerPourClientEtPeriode(
                periodeDto.getClientId(), 
                periodeDto.getDateDebut(), 
                periodeDto.getDateFin()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(service.findById(facture.getId()).get());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la création de la facture: " + e.getMessage());
        }
    }
    
    /** Crée une facture à partir d'un devis */
    @PostMapping("/from-devis/{devisId}")
    public ResponseEntity<?> createFromDevis(@PathVariable Long devisId) {
        try {
            Facture facture = serviceImpl.creerDepuisDevis(devisId);
            return ResponseEntity.status(HttpStatus.CREATED).body(service.findById(facture.getId()).get());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la création de la facture: " + e.getMessage());
        }
    }
}
