// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/DevisServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.DevisCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.DevisDto;
import com.boulevardsecurity.securitymanagementapp.mapper.DevisMapper;
import com.boulevardsecurity.securitymanagementapp.model.Devis;
import com.boulevardsecurity.securitymanagementapp.repository.DevisRepository;
import com.boulevardsecurity.securitymanagementapp.service.DevisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DevisServiceImpl implements DevisService {

    private final DevisRepository repo;
    private final DevisMapper mapper;

    @Override
    public List<DevisDto> getAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<DevisDto> getById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public Optional<DevisDto> getByReference(String reference) {
        return repo.findByReferenceDevis(reference)
                .map(mapper::toDto);
    }

    @Override
    public DevisDto create(DevisCreateDto dto) {
        Devis ent = mapper.toEntity(dto);
        Devis saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public DevisDto update(Long id, DevisCreateDto dto) {
        Devis existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Devis introuvable id=" + id));
        // Mets à jour les champs (partiels) à partir du DTO de création
        mapper.updateFromCreateDto(dto, existing);
        Devis saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Devis introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
