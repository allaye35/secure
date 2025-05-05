// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/ContratServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.ContratCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDto;
import com.boulevardsecurity.securitymanagementapp.mapper.ContratMapper;
import com.boulevardsecurity.securitymanagementapp.model.Contrat;
import com.boulevardsecurity.securitymanagementapp.repository.ContratRepository;
import com.boulevardsecurity.securitymanagementapp.service.ContratService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContratServiceImpl implements ContratService {

    private final ContratRepository repository;
    private final ContratMapper    mapper;

    @Override
    public ContratDto createContrat(ContratCreateDto dto) {
        Contrat entity = mapper.toEntity(dto);
        Contrat saved  = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public List<ContratDto> getAllContrats() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ContratDto> getContratById(Long id) {
        return repository.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public Optional<ContratDto> getContratByReference(String reference) {
        return repository.findByReferenceContrat(reference)
                .map(mapper::toDto);
    }

    @Override
    public ContratDto updateContrat(Long id, ContratCreateDto dto) {
        Contrat existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Contrat introuvable id=" + id));
        mapper.updateEntity(existing, dto);
        Contrat saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void deleteContrat(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Contrat introuvable id=" + id);
        }
        repository.deleteById(id);
    }
}
