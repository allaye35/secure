// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/DevisMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.Devis;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DevisMapper {

    private final EntrepriseRepository entrepriseRepo;
    private final ClientRepository     clientRepo;
    private final MissionRepository    missionRepo;

    /** Création → Entité */
    public Devis toEntity(DevisCreateDto dto) {
        Devis d = Devis.builder()
                .referenceDevis(dto.getReferenceDevis())
                .description(dto.getDescription())
                .statut(dto.getStatut())
                .dateCreation(LocalDate.now())
                .dateValidite(dto.getDateValidite())
                .conditionsGenerales(dto.getConditionsGenerales())
                .build();

        d.setEntreprise(
                entrepriseRepo.findById(dto.getEntrepriseId())
                        .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable"))
        );
        d.setClient(
                clientRepo.findById(dto.getClientId())
                        .orElseThrow(() -> new IllegalArgumentException("Client introuvable"))
        );

        // Attacher des missions existantes si fournies
        if (dto.getMissionIds() != null && !dto.getMissionIds().isEmpty()) {
            for (Long idM : dto.getMissionIds()) {
                Mission m = missionRepo.findById(idM)
                        .orElseThrow(() -> new IllegalArgumentException("Mission introuvable id=" + idM));
                m.setDevis(d); // côté mission
                d.getMissions().add(m);
            }
            d.recalculerTotaux();
        }
        return d;
    }

    /** Entité → DTO lecture */
    public DevisDto toDto(Devis d) {
        return DevisDto.builder()
                .id(d.getId())
                .referenceDevis(d.getReferenceDevis())
                .description(d.getDescription())
                .statut(d.getStatut())
                .dateCreation(d.getDateCreation())
                .dateValidite(d.getDateValidite())
                .conditionsGenerales(d.getConditionsGenerales())
                .entrepriseId(d.getEntreprise().getId())
                .clientId(d.getClient().getId())
                .contratId(d.getContrat() != null ? d.getContrat().getId() : null)
                .missionIds(d.getMissions().stream().map(m -> m.getId()).toList())
                .montantHT(d.getMontantHT())
                .montantTVA(d.getMontantTVA())
                .montantTTC(d.getMontantTTC())
                .build();
    }

    /** Mise à jour partielle si besoin */
    public void updateFromCreateDto(DevisCreateDto dto, Devis entity) {
        if (dto.getReferenceDevis() != null) entity.setReferenceDevis(dto.getReferenceDevis());
        if (dto.getDescription()      != null) entity.setDescription(dto.getDescription());
        if (dto.getStatut()           != null) entity.setStatut(dto.getStatut());
        if (dto.getDateValidite()     != null) entity.setDateValidite(dto.getDateValidite());
        if (dto.getConditionsGenerales()!=null) entity.setConditionsGenerales(dto.getConditionsGenerales());
        if (dto.getMissionIds() != null) {
            // Réinitialiser et rattacher les missions données (stratégie simple)
            entity.getMissions().forEach(m -> m.setDevis(null));
            entity.getMissions().clear();
            for (Long idM : dto.getMissionIds()) {
                Mission m = missionRepo.findById(idM)
                        .orElseThrow(() -> new IllegalArgumentException("Mission introuvable id=" + idM));
                m.setDevis(entity);
                entity.getMissions().add(m);
            }
            entity.recalculerTotaux();
        }
    }
}
