package com.boulevardsecurity.securitymanagementapp.mapper;

import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratDto;
import com.boulevardsecurity.securitymanagementapp.model.ArticleContrat;
import com.boulevardsecurity.securitymanagementapp.model.Contrat;
import com.boulevardsecurity.securitymanagementapp.repository.ContratRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;

@Component
@RequiredArgsConstructor
public class ArticleContratMapper {

    private final ContratRepository contratRepo;

    /* ===== Entity ➜ DTO ===== */
    public ArticleContratDto toDto(ArticleContrat a) {
        return ArticleContratDto.builder()
                .id(a.getId())
                .numero(a.getNumero())
                .titre(a.getTitre())
                .contenu(a.getContenu())
                .contratId(a.getContrat() != null ? a.getContrat().getId() : null)
                .build();
    }

    /* ===== DTO création ➜ Entity ===== */
    public ArticleContrat toEntity(ArticleContratCreateDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Le DTO d'article ne peut pas être nul");
        }

        // On commence à construire l'article
        ArticleContrat.ArticleContratBuilder builder = ArticleContrat.builder()
                .numero(dto.getNumero())
                .titre(dto.getTitre())
                .contenu(dto.getContenu());

        // Gestion du contrat
        if (dto.getContratId() != null) {
            Contrat contrat = contratRepo.findById(dto.getContratId())
                    .orElseThrow(() -> new NoSuchElementException(
                            "Contrat introuvable avec id=" + dto.getContratId()));
            builder.contrat(contrat);
        } else {
            // Pas de contrat associé pour l’instant
            builder.contrat(null);
        }

        return builder.build();
    }

    /* ===== Mise à jour partielle ===== */
    public void updateEntity(ArticleContrat entity, ArticleContratCreateDto dto) {
        if (dto.getNumero()  != null) entity.setNumero(dto.getNumero());
        if (dto.getTitre()   != null) entity.setTitre(dto.getTitre());
        if (dto.getContenu() != null) entity.setContenu(dto.getContenu());

        Long newContratId = dto.getContratId();
        if (newContratId != null &&
                (entity.getContrat() == null || !newContratId.equals(entity.getContrat().getId()))) {

            Contrat contrat = contratRepo.findById(newContratId)
                    .orElseThrow(() -> new NoSuchElementException(
                            "Contrat introuvable avec id=" + newContratId));
            entity.setContrat(contrat);
        }
    }
}
