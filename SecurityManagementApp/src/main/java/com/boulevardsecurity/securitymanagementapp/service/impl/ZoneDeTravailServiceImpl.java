// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/ZoneDeTravailServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeZone;
import com.boulevardsecurity.securitymanagementapp.dto.ZoneDeTravailCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ZoneDeTravailDto;
import com.boulevardsecurity.securitymanagementapp.mapper.ZoneDeTravailMapper;
import com.boulevardsecurity.securitymanagementapp.model.ZoneDeTravail;
import com.boulevardsecurity.securitymanagementapp.repository.ZoneDeTravailRepository;
import com.boulevardsecurity.securitymanagementapp.service.ZoneDeTravailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneDeTravailServiceImpl implements ZoneDeTravailService {

    private final ZoneDeTravailRepository repo;
    private final ZoneDeTravailMapper mapper;

    @Override
    public ZoneDeTravailDto createZone(ZoneDeTravailCreateDto createDto) {
        // vérification d’unicité
        if (repo.existsByNomAndTypeZone(createDto.getNom(), createDto.getTypeZone())) {
            throw new IllegalArgumentException("La zone existe déjà : " + createDto.getNom());
        }
        ZoneDeTravail ent = mapper.toEntity(createDto);
        ZoneDeTravail saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public List<ZoneDeTravailDto> getAllZones() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ZoneDeTravailDto> getZoneById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public List<ZoneDeTravailDto> searchZonesByName(String nom) {
        return repo.findByNomContainingIgnoreCase(nom).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ZoneDeTravailDto> searchZonesByType(TypeZone typeZone) {
        return repo.findByTypeZone(typeZone).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ZoneDeTravailDto updateZone(Long id, ZoneDeTravailCreateDto updateDto) {
        ZoneDeTravail ent = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Zone non trouvée id=" + id));
        mapper.updateEntity(updateDto, ent);
        ZoneDeTravail saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public void deleteZone(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Zone non trouvée id=" + id);
        }
        repo.deleteById(id);
    }
}
