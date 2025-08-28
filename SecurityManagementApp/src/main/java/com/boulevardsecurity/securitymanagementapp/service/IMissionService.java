package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.MissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.MissionDto;

import java.time.LocalDate;
import java.util.List;

public interface IMissionService {

    /* ──────────── Lecture ──────────── */
    List<MissionDto> listerToutes();
    MissionDto obtenirParId(Long id);

    /* 👇 NOUVEAU : toutes les missions non rattachées à un devis */
    List<MissionDto> missionsSansDevis();

    /* ──────────── Création ─────────── */
    MissionDto creerMission(MissionCreateDto dto, String adresseSite);
    MissionDto creerMission(MissionCreateDto dto);
    MissionDto simulerCalcul(MissionCreateDto dto);

    /* ─────────── Mise à jour ───────── */
    MissionDto majMission(Long id, MissionCreateDto dto, String nouvelleAdresse);
    MissionDto majMission(Long id, MissionCreateDto dto);

    /* ─────────── Suppression ───────── */
    void supprimerMission(Long id);

    /* ─── Affectation / désaffectation ── */
    MissionDto affecterAgents(Long idMission, List<Long> idsAgents);
    MissionDto retirerAgent(Long idMission, Long idAgent);

    /* ─────── Autres associations ────── */
    MissionDto associerRapport(Long idMission, Long idRapport);
    MissionDto associerPlanning(Long idMission, Long idPlanning);
    MissionDto associerSite(Long idMission, Long idSite);
    MissionDto associerGeoloc(Long idMission);
    MissionDto dissocierGeoloc(Long idMission);

    /* ──────────── Recherches ────────── */
    List<MissionDto> missionsCommencantApres(LocalDate date);
    List<MissionDto> missionsFinissantAvant(LocalDate date);
    List<MissionDto> missionsParAgent(Long idAgent);
    List<MissionDto> missionsParPlanning(Long idPlanning);
    List<MissionDto> missionsParContrat(Long contratId);

    MissionDto associerContratDeTravail(Long idMission, Long idContrat);
    MissionDto associerFacture(Long idMission, Long idFacture);
}
