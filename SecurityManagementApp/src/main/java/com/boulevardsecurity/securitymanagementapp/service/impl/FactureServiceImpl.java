package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.FactureCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.FactureDto;
import com.boulevardsecurity.securitymanagementapp.mapper.FactureMapper;
import com.boulevardsecurity.securitymanagementapp.model.Facture;
import com.boulevardsecurity.securitymanagementapp.repository.FactureRepository;
import com.boulevardsecurity.securitymanagementapp.service.FactureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FactureServiceImpl implements FactureService {

    private final FactureRepository repo;
    private final FactureMapper mapper;

    @Override
    public FactureDto create(FactureCreateDto dto) {
        Facture entity = mapper.toEntity(dto);
        Facture saved = repo.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public List<FactureDto> findAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<FactureDto> findById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public Optional<FactureDto> findByReference(String reference) {
        return repo.findByReferenceFacture(reference)
                .map(mapper::toDto);
    }

    @Override
    public FactureDto update(Long id, FactureCreateDto dto) {
        Facture updated = repo.findById(id)
                .map(existing -> {
                    // on reconstruit l'entité à partir du DTO
                    Facture rebuilt = mapper.toEntity(dto);
                    rebuilt.setId(existing.getId());
                    return repo.save(rebuilt);
                })
                .orElseThrow(() -> new IllegalArgumentException("Facture introuvable id=" + id));
        return mapper.toDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Facture introuvable id=" + id);
        }
        repo.deleteById(id);
    }
}
