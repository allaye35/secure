package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.Enums.Role;
import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.service.AgentDeSecuriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AgentDeSecuriteController {

    private final AgentDeSecuriteService agentService;

    // ────────────────────────────────────────────────
    // 🔹 Tous les agents (DTO)
    // ────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<AgentDeSecuriteDto>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    // ────────────────────────────────────────────────
    // 🔹 Agent par ID (DTO)
    // ────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<AgentDeSecuriteDto> getAgentById(@PathVariable Long id) {
        return agentService.getAgentById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ────────────────────────────────────────────────
    // 🔹 Agent par Email (DTO)
    // ────────────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<AgentDeSecuriteDto> getAgentByEmail(@RequestParam String email) {
        return agentService.getAgentByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ────────────────────────────────────────────────
    // 🔹 Créer un agent (DTO creation)
    // ────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<AgentDeSecuriteDto> createAgent(
            @RequestBody AgentDeSecuriteCreationDto creationDto
    ) {
        AgentDeSecuriteDto saved = agentService.createAgent(creationDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ────────────────────────────────────────────────
    // 🔹 Mettre à jour un agent (DTO creation)
    // ────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<AgentDeSecuriteDto> updateAgent(
            @PathVariable Long id,
            @RequestBody AgentDeSecuriteCreationDto updateDto
    ) {
        try {
            AgentDeSecuriteDto updated = agentService.updateAgent(id, updateDto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // 🔹 Supprimer un agent
    // ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        try {
            agentService.deleteAgent(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // 🔹 Assigner une zone de travail (retourne DTO)
    // ────────────────────────────────────────────────
    @PutMapping("/{agentId}/zone/{zoneId}")
    public ResponseEntity<AgentDeSecuriteDto> assignZone(
            @PathVariable Long agentId,
            @PathVariable Long zoneId
    ) {
        try {
            AgentDeSecuriteDto dto = agentService.assignZoneDeTravail(agentId, zoneId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // 🔹 Ajouter une disponibilité (DTO create & DTO retour)
    // ────────────────────────────────────────────────
    @PostMapping("/{agentId}/disponibilites")
    public ResponseEntity<DisponibiliteDto> addDisponibilite(
            @PathVariable Long agentId,
            @RequestBody DisponibiliteCreationDto dispoDto
    ) {
        try {
            DisponibiliteDto created = agentService.ajouterDisponibilite(agentId, dispoDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // 🔹 Ajouter une carte professionnelle (DTO create & DTO retour)
    // ────────────────────────────────────────────────
    @PostMapping("/{agentId}/cartesProfessionnelles")
    public ResponseEntity<CarteProfessionnelleDto> addCarte(
            @PathVariable Long agentId,
            @RequestBody CarteProfessionnelleCreationDto carteDto
    ) {
        try {
            CarteProfessionnelleDto created = agentService.ajouterCarteProfessionnelle(agentId, carteDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // 🔹 Changer le rôle d’un agent (DTO retour)
    // ────────────────────────────────────────────────
    @PutMapping("/{agentId}/role")
    public ResponseEntity<AgentDeSecuriteDto> changeRole(
            @PathVariable Long agentId,
            @RequestParam Role role
    ) {
        try {
            AgentDeSecuriteDto updated = agentService.changeRole(agentId, role);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ────────────────────────────────────────────────
    // 🔹 Consulter son planning (DTO)
    // ────────────────────────────────────────────────
    @GetMapping("/{agentId}/planning")
    public ResponseEntity<PlanningDto> getPlanning(@PathVariable Long agentId) {
        return agentService.getPlanningByAgentId(agentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{agentId}/disponibilites/{disponibiliteId}")
    public ResponseEntity<AgentDeSecuriteDto> assignDisponibiliteExistante(
            @PathVariable Long agentId,
            @PathVariable Long disponibiliteId
    ) {
        try {
            AgentDeSecuriteDto dto = agentService.assignDisponibiliteExistante(agentId, disponibiliteId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/{agentId}/diplomesSsiap")
    public ResponseEntity<DiplomeSsiapDto> addDiplome(
            @PathVariable Long agentId,
            @RequestBody DiplomeSsiapCreationDto diplomeDto
    ) {
        try {
            DiplomeSsiapDto created = agentService.ajouterDiplomeSSIAP(agentId, diplomeDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    // Affecter une carte professionnelle existante à un agent
    @PutMapping("/{agentId}/cartesProfessionnelles/{carteId}")
    public ResponseEntity<AgentDeSecuriteDto> assignCarteExistante(
            @PathVariable Long agentId,
            @PathVariable Long carteId
    ) {
        try {
            AgentDeSecuriteDto dto = agentService.assignCarteExistante(agentId, carteId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Affecter un diplôme SSIAP existant à un agent
    @PutMapping("/{agentId}/diplomesSsiap/{diplomeId}")
    public ResponseEntity<AgentDeSecuriteDto> assignDiplomeExistante(
            @PathVariable Long agentId,
            @PathVariable Long diplomeId
    ) {
        try {
            AgentDeSecuriteDto dto = agentService.assignDiplomeExistante(agentId, diplomeId);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


}
