// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/DevisMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.Enums.StatutMission;
import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.model.Devis;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import com.boulevardsecurity.securitymanagementapp.service.TarificationDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DevisMapper {    private final EntrepriseRepository entrepriseRepo;
    private final ClientRepository     clientRepo;
    private final MissionMapper        missionMapper;
    private final TarifMissionRepository tarifMissionRepo;
    private final TarificationDomainService tarificationService;

    /** Création → Entité */
    public Devis toEntity(DevisCreateDto dto) {
        Devis d = Devis.builder()
                .referenceDevis(dto.getReferenceDevis())
                .description(dto.getDescription())
                .statut(dto.getStatut())
                .dateCreation(LocalDate.now())
                .dateValidite(dto.getDateValidite())
                .conditionsGenerales(dto.getConditionsGenerales())
                .missions(new ArrayList<>())
                .build();

        d.setEntreprise(
                entrepriseRepo.findById(dto.getEntrepriseId())
                        .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable"))
        );
        d.setClient(
                clientRepo.findById(dto.getClientId())
                        .orElseThrow(() -> new IllegalArgumentException("Client introuvable"))
        );
        
        // Traitement des missions associées
        if (dto.getMissions() != null && !dto.getMissions().isEmpty()) {
            List<Mission> missions = new ArrayList<>();
            
            for (MissionCreateDto missionDto : dto.getMissions()) {
                // Marquer la mission comme en attente de validation du devis
                missionDto.setStatutMission(StatutMission.EN_ATTENTE_DE_VALIDATION_DEVIS);
                missionDto.setDevisId(null); // Sera défini après la sauvegarde du devis
                
                Mission mission = missionMapper.toEntity(missionDto);
                mission.setDevis(d);
                
                // Récupérer et définir le tarif de mission
                if (missionDto.getTarifMissionId() != null) {
                    tarifMissionRepo.findById(missionDto.getTarifMissionId())
                            .ifPresent(tarif -> {
                                mission.setTarif(tarif);
                                // Appliquer le chiffrage via le service de tarification
                                tarificationService.appliquerChiffrage(mission);
                            });
                }
                
                missions.add(mission);
            }
            
            d.getMissions().addAll(missions);
        }
        
        return d;
    }    /** Entité → DTO lecture */
    public DevisDto toDto(Devis d) {
        // Convertir les missions en DTO
        List<MissionDto> missionDtos = new ArrayList<>();
        BigDecimal montantTotalHT = BigDecimal.ZERO;
        BigDecimal montantTotalTVA = BigDecimal.ZERO;
        BigDecimal montantTotalTTC = BigDecimal.ZERO;
        int nombreTotalAgents = 0;
        int nombreTotalHeures = 0;
        
        // Traiter chaque mission pour calculer les totaux
        if (d.getMissions() != null && !d.getMissions().isEmpty()) {
            for (Mission mission : d.getMissions()) {
                MissionDto missionDto = missionMapper.toDto(mission);
                missionDtos.add(missionDto);
                
                // Additionner les montants
                if (mission.getMontantHT() != null) {
                    montantTotalHT = montantTotalHT.add(mission.getMontantHT());
                }
                if (mission.getMontantTVA() != null) {
                    montantTotalTVA = montantTotalTVA.add(mission.getMontantTVA());
                }
                if (mission.getMontantTTC() != null) {
                    montantTotalTTC = montantTotalTTC.add(mission.getMontantTTC());
                }
                
                // Compter les agents et heures
                nombreTotalAgents += mission.getNombreAgents() != null ? mission.getNombreAgents() : 0;
                nombreTotalHeures += mission.getQuantite() != null ? mission.getQuantite() : 0;
            }
        }
        
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
                .missions(missionDtos)
                .montantTotalHT(montantTotalHT)
                .montantTotalTVA(montantTotalTVA)
                .montantTotalTTC(montantTotalTTC)
                .nombreTotalAgents(nombreTotalAgents)
                .nombreTotalHeures(nombreTotalHeures)
                .build();
    }    /** Mise à jour complète de l'entité */


    public void updateFromCreateDto(DevisCreateDto dto, Devis entity) {
        // Mise à jour inconditionnelle de tous les champs
        entity.setReferenceDevis(dto.getReferenceDevis());
        entity.setDescription(dto.getDescription());
        entity.setStatut(dto.getStatut());
        entity.setDateValidite(dto.getDateValidite());
        entity.setConditionsGenerales(dto.getConditionsGenerales());
        
        // Mise à jour des relations si nécessaire
        if (dto.getEntrepriseId() != null) {
            entrepriseRepo.findById(dto.getEntrepriseId())
                    .ifPresent(entity::setEntreprise);
        }
        
        if (dto.getClientId() != null) {
            clientRepo.findById(dto.getClientId())
                    .ifPresent(entity::setClient);
        }        
        // Gestion des missions - approche complète
        if (dto.getMissions() != null) {
            // Créer un ensemble des IDs de missions existantes à conserver
            Set<Long> missionsToKeep = dto.getMissions().stream()
                    .filter(m -> m.getId() != null)
                    .map(MissionCreateDto::getId)
                    .collect(Collectors.toSet());
            
            // Identifier les missions à supprimer (celles qui ne sont pas dans le DTO)
            List<Mission> missionsToRemove = entity.getMissions().stream()
                    .filter(m -> !missionsToKeep.contains(m.getId()))
                    .collect(Collectors.toList());
            
            // Supprimer les missions qui ne sont plus présentes dans le DTO
            for (Mission missionToRemove : missionsToRemove) {
                entity.getMissions().remove(missionToRemove);
            }
            
            // Pour chaque mission du DTO
            for (MissionCreateDto missionDto : dto.getMissions()) {
                // Si l'ID est fourni, c'est une mise à jour d'une mission existante
                if (missionDto.getId() != null) {
                    // Mise à jour d'une mission existante en cherchant par ID
                    entity.getMissions().stream()
                            .filter(m -> m.getId().equals(missionDto.getId()))
                            .findFirst()
                            .ifPresent(mission -> {
                                missionMapper.updateEntityFromDto(missionDto, mission);
                                
                                // Mettre à jour le tarif et recalculer les montants si nécessaire
                                if (missionDto.getTarifMissionId() != null) {
                                    tarifMissionRepo.findById(missionDto.getTarifMissionId())
                                            .ifPresent(tarif -> {
                                                mission.setTarif(tarif);
                                                tarificationService.appliquerChiffrage(mission);
                                            });
                                }
                            });
                } else {
                    // Création d'une nouvelle mission
                    missionDto.setStatutMission(StatutMission.EN_ATTENTE_DE_VALIDATION_DEVIS);
                    missionDto.setDevisId(entity.getId());
                    
                    Mission newMission = missionMapper.toEntity(missionDto);
                    newMission.setDevis(entity);
                    
                    // Appliquer le tarif et le chiffrage
                    if (missionDto.getTarifMissionId() != null) {
                        tarifMissionRepo.findById(missionDto.getTarifMissionId())
                                .ifPresent(tarif -> {
                                    newMission.setTarif(tarif);
                                    tarificationService.appliquerChiffrage(newMission);
                                });
                    }
                    
                    entity.getMissions().add(newMission);
                }
            }
        }
    }
}
