// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/ArticleContratServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratDto;
import com.boulevardsecurity.securitymanagementapp.mapper.ArticleContratMapper;
import com.boulevardsecurity.securitymanagementapp.model.ArticleContrat;
import com.boulevardsecurity.securitymanagementapp.repository.ArticleContratRepository;
import com.boulevardsecurity.securitymanagementapp.service.ArticleContratService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleContratServiceImpl implements ArticleContratService {

    private final ArticleContratRepository repo;
    private final ArticleContratMapper mapper;

    @Override
    public List<ArticleContratDto> getAllArticles() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ArticleContratDto> getArticleById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<ArticleContratDto> getArticlesByContrat(Long contratId) {
        return repo.findByContrat_IdOrderByNumero(contratId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ArticleContratDto createArticle(ArticleContratCreateDto createDto) {
        ArticleContrat entity = mapper.toEntity(createDto);
        ArticleContrat saved = repo.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public ArticleContratDto updateArticle(Long id, ArticleContratCreateDto updateDto) {
        ArticleContrat existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ArticleContrat introuvable id=" + id));
        mapper.updateEntity(existing, updateDto);
        ArticleContrat saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void deleteArticle(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("ArticleContrat introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
