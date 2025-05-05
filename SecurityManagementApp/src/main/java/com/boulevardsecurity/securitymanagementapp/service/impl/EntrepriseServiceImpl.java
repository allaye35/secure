// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/EntrepriseServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.EntrepriseCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.EntrepriseDto;
import com.boulevardsecurity.securitymanagementapp.mapper.EntrepriseMapper;
import com.boulevardsecurity.securitymanagementapp.model.Entreprise;
import com.boulevardsecurity.securitymanagementapp.repository.EntrepriseRepository;
import com.boulevardsecurity.securitymanagementapp.service.EntrepriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntrepriseServiceImpl implements EntrepriseService {

    private final EntrepriseRepository repository;
    private final EntrepriseMapper    mapper;

    @Override
    public EntrepriseDto createEntreprise(EntrepriseCreateDto dto) {
        Entreprise ent   = mapper.toEntity(dto);
        Entreprise saved = repository.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public List<EntrepriseDto> getAllEntreprises() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<EntrepriseDto> getEntrepriseById(Long id) {
        return repository.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public Optional<EntrepriseDto> getEntrepriseByNom(String nom) {
        return repository.findByNom(nom)
                .map(mapper::toDto);
    }


    @Override
    public EntrepriseDto updateEntreprise(Long id, EntrepriseDto dto) {
        Entreprise existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable id=" + id));
        mapper.updateEntityFromDto(dto, existing);
        Entreprise saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void deleteEntreprise(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Entreprise introuvable id=" + id);
        }
        repository.deleteById(id);
    }
}
