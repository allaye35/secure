package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.FactureCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.FactureDto;
import com.boulevardsecurity.securitymanagementapp.mapper.FactureMapper;
import com.boulevardsecurity.securitymanagementapp.model.Devis;
import com.boulevardsecurity.securitymanagementapp.model.Facture;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.Client;
import com.boulevardsecurity.securitymanagementapp.Enums.StatutFacture;
import com.boulevardsecurity.securitymanagementapp.repository.DevisRepository;
import com.boulevardsecurity.securitymanagementapp.repository.FactureRepository;
import com.boulevardsecurity.securitymanagementapp.repository.ClientRepository;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import com.boulevardsecurity.securitymanagementapp.service.FactureService;
import com.boulevardsecurity.securitymanagementapp.service.TarificationDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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

    @Override
    public FactureDto create(FactureCreateDto dto) {
        Facture entity = mapper.toEntity(dto);
        Facture saved = repo.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public List<FactureDto> findAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<FactureDto> findById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public Optional<FactureDto> findByReference(String reference) {
        return repo.findByReferenceFacture(reference)
                .map(mapper::toDto);
    }

    @Override
    public FactureDto update(Long id, FactureCreateDto dto) {
        Facture updated = repo.findById(id)
                .map(existing -> {
                    // on reconstruit l'entité à partir du DTO
                    Facture rebuilt = mapper.toEntity(dto);
                    rebuilt.setId(existing.getId());
                    return repo.save(rebuilt);
                })
                .orElseThrow(() -> new IllegalArgumentException("Facture introuvable id=" + id));
        return mapper.toDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Facture introuvable id=" + id);
        }
        repo.deleteById(id);
    }
    
    /**
     * Crée une facture à partir d'un devis existant
     */
    public Facture creerDepuisDevis(Long devisId) {
        Devis d = repDevis.findById(devisId)
                .orElseThrow(() -> new IllegalArgumentException("Devis introuvable id=" + devisId));

        // Pour chaque mission, applique le chiffrage correct avant de créer la facture
        d.getMissions().forEach(this::appliquerChiffrage);

        // Calcul du total HT à partir des missions
        BigDecimal totalHT = d.getMissions().stream()
                              .map(tarification::montantHT)
                              .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Utilisation du même taux de TVA que celui du devis ou un calcul moyen
        BigDecimal tauxTVA = d.getMissions().isEmpty() ? 
            BigDecimal.valueOf(0.2) : // Taux par défaut si pas de mission
            d.getMissions().get(0).getTarif().getTauxTVA(); // Prend le taux de la première mission
            
        BigDecimal tva = tarification.tva(totalHT, tauxTVA);
        BigDecimal ttc = tarification.ttc(totalHT, tva);

        Facture f = Facture.builder()
            .referenceFacture(genererReference())
            .dateEmission(LocalDate.now())
            .statut(StatutFacture.EN_ATTENTE)
            .montantHT(totalHT)
            .montantTVA(tva)
            .montantTTC(ttc)
            .devis(d)
            .entreprise(d.getEntreprise())
            .client(d.getClient())
            .missions(d.getMissions())
            .build();

        return repo.save(f);
    }
    
    /**
     * Crée une facture pour un client sur une période donnée
     */
    public Facture creerPourClientEtPeriode(Long clientId, LocalDate debut, LocalDate fin) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable id=" + clientId));
                
        // Récupère toutes les missions du client dans la période spécifiée en utilisant la relation via Devis
        List<Mission> missions = missionRepository.findByDevis_Client_IdAndDateDebutBetween(clientId, debut, fin);
        
        if (missions.isEmpty()) {
            throw new IllegalArgumentException("Aucune mission trouvée pour ce client dans la période spécifiée");
        }
        
        // Pour chaque mission, applique le chiffrage correct
        missions.forEach(this::appliquerChiffrage);
        
        // Calcul du total HT à partir des missions
        BigDecimal totalHT = missions.stream()
                              .map(tarification::montantHT)
                              .reduce(BigDecimal.ZERO, BigDecimal::add);
                              
        // Utilisation du même taux de TVA que celui des missions ou un calcul moyen
        BigDecimal tauxTVA = missions.get(0).getTarif().getTauxTVA();
        BigDecimal tva = tarification.tva(totalHT, tauxTVA);
        BigDecimal ttc = tarification.ttc(totalHT, tva);
        
        // Trouver l'entreprise à partir de la première mission ou du premier devis
        var entreprise = missions.isEmpty() || missions.get(0).getDevis() == null ?
            null : missions.get(0).getDevis().getEntreprise();
        
        Facture f = Facture.builder()
            .referenceFacture(genererReference())
            .dateEmission(LocalDate.now())
            .statut(StatutFacture.EN_ATTENTE)
            .montantHT(totalHT)
            .montantTVA(tva)
            .montantTTC(ttc)
            .client(client)
            .entreprise(entreprise)
            .missions(missions)
            .build();
            
        return repo.save(f);
    }
    
    /**
     * Applique le chiffrage d'une mission en tenant compte des majorations
     */
    private void appliquerChiffrage(Mission m) {
        BigDecimal ht = tarification.montantHT(m);
        BigDecimal taux = m.getTarif().getTauxTVA();
        BigDecimal tva = tarification.tva(ht, taux);

        m.setMontantHT(ht);
        m.setMontantTVA(tva);
        m.setMontantTTC(tarification.ttc(ht, tva));
        
        // Sauvegarde les changements
        missionRepository.save(m);
    }
    
    /**
     * Génère une référence unique pour une facture
     */
    private String genererReference() {
        return "FACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Override
    public byte[] generatePdf(Long id) {
        Facture facture = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Facture non trouvée avec l'ID: " + id));

        // Vérifier que les relations sont chargées
        Client client = facture.getClient();
        if (client == null) {
            throw new IllegalStateException("Client non trouvé pour la facture: " + id);
        }

        try {
            // Préparation du contexte Thymeleaf
            Context context = new Context();
            context.setVariable("facture", facture);
            context.setVariable("client", client);
            context.setVariable("missions", facture.getMissions());
            context.setVariable("dateEmission", 
                facture.getDateEmission().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            context.setVariable("dateEcheance", 
                facture.getDateEcheance().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            context.setVariable("montantTotal", facture.getMontantTotal());

            // Génération du HTML à partir du template
            String htmlContent = templateEngine.process("facture-template", context);

            // Conversion du HTML en PDF
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
