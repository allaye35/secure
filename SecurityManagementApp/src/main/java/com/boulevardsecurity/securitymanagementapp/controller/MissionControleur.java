package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.api.ApiErreur;
import com.boulevardsecurity.securitymanagementapp.dto.MissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.MissionDto;
import com.boulevardsecurity.securitymanagementapp.service.IMissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/missions")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class MissionControleur {

    private final IMissionService serviceMission;

    /* ────────────── Helpers ────────────── */
    private ResponseEntity<ApiErreur> erreur(HttpStatus statut, String msg, HttpServletRequest req) {
        return ResponseEntity
                .status(statut)
                .body(new ApiErreur(
                        Instant.now(),
                        statut.value(),
                        statut.getReasonPhrase(),
                        msg,
                        req.getRequestURI()));
    }

    /* ────────────── Lecture ────────────── */

    @GetMapping
    public List<MissionDto> listerToutes() {
        return serviceMission.listerToutes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenirParId(@PathVariable Long id, HttpServletRequest req) {
        try {
            return ResponseEntity.ok(serviceMission.obtenirParId(id));
        } catch (NoSuchElementException ex) {
            return erreur(HttpStatus.NOT_FOUND, ex.getMessage(), req);
        }
    }
    
    /* ────────────── Simulation ────────────── */
    
    // Modifions l'endpoint pour éviter les conflits potentiels
    @CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.POST})
    @PostMapping("/simuler-calcul")
    public ResponseEntity<?> simulerCalculMontants(
            @Valid @RequestBody MissionCreateDto missionDto,
            HttpServletRequest req) {
        
        try {
            // Calculer les montants sans créer la mission
            MissionDto resultat = serviceMission.simulerCalcul(missionDto);
            return ResponseEntity.ok(resultat);
        } catch (IllegalArgumentException ex) {
            return erreur(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
        }
    }

    /* ────────────── Création ────────────── */

    @PostMapping
    public ResponseEntity<?> creerMission(
            @Valid @RequestBody MissionCreateDto missionDto,
            @RequestParam(value = "adresseSite", required = false) String adresseSite,
            HttpServletRequest req) {

        try {
            MissionDto cree = serviceMission.creerMission(missionDto, adresseSite);
            return ResponseEntity.status(HttpStatus.CREATED).body(cree);
        } catch (IllegalArgumentException ex) {
            return erreur(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
        }
    }

    /* ────────────── Mise à jour ────────────── */

    @PatchMapping("/{id}")
    public ResponseEntity<?> majMission(
            @PathVariable Long id,
            @Valid @RequestBody MissionCreateDto missionDto,
            @RequestParam(value = "nouvelleAdresse", required = false) String nouvelleAdresse,
            HttpServletRequest req) {

        try {
            return ResponseEntity.ok(serviceMission.majMission(id, missionDto, nouvelleAdresse));
        } catch (NoSuchElementException ex) {
            return erreur(HttpStatus.NOT_FOUND, ex.getMessage(), req);
        } catch (IllegalArgumentException ex) {
            return erreur(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
        }
    }

    /* ────────────── Suppression ────────────── */

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerMission(@PathVariable Long id, HttpServletRequest req) {
        try {
            serviceMission.supprimerMission(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException ex) {
            return erreur(HttpStatus.NOT_FOUND, ex.getMessage(), req);
        }
    }

    /* ───── Affectations & relations ───── */

    @PutMapping("/{id}/agents")
    public ResponseEntity<?> affecterAgents(@PathVariable Long id,
                                            @RequestBody List<Long> idsAgents,
                                            HttpServletRequest req) {
        try {
            return ResponseEntity.ok(serviceMission.affecterAgents(id, idsAgents));
        } catch (NoSuchElementException ex) {
            return erreur(HttpStatus.NOT_FOUND, ex.getMessage(), req);
        } catch (IllegalArgumentException ex) {
            return erreur(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
        }
    }

    @DeleteMapping("/{id}/agent/{idAgent}")
    public ResponseEntity<?> retirerAgent(@PathVariable Long id,
                                          @PathVariable Long idAgent,
                                          HttpServletRequest req) {
        try {
            return ResponseEntity.ok(serviceMission.retirerAgent(id, idAgent));
        } catch (RuntimeException ex) {
            return erreur(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
        }
    }

    @PutMapping("/{id}/rapport/{idRapport}")
    public ResponseEntity<?> associerRapport(@PathVariable Long id,
                                             @PathVariable Long idRapport,
                                             HttpServletRequest req) {
        try {
            return ResponseEntity.ok(serviceMission.associerRapport(id, idRapport));
        } catch (RuntimeException ex) {
            return erreur(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
        }
    }

    @PutMapping("/{id}/planning/{idPlanning}")
    public ResponseEntity<?> associerPlanning(@PathVariable Long id,
                                              @PathVariable Long idPlanning,
                                              HttpServletRequest req) {
        try {
            return ResponseEntity.ok(serviceMission.associerPlanning(id, idPlanning));
        } catch (NoSuchElementException ex) {
            return erreur(HttpStatus.NOT_FOUND, ex.getMessage(), req);
        }
    }

    @PutMapping("/{id}/site/{idSite}")
    public ResponseEntity<?> associerSite(@PathVariable Long id,
                                          @PathVariable Long idSite,
                                          HttpServletRequest req) {
        try {
            return ResponseEntity.ok(serviceMission.associerSite(id, idSite));
        } catch (NoSuchElementException ex) {
            return erreur(HttpStatus.NOT_FOUND, ex.getMessage(), req);
        }
    }

    @PutMapping("/{id}/geoloc")
    public ResponseEntity<?> associerGeoloc(@PathVariable Long id, HttpServletRequest req) {
        try {
            return ResponseEntity.ok(serviceMission.associerGeoloc(id));
        } catch (RuntimeException ex) {
            return erreur(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
        }
    }

    /* ────────────── Recherches ────────────── */

    @GetMapping("/apres")
    public List<MissionDto> missionsCommencantApres(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return serviceMission.missionsCommencantApres(date);
    }

    @GetMapping("/avant")
    public List<MissionDto> missionsFinissantAvant(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return serviceMission.missionsFinissantAvant(date);
    }

    @GetMapping("/agent/{idAgent}")
    public List<MissionDto> missionsParAgent(@PathVariable Long idAgent) {
        return serviceMission.missionsParAgent(idAgent);
    }

    @GetMapping("/planning/{idPlanning}")
    public List<MissionDto> missionsParPlanning(@PathVariable Long idPlanning) {
        return serviceMission.missionsParPlanning(idPlanning);
    }
    
    @GetMapping("/contrat/{contratId}")
    public List<MissionDto> missionsParContrat(@PathVariable Long contratId) {
        return serviceMission.missionsParContrat(contratId);
    }

    @PutMapping("/{idMission}/contrats-de-travail/{idContrat}")
    public ResponseEntity<?> associerContratDeTravail(
            @PathVariable Long idMission,
            @PathVariable Long idContrat,
            HttpServletRequest req) {
        try {
            MissionDto missionDto = serviceMission.associerContratDeTravail(idMission, idContrat);
            return ResponseEntity.ok(missionDto);
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage(), req);
        } catch (IllegalArgumentException e) {
            return erreur(HttpStatus.BAD_REQUEST, e.getMessage(), req);
        }
    }

    @PutMapping("/{idMission}/factures/{idFacture}")
    public ResponseEntity<?> associerFacture(
            @PathVariable Long idMission,
            @PathVariable Long idFacture,
            HttpServletRequest req) {
        try {
            MissionDto updated = serviceMission.associerFacture(idMission, idFacture);
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage(), req);
        } catch (IllegalArgumentException e) {
            return erreur(HttpStatus.BAD_REQUEST, e.getMessage(), req);
        }
    }

    /**
     * Supprime la géolocalisation associée à la mission
     */
    @DeleteMapping("/{id}/geoloc")
    public ResponseEntity<?> dissocierGeoloc(
            @PathVariable Long id,
            HttpServletRequest req
    ) {
        try {
            serviceMission.dissocierGeoloc(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException ex) {
            return erreur(HttpStatus.NOT_FOUND, ex.getMessage(), req);
        }
    }
}
