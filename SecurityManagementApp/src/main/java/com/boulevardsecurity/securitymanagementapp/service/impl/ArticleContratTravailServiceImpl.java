// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/ArticleContratTravailServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratTravailDto;
import com.boulevardsecurity.securitymanagementapp.mapper.ArticleContratTravailMapper;
import com.boulevardsecurity.securitymanagementapp.model.ArticleContratTravail;
import com.boulevardsecurity.securitymanagementapp.repository.ArticleContratTravailRepository;
import com.boulevardsecurity.securitymanagementapp.service.ArticleContratTravailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleContratTravailServiceImpl implements ArticleContratTravailService {

    private final ArticleContratTravailRepository repo;
    private final ArticleContratTravailMapper mapper;

    @Override
    public List<ArticleContratTravailDto> getAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ArticleContratTravailDto> getById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<ArticleContratTravailDto> getByContratTravail(Long contratTravailId) {
        return repo.findByContratDeTravail_IdOrderById(contratTravailId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ArticleContratTravailDto create(ArticleContratTravailCreationDto creationDto) {
        ArticleContratTravail ent = mapper.toEntity(creationDto);
        ArticleContratTravail saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public ArticleContratTravailDto update(Long id, ArticleContratTravailCreationDto updateDto) {
        // Récupère l'entité existante
        ArticleContratTravail existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ArticleContratTravail introuvable id=" + id));
        
        // Mise à jour des champs de l'entité avec les valeurs du DTO
        if (updateDto.getLibelle() != null) {
            existing.setLibelle(updateDto.getLibelle());
        }
        if (updateDto.getContenu() != null) {
            existing.setContenu(updateDto.getContenu());
        }
        
        // Sauvegarde et retourne l'entité mise à jour
        ArticleContratTravail saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("ArticleContratTravail introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
