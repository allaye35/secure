package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import com.boulevardsecurity.securitymanagementapp.dto.MissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.MissionDto;
import com.boulevardsecurity.securitymanagementapp.mapper.MissionMapper;
import com.boulevardsecurity.securitymanagementapp.model.*;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import com.boulevardsecurity.securitymanagementapp.service.GeocodingService;
import com.boulevardsecurity.securitymanagementapp.service.IMissionService;
import com.boulevardsecurity.securitymanagementapp.service.NotificationService;
import com.boulevardsecurity.securitymanagementapp.service.TarificationDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceMissionImpl implements IMissionService {

    /* ─────────────── Dépendances ─────────────── */
    private final MissionRepository             repMission;
    private final AgentDeSecuriteRepository     repAgent;
    private final RapportInterventionRepository repRapport;
    private final PlanningRepository            repPlanning;
    private final SiteRepository                repSite;
    private final TarifMissionRepository        repTarif;
    private final DevisRepository               repDevis;
    private final GeolocalisationGPSRepository  repGeoloc;
    private final GeocodingService              svcGeocodage;
    private final NotificationService           svcNotif;
    private final MissionMapper                 mappeur;
    private final ContratDeTravailRepository    contratDeTravailRepository;
    private final FactureRepository             factureRepository;
    private final TarificationDomainService     tarificationService;

    /* ─────────────── Lecture ─────────────── */
    @Override public List<MissionDto> listerToutes() {
        return repMission.findAll().stream().map(mappeur::toDto).toList();
    }
    @Override public MissionDto obtenirParId(Long id) {

        return mappeur.toDto(trouverMission(id));
    }

    /* ─────────────── Création ─────────────── */
    @Override
    public MissionDto creerMission(MissionCreateDto dto, String adresseSite) {

        Mission mission = mappeur.toEntity(dto);

        // Géolocalisation facultative
        if (adresseSite != null && !adresseSite.isBlank()) {
            mission.setGeolocalisationGPS(creerEtSauverGeoloc(adresseSite));
        }

        // --- Tarifs / devis (devis optionnel) ---
TarifMission tarif = repTarif.findById(dto.getTarifMissionId())
        .orElseThrow(() -> new NoSuchElementException("Tarif introuvable id=" + dto.getTarifMissionId()));
mission.setTarif(tarif);

if (dto.getDevisId() != null) {
    Devis devis = repDevis.findById(dto.getDevisId())
            .orElseThrow(() -> new NoSuchElementException("Devis introuvable id=" + dto.getDevisId()));
    mission.setDevis(devis);
} else {
    mission.setDevis(null); // explicite (facultatif)
}
        appliquerChiffrage(mission, tarif);

        Mission sauvegardee = repMission.save(mission);
        notifierAgentsNouvelleMission(sauvegardee);
        return mappeur.toDto(sauvegardee);
    }
    @Override public MissionDto creerMission(MissionCreateDto dto){ return creerMission(dto,null); }

    /* ─────────────── Mise à jour ─────────────── */
    @Override
    public MissionDto majMission(Long id, MissionCreateDto dto, String nouvelleAdresse) {
        Mission existante = trouverMission(id);
        mappeur.updateEntityFromDto(dto, existante);

        if (nouvelleAdresse != null && !nouvelleAdresse.isBlank()) {
            existante.setGeolocalisationGPS(creerEtSauverGeoloc(nouvelleAdresse));
        }
        if (dto.getTarifMissionId() != null || dto.getQuantite() != null) {
            TarifMission nouveauTarif = repTarif.findById(existante.getTarif().getId())
                    .orElseThrow(() -> new NoSuchElementException("Tarif introuvable id=" + existante.getTarif().getId()));
            appliquerChiffrage(existante, nouveauTarif);
        }
        Mission sauvegardee = repMission.save(existante);
        notifierAgentsMajMission(sauvegardee);
        return mappeur.toDto(sauvegardee);
    }
    @Override public MissionDto majMission(Long id, MissionCreateDto dto){ return majMission(id,dto,null); }

    /* ─────────────── Suppression ─────────────── */
    @Override public void supprimerMission(Long id){
        Mission m = trouverMission(id);
        notifierAgentsSuppression(m);
        repMission.delete(m);
    }

    /* ───── Affectation / retrait d’agents ───── */
    @Override
    public MissionDto affecterAgents(Long idMission, List<Long> idsAgents) {
        Mission mission = trouverMission(idMission);
        List<AgentDeSecurite> agents = repAgent.findAllById(idsAgents);

        for (AgentDeSecurite agent : agents) {
            validerAgentAvantAffectation(agent, mission);
            mission.getAgents().add(agent);
            agent.getMissions().add(mission);
            notifierAgentAffectation(agent, mission);
        }
        repMission.save(mission);
        repAgent.saveAll(agents);
        return mappeur.toDto(mission);
    }

    @Override
    public MissionDto retirerAgent(Long idMission, Long idAgent) {
        Mission mission = trouverMission(idMission);
        AgentDeSecurite agent = repAgent.findById(idAgent)
                .orElseThrow(() -> new NoSuchElementException("Agent introuvable id=" + idAgent));

        if (!mission.getAgents().remove(agent))
            throw new IllegalStateException("Agent non affecté à cette mission");

        agent.getMissions().remove(mission);
        repMission.save(mission); repAgent.save(agent);
        notifierAgentRetrait(agent, mission);
        return mappeur.toDto(mission);
    }

    /* ───── Autres associations (planning, site…) ───── */
    @Override public MissionDto associerRapport(Long idM, Long idR){
        Mission m = trouverMission(idM);
        RapportIntervention r = repRapport.findById(idR)
                .orElseThrow(() -> new NoSuchElementException("Rapport introuvable id="+idR));
        if (LocalDateTime.now().isBefore(m.getDateDebut().atStartOfDay()))
            throw new IllegalArgumentException("Rapport avant le début de mission");
        m.getRapports().add(r);
        repMission.save(m);
        return mappeur.toDto(m);
    }
    @Override public MissionDto associerPlanning(Long idM, Long idP){
        Mission m = trouverMission(idM);
        Planning p = repPlanning.findById(idP)
                .orElseThrow(() -> new NoSuchElementException("Planning introuvable id="+idP));
        m.setPlanning(p); repMission.save(m); return mappeur.toDto(m);
    }
    @Override public MissionDto associerSite(Long idM, Long idS){
        Mission m = trouverMission(idM);
        Site s = repSite.findById(idS)
                .orElseThrow(() -> new NoSuchElementException("Site introuvable id="+idS));
        m.setSite(s); repMission.save(m); return mappeur.toDto(m);
    }
    @Override public MissionDto associerGeoloc(Long idM){
        Mission m = trouverMission(idM);
        Site s = m.getSite();
        if (s == null) throw new IllegalStateException("Mission sans site");
        String adresse = Stream.of(s.getNumero(), s.getRue(), s.getCodePostal(),
                        s.getVille(), s.getDepartement(),
                        s.getRegion(), s.getPays())
                .filter(Objects::nonNull).filter(v -> !v.isBlank())
                .collect(Collectors.joining(" "));
        m.setGeolocalisationGPS(creerEtSauverGeoloc(adresse));
        repMission.save(m);
        return mappeur.toDto(m);
    }
    @Override
    public MissionDto dissocierGeoloc(Long idMission) {
        Mission mission = trouverMission(idMission);
        if (mission.getGeolocalisationGPS() != null) {
            // on peut supprimer physiquement ou juste vider la référence
            // repGeoloc.delete(mission.getGeolocalisationGPS());
            mission.setGeolocalisationGPS(null);
            repMission.save(mission);
        }
        return mappeur.toDto(mission);
    }

    /* ─────────────── Recherches simples ─────────────── */
    @Override public List<MissionDto> missionsCommencantApres(LocalDate d){
        return repMission.findByDateDebutAfter(d).stream().map(mappeur::toDto).toList();
    }
    @Override public List<MissionDto> missionsFinissantAvant(LocalDate d){
        return repMission.findByDateFinBefore(d).stream().map(mappeur::toDto).toList();
    }
    @Override public List<MissionDto> missionsParAgent(Long idAg){
        return repMission.findByAgents_Id(idAg).stream().map(mappeur::toDto).toList();
    }
    @Override public List<MissionDto> missionsParPlanning(Long idP){
        return repMission.findByPlanning_Id(idP).stream().map(mappeur::toDto).toList();
    }

    @Override
    public List<MissionDto> missionsParContrat(Long contratId) {
        return repMission.findByContrat_Id(contratId).stream()
                .map(mappeur::toDto)
                .toList();
    }

    @Override
    public MissionDto simulerCalcul(MissionCreateDto dto) {
        // Créer une mission temporaire pour simulation sans la persister
        Mission mission = mappeur.toEntity(dto);
        
        // Récupérer le tarif
        TarifMission tarif = repTarif.findById(dto.getTarifMissionId())
                .orElseThrow(() -> new NoSuchElementException("Tarif introuvable id=" + dto.getTarifMissionId()));
        
        mission.setTarif(tarif);
        
        // Appliquer les calculs via le service de tarification
        appliquerChiffrage(mission, tarif);
        
        // Retourner le DTO sans sauvegarder la mission
        return mappeur.toDto(mission);
    }

    /* ─────────────── Outils privés ─────────────── */
    private Mission trouverMission(Long id){
        return repMission.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Mission introuvable id="+id));
    }
    private GeolocalisationGPS creerEtSauverGeoloc(String adresse){
        GeoPoint pt = svcGeocodage.getCoordinatesFromAddress(adresse);
        GeolocalisationGPS geo = GeolocalisationGPS.builder()
                .position(pt).gps_precision(5f).build();
        repGeoloc.save(geo);
        return geo;
    }
    private void appliquerChiffrage(Mission m, TarifMission t){
        // Utilise le service de tarification pour calculer le montant HT en tenant compte des majorations
        BigDecimal ht = tarificationService.montantHT(m);
        // Calcule la TVA en utilisant le taux du tarif mission
        BigDecimal tva = tarificationService.tva(ht, t.getTauxTVA());
        // Stocke les montants calculés dans la mission
        m.setMontantHT(ht);
        m.setMontantTVA(tva);
        m.setMontantTTC(tarificationService.ttc(ht, tva));
    }

    /* ─────────────── Notifications ─────────────── */
    private void notifierAgentsNouvelleMission(Mission m){
        m.getAgents().forEach(a -> envoyerNotif(a,
                "[Nouvelle mission] "+m.getTitre(),
                "Bonjour "+a.getNom()+",\nUne nouvelle mission vous est attribuée."));
    }
    private void notifierAgentsMajMission(Mission m){
        String dates = m.getDateDebut()+" → "+m.getDateFin();
        m.getAgents().forEach(a -> envoyerNotif(a,
                "[Mise à jour] "+m.getTitre(),
                "Bonjour "+a.getNom()+",\nLa mission a été mise à jour (« "+dates+" »)."));
    }
    private void notifierAgentsSuppression(Mission m){
        m.getAgents().forEach(a -> envoyerNotif(a,
                "[Suppression] "+m.getTitre(),
                "Bonjour "+a.getNom()+",\nLa mission a été supprimée."));
    }
    private void notifierAgentAffectation(AgentDeSecurite a, Mission m){
        envoyerNotif(a, "[Affectation] "+m.getTitre(),
                "Bonjour "+a.getNom()+",\nVous êtes affecté(e) à la mission.");
    }
    private void notifierAgentRetrait(AgentDeSecurite a, Mission m){
        envoyerNotif(a, "[Retrait] "+m.getTitre(),
                "Bonjour "+a.getNom()+",\nVous n’êtes plus affecté(e) à la mission.");
    }
    private void envoyerNotif(AgentDeSecurite a, String sujet, String corps){
        if (a.getEmail()     != null && !a.getEmail().isBlank()) svcNotif.sendEmail(a.getEmail(), sujet, corps);
        if (a.getTelephone() != null && !a.getTelephone().isBlank()) svcNotif.sendSMS(a.getTelephone(), corps);
    }

    /* ─────────────── Validations ─────────────── */
    private void validerAgentAvantAffectation(AgentDeSecurite a, Mission m){
        if (!zoneCompatible(a, m))                     throw new IllegalArgumentException("Zone incompatible");
        if (!disponible(a, m))                         throw new IllegalArgumentException("Indisponible");
        if (conflitPlanning(a, m))                     throw new IllegalArgumentException("Conflit planning");
        if (!carteProValide(a, m.getTypeMission()))    throw new IllegalArgumentException("Carte pro invalide");
        if (!diplomeSSIAPValide(a, m.getTypeMission()))throw new IllegalArgumentException("Diplôme SSIAP manquant");
    }

    /* ---------- helpers validation ---------- */
    private static boolean egIc(String a, String b){
        return a != null && b != null && a.equalsIgnoreCase(b);
    }

    /** Si la mission n’a pas encore de site, on accepte l’affectation. */
    private boolean zoneCompatible(AgentDeSecurite a, Mission m){
        Site s = m.getSite();
        if (s == null) return true;                            // ← modifié

        return a.getZonesDeTravail().stream().anyMatch(z ->
                egIc(z.getVille(),       s.getVille())      ||
                        egIc(z.getDepartement(), s.getDepartement())||
                        egIc(z.getCodePostal(),  s.getCodePostal()) ||
                        egIc(z.getRegion(),      s.getRegion())     ||
                        egIc(z.getPays(),        s.getPays()));
    }

    /** Disponibilité valide si elle **chevauche** la mission. */
    private boolean disponible(AgentDeSecurite a, Mission m){
        LocalDateTime deb = LocalDateTime.of(m.getDateDebut(),
                Optional.ofNullable(m.getHeureDebut()).orElse(LocalTime.MIN));
        LocalDateTime fin = LocalDateTime.of(m.getDateFin(),
                Optional.ofNullable(m.getHeureFin()).orElse(LocalTime.MAX));

        return a.getDisponibilites().stream().anyMatch(d -> {
            LocalDateTime ds = d.getDateDebut().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            LocalDateTime de = d.getDateFin().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            return !fin.isBefore(ds) && !deb.isAfter(de);      // ← chevauchement
        });
    }

    private boolean conflitPlanning(AgentDeSecurite a, Mission m){
        LocalDateTime ns = LocalDateTime.of(m.getDateDebut(),
                Optional.ofNullable(m.getHeureDebut()).orElse(LocalTime.MIN));
        LocalDateTime ne = LocalDateTime.of(m.getDateFin(),
                Optional.ofNullable(m.getHeureFin()).orElse(LocalTime.MAX));
        return a.getMissions().stream().anyMatch(x -> {
            LocalDateTime s = LocalDateTime.of(x.getDateDebut(),
                    Optional.ofNullable(x.getHeureDebut()).orElse(LocalTime.MIN));
            LocalDateTime e = LocalDateTime.of(x.getDateFin(),
                    Optional.ofNullable(x.getHeureFin()).orElse(LocalTime.MAX));
            return !(ne.isBefore(s) || ns.isAfter(e));
        });
    }

    private boolean carteProValide(AgentDeSecurite a, TypeMission t){
        return a.getCartesProfessionnelles().stream()
                .anyMatch(c -> c.getTypeCarte().name().equals(t.name()) && c.getDateFin().after(new Date()));
    }

    private boolean diplomeSSIAPValide(AgentDeSecurite a, TypeMission t){
        if (!t.name().startsWith("SSIAP")) return true;
        return a.getDiplomesSSIAP().stream()
                .anyMatch(d -> d.getNiveau().name().equals(t.name()) && d.getDateExpiration().after(new Date()));
    }

    @Override
    public MissionDto associerContratDeTravail(Long idMission, Long idContrat) {
        Mission mission = trouverMission(idMission);
        ContratDeTravail contrat = contratDeTravailRepository.findById(idContrat)
                .orElseThrow(() -> new NoSuchElementException("Contrat de travail introuvable id=" + idContrat));

        contrat.setMission(mission);
        mission.getContratsDeTravail().add(contrat);

        repMission.save(mission);
        return mappeur.toDto(mission);
    }

    @Override
    public MissionDto associerFacture(Long idMission, Long idFacture) {
        Mission mission = trouverMission(idMission);
        Facture facture = factureRepository.findById(idFacture)
                .orElseThrow(() -> new NoSuchElementException("Facture introuvable id=" + idFacture));

        mission.getFactures().add(facture);
        facture.getMissions().add(mission); // bidirectionnel, si nécessaire

        repMission.save(mission);
        return mappeur.toDto(mission);
    }
 /* 👇 NOUVEAU : missions sans devis (global) */
    @Override
    public List<MissionDto> missionsSansDevis() {
        return repMission.findAll().stream()
                .filter(m -> m.getDevis() == null) // non rattachées à un devis
                .map(mappeur::toDto)
                .toList();
    }

}
