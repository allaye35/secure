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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DevisMapper {    
    private final EntrepriseRepository entrepriseRepo;
    private final ClientRepository     clientRepo;    private final MissionMapper        missionMapper;
    private final TarifMissionRepository tarifMissionRepo;
    private final TarificationDomainService tarificationService;
    private final MissionRepository missionRepository;
    
    /**
     * Convertit un DTO de création en entité Devis
     * IMPORTANT: Seules des missions existantes sont associées, aucune nouvelle mission n'est créée
     */
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
        
        // Traitement des missions existantes à associer
        if (dto.getMissionExistanteIds() != null && !dto.getMissionExistanteIds().isEmpty()) {
            List<Mission> missionsExistantes = missionRepository.findAllById(dto.getMissionExistanteIds());
            
            for (Mission mission : missionsExistantes) {
                // Vérifier que la mission n'est pas déjà associée à un autre devis
                if (mission.getDevis() != null) {
                    throw new IllegalArgumentException("La mission avec l'ID " + mission.getId() + 
                            " est déjà associée à un autre devis");
                }
                
                // Mettre à jour le statut de la mission
                mission.setStatutMission(StatutMission.EN_ATTENTE_DE_VALIDATION_DEVIS);
                mission.setDevis(d);
                
                // S'assurer que la mission a un tarif et des montants calculés
                if (mission.getTarif() == null && mission.getTypeMission() != null) {
                    tarifMissionRepo.findByTypeMission(mission.getTypeMission())
                            .ifPresent(tarif -> {
                                mission.setTarif(tarif);
                                tarificationService.appliquerChiffrage(mission);
                            });
                }
                
                d.getMissions().add(mission);
            }
        }
        
        return d;
    }    /** 
     * Convertit une entité Devis en DTO pour affichage
     * Inclut les détails complets des missions associées et calcule les totaux
     */
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
        }return DevisDto.builder()
                .id(d.getId())
                .referenceDevis(d.getReferenceDevis())
                .description(d.getDescription())
                .statut(d.getStatut())
                .dateCreation(d.getDateCreation())
                .dateValidite(d.getDateValidite())
                .conditionsGenerales(d.getConditionsGenerales())                .entrepriseId(d.getEntreprise().getId())
                .clientId(d.getClient().getId())
                .contratId(d.getContrat() != null ? d.getContrat().getId() : null)
                .missions(missionDtos)
                .montantTotalHT(montantTotalHT)
                .montantTotalTVA(montantTotalTVA)
                .montantTotalTTC(montantTotalTTC)
                .nombreTotalAgents(nombreTotalAgents)
                .nombreTotalHeures(nombreTotalHeures)
                .build();
    }    /** 
     * Met à jour une entité Devis existante à partir d'un DTO de création
     * Gère l'ajout et la suppression de missions existantes
     */
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
        
        // Créer un ensemble des IDs de missions à conserver
        Set<Long> missionsToKeep = new HashSet<>();
        
        // Ajouter les IDs des missions existantes à associer
        if (dto.getMissionExistanteIds() != null) {
            missionsToKeep.addAll(dto.getMissionExistanteIds());
        }
        
        // Identifier les missions à supprimer (celles qui ne sont pas dans le DTO)
        List<Mission> missionsToRemove = entity.getMissions().stream()
                .filter(m -> !missionsToKeep.contains(m.getId()))
                .collect(Collectors.toList());
        
        // Supprimer les missions qui ne sont plus présentes dans le DTO
        for (Mission missionToRemove : missionsToRemove) {
            entity.getMissions().remove(missionToRemove);
            // Détacher la mission du devis
            missionToRemove.setDevis(null);
        }
        
        // Traiter les missions existantes à associer
        if (dto.getMissionExistanteIds() != null && !dto.getMissionExistanteIds().isEmpty()) {
            // Récupérer les IDs des missions déjà associées au devis
            Set<Long> existingMissionIds = entity.getMissions().stream()
                    .map(Mission::getId)
                    .collect(Collectors.toSet());
            
            // Filtrer pour ne récupérer que les nouvelles missions à associer
            List<Long> newMissionIds = dto.getMissionExistanteIds().stream()
                    .filter(id -> !existingMissionIds.contains(id))
                    .collect(Collectors.toList());
            
            if (!newMissionIds.isEmpty()) {
                List<Mission> missionsToAdd = missionRepository.findAllById(newMissionIds);
                
                for (Mission mission : missionsToAdd) {
                    // Vérifier que la mission n'est pas déjà associée à un autre devis
                    if (mission.getDevis() != null && !mission.getDevis().getId().equals(entity.getId())) {
                        throw new IllegalArgumentException("La mission avec l'ID " + mission.getId() + 
                                " est déjà associée à un autre devis");
                    }
                    
                    // Mettre à jour le statut de la mission
                    mission.setStatutMission(StatutMission.EN_ATTENTE_DE_VALIDATION_DEVIS);
                    mission.setDevis(entity);
                    
                    // S'assurer que la mission a un tarif et des montants calculés
                    if (mission.getTarif() == null && mission.getTypeMission() != null) {
                        tarifMissionRepo.findByTypeMission(mission.getTypeMission())
                                .ifPresent(tarif -> {
                                    mission.setTarif(tarif);
                                    tarificationService.appliquerChiffrage(mission);
                                });
                    }
                    
                    entity.getMissions().add(mission);
                }
            }
        }
    }
}
