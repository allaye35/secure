// src/main/java/com/boulevardsecurity/securitymanagementapp/mapper/ContratMapper.java
package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.ContratCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDto;
import com.boulevardsecurity.securitymanagementapp.model.*;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ContratMapper {

    private final DevisRepository devisRepo;
    private final MissionRepository missionRepo;
    private final ArticleContratRepository articleRepo;
    private final ContratRepository contratRepo;

    /* ========== Entity ➜ DTO lecture ========== */
    public ContratDto toDto(Contrat c) {
        return ContratDto.builder()
                .id(c.getId())
                .referenceContrat(c.getReferenceContrat())
                .dateSignature(c.getDateSignature())
                .dureeMois(c.getDureeMois())
                .taciteReconduction(c.getTaciteReconduction())
                .preavisMois(c.getPreavisMois())
                .pdfUrl(c.getPdfPath())
                .devisId(c.getDevis() != null ? c.getDevis().getId() : null)
                .missionIds(c.getMissions().stream()
                        .map(Mission::getId)
                        .collect(Collectors.toList()))
                .articleIds(c.getArticles().stream()
                        .map(ArticleContrat::getId)
                        .collect(Collectors.toList()))
                .build();
    }

    /* ========== DTO création ➜ Entity ========== */
    public Contrat toEntity(ContratCreateDto dto) {
        // Récupération du devis
        Devis d = devisRepo.findById(dto.getDevisId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Devis introuvable id=" + dto.getDevisId()));
        
        // Vérification si le devis est déjà associé à un contrat
        if (d.getContrat() != null) {
            throw new IllegalArgumentException(
                    "Le devis id=" + dto.getDevisId() + " est déjà associé au contrat id=" + d.getContrat().getId());
        }

        Contrat contrat = Contrat.builder()
                .referenceContrat(dto.getReferenceContrat())
                .dateSignature(dto.getDateSignature())
                .dureeMois(dto.getDureeMois())
                .taciteReconduction(dto.getTaciteReconduction())
                .preavisMois(dto.getPreavisMois())
                .pdfPath(dto.getPdfPath())
                .devis(d)
                .build();

        // Si des missions sont fournies, on les associe
        if (dto.getMissionIds() != null) {
            contrat.setMissions(
                    dto.getMissionIds().stream()
                            .map(id -> missionRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Mission introuvable id=" + id)))
                            .peek(m -> {
                                // Vérifier si la mission est déjà associée à un contrat
                                if (m.getContrat() != null && !m.getContrat().getId().equals(contrat.getId())) {
                                    throw new IllegalArgumentException(
                                            "La mission id=" + m.getId() + " est déjà associée à un autre contrat id=" + m.getContrat().getId());
                                }
                                m.setContrat(contrat);
                            })  // cohérence bidirectionnelle
                            .collect(Collectors.toList())
            );
        }

        // Si des articles sont fournis, on les associe
        if (dto.getArticleIds() != null) {
            contrat.setArticles(
                    dto.getArticleIds().stream()
                            .map(id -> articleRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("ArticleContrat introuvable id=" + id)))
                            .peek(a -> a.setContrat(contrat))
                            .collect(Collectors.toList())
            );
        }

        return contrat;
    }

    /* ========== Mise à jour partielle ========== */
    public void updateEntity(Contrat entity, ContratCreateDto dto) {
        if (dto.getReferenceContrat() != null)
            entity.setReferenceContrat(dto.getReferenceContrat());
        if (dto.getDateSignature() != null)
            entity.setDateSignature(dto.getDateSignature());
        if (dto.getDureeMois() != null)
            entity.setDureeMois(dto.getDureeMois());
        if (dto.getTaciteReconduction() != null)
            entity.setTaciteReconduction(dto.getTaciteReconduction());
        if (dto.getPreavisMois() != null)
            entity.setPreavisMois(dto.getPreavisMois());
        if (dto.getPdfPath() != null)
            entity.setPdfPath(dto.getPdfPath());

        if (dto.getDevisId() != null
                && (entity.getDevis() == null || !entity.getDevis().getId().equals(dto.getDevisId()))) {
            Devis d = devisRepo.findById(dto.getDevisId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Devis introuvable id=" + dto.getDevisId()));
            entity.setDevis(d);
        }

        // Même logique pour missions et articles si nécessaire en update :
        if (dto.getMissionIds() != null) {
            entity.getMissions().clear();
            entity.getMissions().addAll(
                    dto.getMissionIds().stream()
                            .map(id -> missionRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("Mission introuvable id=" + id)))
                            .peek(m -> m.setContrat(entity))
                            .collect(Collectors.toList())
            );
        }
        if (dto.getArticleIds() != null) {
            entity.getArticles().clear();
            entity.getArticles().addAll(
                    dto.getArticleIds().stream()
                            .map(id -> articleRepo.findById(id)
                                    .orElseThrow(() -> new IllegalArgumentException("ArticleContrat introuvable id=" + id)))
                            .peek(a -> a.setContrat(entity))
                            .collect(Collectors.toList())
            );
        }
    }
}
