package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailDto;
import com.boulevardsecurity.securitymanagementapp.model.AgentDeSecurite;
import com.boulevardsecurity.securitymanagementapp.model.ContratDeTravail;
import com.boulevardsecurity.securitymanagementapp.model.Entreprise;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import com.boulevardsecurity.securitymanagementapp.repository.EntrepriseRepository;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ContratDeTravailMapper {

    private final AgentDeSecuriteRepository agentRepo;
    private final EntrepriseRepository entrepriseRepo;
    private final MissionRepository missionRepo;

    /** ENTITÉ → DTO */
    public ContratDeTravailDto toDto(ContratDeTravail c) {
        return ContratDeTravailDto.builder()
                .id(c.getId())
                .referenceContrat(c.getReferenceContrat())
                .typeContrat(c.getTypeContrat())
                .dateDebut(c.getDateDebut())
                .dateFin(c.getDateFin())
                .description(c.getDescription())
                .salaireDeBase(c.getSalaireDeBase())
                .periodiciteSalaire(c.getPeriodiciteSalaire())
                .agentDeSecuriteId(c.getAgentDeSecurite() != null ? c.getAgentDeSecurite().getId() : null)
                .entrepriseId(c.getEntreprise() != null ? c.getEntreprise().getId() : null)
                .missionId(c.getMission() != null ? c.getMission().getId() : null)
                .ficheDePaieIds(c.getFichesDePaie().stream()
                        .map(fp -> fp.getId())
                        .collect(Collectors.toList()))
                .clauseIds(c.getClauses().stream()
                        .map(cl -> cl.getId())
                        .collect(Collectors.toList()))
                .documentPdf(c.getDocumentPdf())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    /** DTO création → ENTITÉ */
    public ContratDeTravail toEntity(ContratDeTravailCreationDto dto) {
        ContratDeTravail entity = ContratDeTravail.builder()
                .referenceContrat(dto.getReferenceContrat())
                .typeContrat(dto.getTypeContrat())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .description(dto.getDescription())
                .salaireDeBase(dto.getSalaireDeBase())
                .periodiciteSalaire(dto.getPeriodiciteSalaire())
                .documentPdf(dto.getDocumentPdf())
                .build();

        // Associations uniquement si id non null
        if (dto.getAgentDeSecuriteId() != null) {
            AgentDeSecurite agent = agentRepo.findById(dto.getAgentDeSecuriteId())
                    .orElseThrow(() -> new IllegalArgumentException("Agent introuvable id=" + dto.getAgentDeSecuriteId()));
            entity.setAgentDeSecurite(agent);
        }

        if (dto.getEntrepriseId() != null) {
            Entreprise entreprise = entrepriseRepo.findById(dto.getEntrepriseId())
                    .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable id=" + dto.getEntrepriseId()));
            entity.setEntreprise(entreprise);
        }

        if (dto.getMissionId() != null) {
            Mission mission = missionRepo.findById(dto.getMissionId())
                    .orElseThrow(() -> new IllegalArgumentException("Mission introuvable id=" + dto.getMissionId()));
            entity.setMission(mission);
        }

        return entity;
    }

    /** Mise à jour partielle : patch à partir d’un DTO création */
    public void updateEntityFromDto(ContratDeTravailCreationDto dto, ContratDeTravail entity) {
        if (dto.getReferenceContrat() != null) entity.setReferenceContrat(dto.getReferenceContrat());
        if (dto.getTypeContrat() != null) entity.setTypeContrat(dto.getTypeContrat());
        if (dto.getDateDebut() != null) entity.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) entity.setDateFin(dto.getDateFin());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getSalaireDeBase() != null) entity.setSalaireDeBase(dto.getSalaireDeBase());
        if (dto.getPeriodiciteSalaire() != null) entity.setPeriodiciteSalaire(dto.getPeriodiciteSalaire());
        if (dto.getDocumentPdf() != null) entity.setDocumentPdf(dto.getDocumentPdf());

        if (dto.getAgentDeSecuriteId() != null) {
            AgentDeSecurite agent = agentRepo.findById(dto.getAgentDeSecuriteId())
                    .orElseThrow(() -> new IllegalArgumentException("Agent introuvable id=" + dto.getAgentDeSecuriteId()));
            entity.setAgentDeSecurite(agent);
        }

        if (dto.getEntrepriseId() != null) {
            Entreprise entreprise = entrepriseRepo.findById(dto.getEntrepriseId())
                    .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable id=" + dto.getEntrepriseId()));
            entity.setEntreprise(entreprise);
        }

        if (dto.getMissionId() != null) {
            Mission mission = missionRepo.findById(dto.getMissionId())
                    .orElseThrow(() -> new IllegalArgumentException("Mission introuvable id=" + dto.getMissionId()));
            entity.setMission(mission);
        }
    }
}
