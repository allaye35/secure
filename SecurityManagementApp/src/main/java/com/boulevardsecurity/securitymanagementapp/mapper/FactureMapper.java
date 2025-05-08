// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/FactureMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.*;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class FactureMapper {

    private final DevisRepository        devisRepo;
    private final EntrepriseRepository   entrepriseRepo;
    private final ClientRepository       clientRepo;
    private final ContratRepository      contratRepo;
    private final MissionRepository      missionRepo;

    /** ENTITÉ → DTO **/
    public FactureDto toDto(Facture f) {
        return FactureDto.builder()
                .id(f.getId())
                .referenceFacture(f.getReferenceFacture())
                .dateEmission(f.getDateEmission())
                .statut(f.getStatut())
                .montantHT(f.getMontantHT())
                .montantTVA(f.getMontantTVA())
                .montantTTC(f.getMontantTTC())

                .devisId(f.getDevis().getId())
                .entrepriseId(f.getEntreprise().getId())
                .clientId(f.getClient().getId())
                .missionIds(f.getMissions().stream()
                        .map(Mission::getId)
                        .collect(Collectors.toList()))
                .build();
    }

    /** DTO création / update → ENTITÉ **/
    public Facture toEntity(FactureCreateDto dto) {
        // récupère les entités obligatoires
        Devis devis        = devisRepo.findById(dto.getDevisId())
                .orElseThrow(() -> new IllegalArgumentException("Devis id=" + dto.getDevisId() + " introuvable"));
        Entreprise ent     = entrepriseRepo.findById(dto.getEntrepriseId())
                .orElseThrow(() -> new IllegalArgumentException("Entreprise id=" + dto.getEntrepriseId() + " introuvable"));
        Client client      = clientRepo.findById(dto.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client id=" + dto.getClientId() + " introuvable"));

        // construit la facture
        Facture f = Facture.builder()
                .referenceFacture(dto.getReferenceFacture())
                .dateEmission(dto.getDateEmission())
                .statut(dto.getStatut())
                .montantHT(dto.getMontantHT())
                .montantTVA(dto.getMontantTVA())
                .montantTTC(dto.getMontantTTC())

                .devis(devis)
                .entreprise(ent)
                .client(client)
                .build();



        // missions facturées facultatives
        if (dto.getMissionIds() != null && !dto.getMissionIds().isEmpty()) {
            dto.getMissionIds().forEach(mid -> {
                Mission m = missionRepo.findById(mid)
                        .orElseThrow(() -> new IllegalArgumentException("Mission id=" + mid));
                f.getMissions().add(m);
                m.getFactures().add(f);
            });
        }

        return f;
    }
}
