package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailDto;
import com.boulevardsecurity.securitymanagementapp.model.*;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import com.boulevardsecurity.securitymanagementapp.repository.ArticleContratTravailRepository;
import com.boulevardsecurity.securitymanagementapp.repository.EntrepriseRepository;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ContratDeTravailMapper {

    /* ---------- repos ---------- */
    private final AgentDeSecuriteRepository       agentRepo;
    private final EntrepriseRepository            entrepriseRepo;
    private final MissionRepository               missionRepo;
    private final ArticleContratTravailRepository articleRepo;   // 🆕

    /* ---------- ENTITÉ → DTO ---------- */
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
                .entrepriseId(c.getEntreprise()   != null ? c.getEntreprise().getId()   : null)
                .missionId(c.getMission()         != null ? c.getMission().getId()     : null)
                .ficheDePaieIds(
                        c.getFichesDePaie().stream()
                                .map(FicheDePaie::getId)
                                .collect(Collectors.toList())
                )
                .clauseIds(
                        c.getClauses().stream()
                                .map(ArticleContratTravail::getId)
                                .collect(Collectors.toList())
                )
                .documentPdf(c.getDocumentPdf())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    /* ---------- DTO → ENTITÉ ---------- */
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

        linkAgentEntrepriseMission(dto, entity);

        // 🆕 rattacher les clauses
        if (dto.getArticleContratTravailIds() != null) {
            dto.getArticleContratTravailIds().forEach(id -> {
                ArticleContratTravail art = articleRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "ArticleContratTravail introuvable id=" + id));
                art.setContratDeTravail(entity);   // côté inverse
                entity.getClauses().add(art);       // côté propriétaire
            });
        }

        return entity;
    }

    /* ---------- PATCH (update partiel) ---------- */
    public void updateEntityFromDto(ContratDeTravailCreationDto dto, ContratDeTravail entity) {

        if (dto.getReferenceContrat()   != null) entity.setReferenceContrat(dto.getReferenceContrat());
        if (dto.getTypeContrat()        != null) entity.setTypeContrat(dto.getTypeContrat());
        if (dto.getDateDebut()          != null) entity.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin()            != null) entity.setDateFin(dto.getDateFin());
        if (dto.getDescription()        != null) entity.setDescription(dto.getDescription());
        if (dto.getSalaireDeBase()      != null) entity.setSalaireDeBase(dto.getSalaireDeBase());
        if (dto.getPeriodiciteSalaire() != null) entity.setPeriodiciteSalaire(dto.getPeriodiciteSalaire());
        if (dto.getDocumentPdf()        != null) entity.setDocumentPdf(dto.getDocumentPdf());

        linkAgentEntrepriseMission(dto, entity);

        // 🆕 refresh des clauses si la liste est fournie
        if (dto.getArticleContratTravailIds() != null) {
            entity.getClauses().clear();
            dto.getArticleContratTravailIds().forEach(id -> {
                ArticleContratTravail art = articleRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "ArticleContratTravail introuvable id=" + id));
                art.setContratDeTravail(entity);
                entity.getClauses().add(art);
            });
        }
    }

    /* ---------- factorisation des associations ---------- */
    private void linkAgentEntrepriseMission(ContratDeTravailCreationDto dto, ContratDeTravail entity) {

        if (dto.getAgentDeSecuriteId() != null) {
            AgentDeSecurite ag = agentRepo.findById(dto.getAgentDeSecuriteId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Agent introuvable id=" + dto.getAgentDeSecuriteId()));
            entity.setAgentDeSecurite(ag);
        }

        if (dto.getEntrepriseId() != null) {
            Entreprise ent = entrepriseRepo.findById(dto.getEntrepriseId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Entreprise introuvable id=" + dto.getEntrepriseId()));
            entity.setEntreprise(ent);
        }

        if (dto.getMissionId() != null) {
            Mission mi = missionRepo.findById(dto.getMissionId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Mission introuvable id=" + dto.getMissionId()));
            entity.setMission(mi);
        }
    }
}
