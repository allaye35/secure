// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/CarteProfessionnelleServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.CarteProfessionnelleCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.CarteProfessionnelleDto;
import com.boulevardsecurity.securitymanagementapp.mapper.CarteProfessionnelleMapper;
import com.boulevardsecurity.securitymanagementapp.model.CarteProfessionnelle;
import com.boulevardsecurity.securitymanagementapp.repository.CarteProfessionnelleRepository;
import com.boulevardsecurity.securitymanagementapp.service.CarteProfessionnelleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarteProfessionnelleServiceImpl implements CarteProfessionnelleService {

    private final CarteProfessionnelleRepository repo;
    private final CarteProfessionnelleMapper mapper;

    @Override
    public List<CarteProfessionnelleDto> getAll() {
        return repo.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CarteProfessionnelleDto> getById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<CarteProfessionnelleDto> getByAgent(Long agentId) {
        return repo.findByAgentDeSecuriteId(agentId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CarteProfessionnelleDto create(CarteProfessionnelleCreationDto creationDto) {
        CarteProfessionnelle entity = mapper.toEntity(creationDto);
        CarteProfessionnelle saved = repo.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public CarteProfessionnelleDto update(Long id, CarteProfessionnelleDto updateDto) {
        CarteProfessionnelle existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Carte pro introuvable id=" + id));
        mapper.updateEntityFromDto(updateDto, existing);
        CarteProfessionnelle saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Carte pro introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
