// src/main/java/com/boulevardsecurity/securitymanagementapp/service/ArticleContratTravailService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ArticleContratTravailDto;

import java.util.List;
import java.util.Optional;

public interface ArticleContratTravailService {

    List<ArticleContratTravailDto> getAll();

    Optional<ArticleContratTravailDto> getById(Long id);

    List<ArticleContratTravailDto> getByContratTravail(Long contratTravailId);

    ArticleContratTravailDto create(ArticleContratTravailCreationDto creationDto);

    ArticleContratTravailDto update(Long id, ArticleContratTravailCreationDto updateDto);

    void delete(Long id);
}
