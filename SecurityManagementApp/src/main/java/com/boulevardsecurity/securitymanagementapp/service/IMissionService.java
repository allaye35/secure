package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.MissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.MissionDto;

import java.time.LocalDate;
import java.util.List;

/**
 * Contrat fonctionnel du service de gestion des missions (version francisée).
 */
public interface IMissionService {

    /* ──────────── Lecture ──────────── */

    /** Retourne la liste complète des missions. */
    List<MissionDto> listerToutes();

    /** Retourne le détail d’une mission à partir de son identifiant. */
    MissionDto obtenirParId(Long id);


    /* ──────────── Création ─────────── */

    /** Crée une mission (géocodage optionnel via l’adresse du site). */
    MissionDto creerMission(MissionCreateDto dto, String adresseSite);

    /** Crée une mission sans géocodage. */
    MissionDto creerMission(MissionCreateDto dto);
    
    /** Calcule les montants pour une mission sans la créer (pour simulation) */
    MissionDto simulerCalcul(MissionCreateDto dto);


    /* ─────────── Mise à jour ───────── */

    /** Mise à jour partielle avec possibilité de regéocoder. */
    MissionDto majMission(Long id, MissionCreateDto dto, String nouvelleAdresse);

    /** Mise à jour partielle sans regéocodage. */
    MissionDto majMission(Long id, MissionCreateDto dto);


    /* ─────────── Suppression ───────── */

    /** Supprime la mission et gère les notifications associées. */
    void supprimerMission(Long id);


    /* ─── Affectation / désaffectation ── */

    /** Affecte plusieurs agents à la mission. */
    MissionDto affecterAgents(Long idMission, List<Long> idsAgents);

    /** Retire un agent de la mission. */
    MissionDto retirerAgent(Long idMission, Long idAgent);


    /* ─────── Autres associations ────── */

    MissionDto associerRapport   (Long idMission, Long idRapport);
    MissionDto associerPlanning  (Long idMission, Long idPlanning);
    MissionDto associerSite      (Long idMission, Long idSite);
    MissionDto associerGeoloc    (Long idMission);


    /* ──────────── Recherches ────────── */

    List<MissionDto> missionsCommencantApres(LocalDate date);

    List<MissionDto> missionsFinissantAvant(LocalDate date);

    List<MissionDto> missionsParAgent(Long idAgent);

    List<MissionDto> missionsParPlanning(Long idPlanning);
    
    List<MissionDto> missionsParContrat(Long contratId);
    
    MissionDto associerContratDeTravail(Long idMission, Long idContrat);
    MissionDto associerFacture(Long idMission, Long idFacture);
    MissionDto dissocierGeoloc(Long idMission);
}
