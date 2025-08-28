// src/main/java/com/boulevardsecurity/securitymanagementapp/service/impl/DevisServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.DevisCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.DevisDto;
import com.boulevardsecurity.securitymanagementapp.mapper.DevisMapper;
import com.boulevardsecurity.securitymanagementapp.model.Devis;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.repository.DevisRepository;
import com.boulevardsecurity.securitymanagementapp.repository.MissionRepository;
import com.boulevardsecurity.securitymanagementapp.service.DevisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class DevisServiceImpl implements DevisService {

    private final DevisRepository repo;
    private final DevisMapper mapper;
    private final MissionRepository missionRepo;

    @Override
    public List<DevisDto> getAll() {
        return repo.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    public Optional<DevisDto> getById(Long id) {
        return repo.findById(id).map(mapper::toDto);
    }

    @Override
    public Optional<DevisDto> getByReference(String reference) {
        return repo.findByReferenceDevis(reference).map(mapper::toDto);
    }

    @Override
@Transactional
public DevisDto create(DevisCreateDto dto) {

    // 1) Charger/valider les missions si fournies
    List<Mission> missions = Collections.emptyList();
    if (dto.getMissionIds() != null && !dto.getMissionIds().isEmpty()) {
        missions = missionRepo.findAllById(dto.getMissionIds());
        if (missions.size() != dto.getMissionIds().size()) {
            throw new IllegalArgumentException("Certaines missions sont introuvables");
        }
        for (Mission m : missions) {
            if (m.getDevis() != null) {
                throw new IllegalArgumentException("La mission id=" + m.getId() + " est déjà rattachée à un devis");
            }
        }
    }

    // 2) Construire le devis (sans l'enregistrer encore)
    Devis devis = mapper.toEntity(dto); // idéalement sans attacher de missions dans le mapper

    // 3) Enregistrer le devis
    Devis saved = repo.save(devis);

    // 4) Attacher les missions validées
    if (!missions.isEmpty()) {
        for (Mission m : missions) {
            m.setDevis(saved);
        }
        missionRepo.saveAll(missions);
    }

    // 5) Recalculer les totaux et sauvegarder
    saved.recalculerTotaux();
    return mapper.toDto(repo.save(saved));
}

    @Override
    public DevisDto update(Long id, DevisCreateDto dto) {
        Devis existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Devis introuvable id=" + id));

        mapper.updateFromCreateDto(dto, existing);

        // Si missionIds est fourni dans dto, on synchronise l’association
        if (dto.getMissionIds() != null) {
            Set<Long> newIds = new HashSet<>(dto.getMissionIds());

            // détacher les missions qui n'y sont plus
            List<Mission> currently = missionRepo.findAll().stream()
                    .filter(m -> m.getDevis() != null && m.getDevis().getId().equals(existing.getId()))
                    .toList();
            for (Mission m : currently) {
                if (!newIds.contains(m.getId())) {
                    m.setDevis(null);
                }
            }
            missionRepo.saveAll(currently);

            // attacher les nouvelles
            List<Mission> toAttach = missionRepo.findAllById(newIds);
            for (Mission m : toAttach) {
                if (m.getDevis() != null && !m.getDevis().getId().equals(existing.getId())) {
                    throw new IllegalArgumentException("La mission id=" + m.getId() + " est déjà liée à un autre devis");
                }
                m.setDevis(existing);
            }
            missionRepo.saveAll(toAttach);

            // maintenir la collection côté devis (si elle existe)
            if (existing.getMissions() != null) {
                existing.getMissions().clear();
                existing.getMissions().addAll(toAttach);
            }
        }

        existing.recalculerTotaux();
        Devis saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public DevisDto ajouterMissions(Long devisId, List<Long> missionIds) {
        Devis devis = repo.findById(devisId)
                .orElseThrow(() -> new IllegalArgumentException("Devis introuvable id=" + devisId));

        if (missionIds == null || missionIds.isEmpty()) {
            throw new IllegalArgumentException("La liste des missions est vide");
        }

        List<Mission> missions = missionRepo.findAllById(missionIds);
        if (missions.size() != missionIds.size()) {
            throw new IllegalArgumentException("Certaines missions sont introuvables");
        }

        for (Mission m : missions) {
            if (m.getDevis() != null && !m.getDevis().getId().equals(devis.getId())) {
                throw new IllegalArgumentException("La mission id=" + m.getId() + " est déjà liée à un autre devis");
            }
            m.setDevis(devis);
        }
        missionRepo.saveAll(missions);

        if (devis.getMissions() != null) {
            Set<Long> exist = devis.getMissions().stream().map(Mission::getId).collect(Collectors.toSet());
            missions.stream().filter(m -> !exist.contains(m.getId())).forEach(devis.getMissions()::add);
        }

        devis.recalculerTotaux();
        Devis saved = repo.save(devis);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Devis introuvable id=" + id);
        }
        repo.deleteById(id);
    }

    @Override
    public List<DevisDto> getDevisDisponibles() {
        // devis sans contrat associé
        return repo.findAll().stream()
                .filter(devis -> devis.getContrat() == null)
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    
}
