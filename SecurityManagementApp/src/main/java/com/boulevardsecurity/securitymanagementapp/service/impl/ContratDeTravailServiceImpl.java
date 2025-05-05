// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/ContratDeTravailServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailCreationDto;
import com.boulevardsecurity.securitymanagementapp.dto.ContratDeTravailDto;
import com.boulevardsecurity.securitymanagementapp.mapper.ContratDeTravailMapper;
import com.boulevardsecurity.securitymanagementapp.model.ContratDeTravail;
import com.boulevardsecurity.securitymanagementapp.repository.ContratDeTravailRepository;
import com.boulevardsecurity.securitymanagementapp.service.ContratDeTravailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContratDeTravailServiceImpl implements ContratDeTravailService {

    private final ContratDeTravailRepository repo;
    private final ContratDeTravailMapper mapper;

    @Override
    public List<ContratDeTravailDto> getAllContrats() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ContratDeTravailDto> getContratById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public ContratDeTravailDto createContrat(ContratDeTravailCreationDto dto) {
        ContratDeTravail ent = mapper.toEntity(dto);
        ContratDeTravail saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public ContratDeTravailDto updateContrat(Long id, ContratDeTravailCreationDto dto) {
        ContratDeTravail existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Contrat introuvable id=" + id));
        mapper.updateEntityFromDto(dto, existing);
        ContratDeTravail saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void deleteContrat(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Contrat introuvable id=" + id);
        }
        repo.deleteById(id);
    }

    @Override
    public boolean prolongerContrat(Long id, LocalDate nouvelleDateFin) {
        return repo.findById(id).map(ent -> {
            if (nouvelleDateFin.isBefore(ent.getDateDebut())) {
                throw new IllegalArgumentException("La nouvelle date de fin doit être postérieure à la date de début");
            }
            ent.setDateFin(nouvelleDateFin);
            repo.save(ent);
            return true;
        }).orElse(false);
    }

    @Override
    public List<ContratDeTravailDto> getContratsByAgentId(Long agentId) {
        return repo.findByAgentDeSecuriteId(agentId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}
