package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.FactureCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.FactureDto;
import com.boulevardsecurity.securitymanagementapp.mapper.FactureMapper;
import com.boulevardsecurity.securitymanagementapp.model.Client;
import com.boulevardsecurity.securitymanagementapp.model.Devis;
import com.boulevardsecurity.securitymanagementapp.model.Facture;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.Enums.StatutFacture;
import com.boulevardsecurity.securitymanagementapp.repository.ClientRepository;
import com.boulevardsecurity.securitymanagementapp.repository.DevisRepository;
import com.boulevardsecurity.securitymanagementapp.repository.FactureRepository;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import com.boulevardsecurity.securitymanagementapp.service.FactureService;
import com.boulevardsecurity.securitymanagementapp.service.TarificationDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FactureServiceImpl implements FactureService {

    private final FactureRepository repo;
    private final FactureMapper mapper;
    private final DevisRepository repDevis;
    private final ClientRepository clientRepository;
    private final MissionRepository missionRepository;
    private final TarificationDomainService tarification;

    @Autowired
    private TemplateEngine templateEngine;

    /* ---------- utilitaires ---------- */
    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

    /* ================= CRUD de base ================= */

    @Override
    public FactureDto create(FactureCreateDto dto) {
        Facture entity = mapper.toEntity(dto);
        Facture saved = repo.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public List<FactureDto> findAll() {
        return repo.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    public Optional<FactureDto> findById(Long id) {
        return repo.findById(id).map(mapper::toDto);
    }

    @Override
    public Optional<FactureDto> findByReference(String reference) {
        return repo.findByReferenceFacture(reference).map(mapper::toDto);
    }

    @Override
    public FactureDto update(Long id, FactureCreateDto dto) {
        Facture updated = repo.findById(id)
                .map(existing -> {
                    Facture rebuilt = mapper.toEntity(dto);
                    rebuilt.setId(existing.getId());
                    return repo.save(rebuilt);
                })
                .orElseThrow(() -> new IllegalArgumentException("Facture introuvable id=" + id));
        return mapper.toDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Facture introuvable id=" + id);
        repo.deleteById(id);
    }

    /* ================= Génération métier ================= */

    /**
     * Crée une facture à partir d'un devis existant.
     * On calcule HT/TVA/TTC sur chaque mission UNE SEULE FOIS, puis on agrège
     * les champs posés (et non un nouveau calcul).
     */
    @Transactional
    public Facture creerDepuisDevis(Long devisId) {
        Devis d = repDevis.findById(devisId)
                .orElseThrow(() -> new IllegalArgumentException("Devis introuvable id=" + devisId));

        List<Mission> missions = Optional.ofNullable(d.getMissions()).orElseGet(List::of);
        if (missions.isEmpty()) {
            // facture "vide" autorisée ou non ? Ici on autorise avec montants à 0.
        }

        // 1) Poser les montants sur chaque mission (HT/TVA/TTC)
        appliquerChiffrageSurMissions(missions);

        // 2) Agréger les valeurs déjà posées (gère des TVA différentes par mission)
        BigDecimal totalHT  = missions.stream().map(Mission::getMontantHT).map(FactureServiceImpl::nz)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTVA = missions.stream().map(Mission::getMontantTVA).map(FactureServiceImpl::nz)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTTC = missions.stream().map(Mission::getMontantTTC).map(FactureServiceImpl::nz)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Facture f = Facture.builder()
                .referenceFacture(genererReference())
                .dateEmission(LocalDate.now())
                .statut(StatutFacture.EN_ATTENTE)
                .montantHT(totalHT)
                .montantTVA(totalTVA)
                .montantTTC(totalTTC)
                .devis(d)
                .entreprise(d.getEntreprise())
                .client(d.getClient())
                .missions(missions)
                .build();

        return repo.save(f);
    }

    /**
     * Crée une facture pour un client sur une période donnée.
     * Idem : on pose d'abord HT/TVA/TTC sur chaque mission, puis on agrège.
     */
    @Transactional
    public Facture creerPourClientEtPeriode(Long clientId, LocalDate debut, LocalDate fin) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable id=" + clientId));

        List<Mission> missions = missionRepository
                .findByDevis_Client_IdAndDateDebutBetween(clientId, debut, fin);

        if (missions.isEmpty()) {
            throw new IllegalArgumentException("Aucune mission trouvée pour ce client dans la période spécifiée");
        }

        // 1) Poser HT/TVA/TTC sur chaque mission
        appliquerChiffrageSurMissions(missions);

        // 2) Agréger les montants posés
        BigDecimal totalHT  = missions.stream().map(Mission::getMontantHT).map(FactureServiceImpl::nz)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTVA = missions.stream().map(Mission::getMontantTVA).map(FactureServiceImpl::nz)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTTC = missions.stream().map(Mission::getMontantTTC).map(FactureServiceImpl::nz)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var entreprise = missions.get(0).getDevis() != null ? missions.get(0).getDevis().getEntreprise() : null;

        Facture f = Facture.builder()
                .referenceFacture(genererReference())
                .dateEmission(LocalDate.now())
                .statut(StatutFacture.EN_ATTENTE)
                .montantHT(totalHT)
                .montantTVA(totalTVA)
                .montantTTC(totalTTC)
                .client(client)
                .entreprise(entreprise)
                .missions(missions)
                .build();

        return repo.save(f);
    }

    /**
     * Pose HT/TVA/TTC sur une mission selon les règles de TarificationDomainService.
     * (On ne persistait auparavant qu'à l'intérieur de cette méthode mission par mission.
     *  Ici on laisse l'appelant faire un saveAll après la boucle pour limiter les I/O.)
     */
    private void appliquerChiffrage(Mission m) {
        BigDecimal ht   = tarification.montantHT(m);
        BigDecimal taux = m.getTarif().getTauxTVA();
        BigDecimal tva  = tarification.tva(ht, taux);
        BigDecimal ttc  = tarification.ttc(ht, tva);

        m.setMontantHT(ht);
        m.setMontantTVA(tva);
        m.setMontantTTC(ttc);
    }

    /** Applique le chiffrage à une liste puis persiste en une seule fois. */
    private void appliquerChiffrageSurMissions(List<Mission> missions) {
        if (missions == null || missions.isEmpty()) return;
        missions.forEach(this::appliquerChiffrage);
        missionRepository.saveAll(missions); // un seul batch d'écritures
    }

    /** Génère une référence unique pour une facture. */
    private String genererReference() {
        return "FACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /* ================= PDF ================= */

    @Override
    public byte[] generatePdf(Long id) {
        Facture facture = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Facture non trouvée avec l'ID: " + id));

        Client client = facture.getClient();
        if (client == null) {
            throw new IllegalStateException("Client non trouvé pour la facture: " + id);
        }

        try {
            Context context = new Context();
            context.setVariable("facture", facture);
            context.setVariable("client", client);
            context.setVariable("missions", facture.getMissions());
            context.setVariable("dateEmission",
                    facture.getDateEmission().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            LocalDate dateEcheance = LocalDate.now().plusDays(30);
            context.setVariable("dateEcheance",
                    dateEcheance.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            context.setVariable("montantTotal", facture.getMontantTTC());

            String htmlContent = templateEngine.process("facture-template", context);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
            outputStream.close();

            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }
}
