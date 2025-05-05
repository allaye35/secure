package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.MissionCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.MissionDto;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MissionMapper {

    private final AgentDeSecuriteRepository agentRepo;
    private final PlanningRepository planningRepo;
    private final SiteRepository siteRepo;
    private final GeolocalisationGPSRepository geoRepo;
    private final ContratRepository contratRepo;
    private final TarifMissionRepository tarifRepo;
    private final DevisRepository devisRepo;
    private final FactureRepository factureRepo;
    private final RapportInterventionRepository rapportRepo;
    private final PointageRepository pointageRepo;
    private final ContratDeTravailRepository contratTravailRepo;

    /**
     * ==== ENTITÉ → DTO ====
     */
    public MissionDto toDto(Mission m) {
        return MissionDto.builder()
                .id(m.getId())
                .titre(m.getTitre())
                .description(m.getDescription())
                .dateDebut(m.getDateDebut())
                .dateFin(m.getDateFin())
                .heureDebut(m.getHeureDebut())
                .heureFin(m.getHeureFin())
                .statutMission(m.getStatutMission())
                .typeMission(m.getTypeMission())
                .nombreAgents(m.getNombreAgents())
                .quantite(m.getQuantite())
                .montantHT(m.getMontantHT())
                .montantTVA(m.getMontantTVA())
                .montantTTC(m.getMontantTTC())
                .agentIds(
                        m.getAgents().stream()
                                .map(a -> a.getId())
                                .collect(Collectors.toSet())
                )
                .planningId(m.getPlanning() != null ? m.getPlanning().getId() : null)
                .siteId(m.getSite() != null ? m.getSite().getId() : null)
                .geolocalisationId(m.getGeolocalisationGPS() != null ? m.getGeolocalisationGPS().getId() : null)
                .contratId(m.getContrat() != null ? m.getContrat().getId() : null)
                .tarifId(m.getTarif() != null ? m.getTarif().getId() : null)
                .devisId(m.getDevis() != null ? m.getDevis().getId() : null)
                .rapportIds(
                        m.getRapports().stream()
                                .map(r -> r.getId())
                                .collect(Collectors.toList())
                )
                .pointageIds(
                        m.getPointages().stream()
                                .map(p -> p.getId())
                                .collect(Collectors.toList())
                )
                .contratTravailIds(
                        m.getContratsDeTravail().stream()
                                .map(ct -> ct.getId())
                                .collect(Collectors.toList())
                )
                .factureIds(
                        m.getFactures().stream()
                                .map(f -> f.getId())
                                .collect(Collectors.toList())
                )
                .build();
    }

    /**
     * ==== DTO (create) → nouvelle ENTITÉ ====
     */
    public Mission toEntity(MissionCreateDto dto) {
        Mission m = Mission.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .heureDebut(dto.getHeureDebut())
                .heureFin(dto.getHeureFin())
                .statutMission(dto.getStatutMission())
                .typeMission(dto.getTypeMission())
                .nombreAgents(dto.getNombreAgents())
                .quantite(dto.getQuantite())
                .build();

        if (dto.getAgentIds() != null) {
            m.setAgents(dto.getAgentIds().stream()
                    .map(id -> agentRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Agent introuvable id=" + id)))
                    .collect(Collectors.toSet())
            );
        }
        if (dto.getPlanningId() != null) {
            m.setPlanning(planningRepo.findById(dto.getPlanningId())
                    .orElseThrow(() -> new IllegalArgumentException("Planning introuvable id=" + dto.getPlanningId())))
            ;
        }
        if (dto.getSiteId() != null) {
            m.setSite(siteRepo.findById(dto.getSiteId())
                    .orElseThrow(() -> new IllegalArgumentException("Site introuvable id=" + dto.getSiteId())))
            ;
        }
        if (dto.getGeolocalisationGpsId() != null) {
            m.setGeolocalisationGPS(geoRepo.findById(dto.getGeolocalisationGpsId())
                    .orElseThrow(() -> new IllegalArgumentException("Geo introuvable id=" + dto.getGeolocalisationGpsId())))
            ;
        }
        if (dto.getContratId() != null) {
            m.setContrat(contratRepo.findById(dto.getContratId())
                    .orElseThrow(() -> new IllegalArgumentException("Contrat introuvable id=" + dto.getContratId())))
            ;
        }
        if (dto.getTarifMissionId() != null) {
            m.setTarif(tarifRepo.findById(dto.getTarifMissionId())
                    .orElseThrow(() -> new IllegalArgumentException("Tarif introuvable id=" + dto.getTarifMissionId())))
            ;
        }
        if (dto.getDevisId() != null) {
            m.setDevis(devisRepo.findById(dto.getDevisId())
                    .orElseThrow(() -> new IllegalArgumentException("Devis introuvable id=" + dto.getDevisId())))
            ;
        }
        if (dto.getRapportIds() != null) {
            m.setRapports(dto.getRapportIds().stream()
                    .map(id -> rapportRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Rapport introuvable id=" + id)))
                    .collect(Collectors.toList())
            );
        }
        if (dto.getPointageIds() != null) {
            m.setPointages(dto.getPointageIds().stream()
                    .map(id -> pointageRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Pointage introuvable id=" + id)))
                    .collect(Collectors.toList())
            );
        }
        if (dto.getContratTravailIds() != null) {
            m.setContratsDeTravail(dto.getContratTravailIds().stream()
                    .map(id -> contratTravailRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("CT introuvable id=" + id)))
                    .collect(Collectors.toList())
            );
        }
        if (dto.getFactureIds() != null) {
            m.setFactures(dto.getFactureIds().stream()
                    .map(id -> factureRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Facture introuvable id=" + id)))
                    .collect(Collectors.toList())
            );
        }
        return m;
    }

    /**
     * ==== Mise à jour partielle (PUT) ====
     */
    public void updateEntityFromDto(MissionCreateDto dto, Mission m) {
        // — champs simples —
        if (dto.getTitre() != null) m.setTitre(dto.getTitre());
        if (dto.getDescription() != null) m.setDescription(dto.getDescription());
        if (dto.getDateDebut() != null) m.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) m.setDateFin(dto.getDateFin());
        if (dto.getHeureDebut() != null) m.setHeureDebut(dto.getHeureDebut());
        if (dto.getHeureFin() != null) m.setHeureFin(dto.getHeureFin());
        if (dto.getStatutMission() != null) m.setStatutMission(dto.getStatutMission());
        if (dto.getTypeMission() != null) m.setTypeMission(dto.getTypeMission());
        if (dto.getNombreAgents() != null) m.setNombreAgents(dto.getNombreAgents());
        if (dto.getQuantite() != null) m.setQuantite(dto.getQuantite());
        if (dto.getMontantHT() != null) m.setMontantHT(dto.getMontantHT());
        if (dto.getMontantTVA() != null) m.setMontantTVA(dto.getMontantTVA());
        if (dto.getMontantTTC() != null) m.setMontantTTC(dto.getMontantTTC());

        // — relations simples (1:n) —
        if (dto.getPlanningId() != null) {
            m.setPlanning(planningRepo.findById(dto.getPlanningId())
                    .orElseThrow(() -> new IllegalArgumentException("Planning introuvable id=" + dto.getPlanningId())));
        }
        if (dto.getSiteId() != null) {
            m.setSite(siteRepo.findById(dto.getSiteId())
                    .orElseThrow(() -> new IllegalArgumentException("Site introuvable id=" + dto.getSiteId())));
        }
        if (dto.getGeolocalisationGpsId() != null) {
            m.setGeolocalisationGPS(geoRepo.findById(dto.getGeolocalisationGpsId())
                    .orElseThrow(() -> new IllegalArgumentException("Géo introuvable id=" + dto.getGeolocalisationGpsId())));
        }
        if (dto.getContratId() != null) {
            m.setContrat(contratRepo.findById(dto.getContratId())
                    .orElseThrow(() -> new IllegalArgumentException("Contrat introuvable id=" + dto.getContratId())));
        }
        if (dto.getTarifMissionId() != null) {
            m.setTarif(tarifRepo.findById(dto.getTarifMissionId())
                    .orElseThrow(() -> new IllegalArgumentException("Tarif introuvable id=" + dto.getTarifMissionId())));
        }
        if (dto.getDevisId() != null) {
            m.setDevis(devisRepo.findById(dto.getDevisId())
                    .orElseThrow(() -> new IllegalArgumentException("Devis introuvable id=" + dto.getDevisId())));
        }

        // — collections / associations —
        if (dto.getAgentIds() != null) {
            m.setAgents(dto.getAgentIds().stream()
                    .map(id -> agentRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Agent introuvable id=" + id)))
                    .collect(Collectors.toSet())
            );
        }
        if (dto.getRapportIds() != null) {
            m.setRapports(dto.getRapportIds().stream()
                    .map(id -> rapportRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Rapport introuvable id=" + id)))
                    .collect(Collectors.toList())
            );
        }
        if (dto.getPointageIds() != null) {
            m.setPointages(dto.getPointageIds().stream()
                    .map(id -> pointageRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Pointage introuvable id=" + id)))
                    .collect(Collectors.toList())
            );
        }
        if (dto.getContratTravailIds() != null) {
            m.setContratsDeTravail(dto.getContratTravailIds().stream()
                    .map(id -> contratTravailRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("ContratTravail introuvable id=" + id)))
                    .collect(Collectors.toList())
            );
        }
        if (dto.getFactureIds() != null) {
            m.setFactures(dto.getFactureIds().stream()
                    .map(id -> factureRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Facture introuvable id=" + id)))
                    .collect(Collectors.toList())
            );
        }
    }
}


