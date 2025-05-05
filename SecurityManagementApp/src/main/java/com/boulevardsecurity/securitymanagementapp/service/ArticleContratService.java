// src/main/java/com/boulevardsecurity/securitymanagementapp/service/ArticleContratService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratDto;

import java.util.List;
import java.util.Optional;

public interface ArticleContratService {
    List<ArticleContratDto> getAllArticles();
    Optional<ArticleContratDto> getArticleById(Long id);
    List<ArticleContratDto> getArticlesByContrat(Long contratId);
    ArticleContratDto createArticle(ArticleContratCreateDto createDto);
    ArticleContratDto updateArticle(Long id, ArticleContratCreateDto updateDto);
    void deleteArticle(Long id);
}
