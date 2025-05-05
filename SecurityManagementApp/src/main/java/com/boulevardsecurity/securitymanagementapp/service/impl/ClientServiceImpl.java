// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/ClientServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.ClientCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ClientDto;
import com.boulevardsecurity.securitymanagementapp.mapper.ClientMapper;
import com.boulevardsecurity.securitymanagementapp.model.Client;
import com.boulevardsecurity.securitymanagementapp.repository.ClientRepository;
import com.boulevardsecurity.securitymanagementapp.service.ClientService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository repo;
    private final ClientMapper    mapper;

    @Override
    public ClientDto createClient(ClientCreateDto dto) {
        // conversion DTO ➜ ENTITÉ (on conserve le mot de passe tel quel)
        Client ent = mapper.toEntity(dto);
        Client saved = repo.save(ent);
        return mapper.toDto(saved);
    }

    @Override
    public List<ClientDto> getAllClients() {
        return repo.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ClientDto> getClientById(Long id) {
        return repo.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public Optional<ClientDto> getClientByEmail(String email) {
        return repo.findByEmail(email)
                .map(mapper::toDto);
    }

    @Override
    public Optional<ClientDto> getClientByNom(String nom) {
        return repo.findByNom(nom)
                .map(mapper::toDto);
    }

    @Override
    public ClientDto updateClient(Long id, ClientDto dto) {
        Client existing = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client introuvable : " + id));
        // mise à jour des champs (hors mot de passe)
        mapper.updateEntityFromDto(dto, existing);
        Client saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void deleteClient(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Client introuvable : " + id);
        }
        repo.deleteById(id);
    }
}
