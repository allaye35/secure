package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.mapper.ContratMapper;
import com.boulevardsecurity.securitymanagementapp.model.*;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import com.boulevardsecurity.securitymanagementapp.service.ContratService;
import com.boulevardsecurity.securitymanagementapp.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
@Transactional
public class ContratServiceImpl implements ContratService {

    private final ContratRepository         contratRepo;
    private final DevisRepository           devisRepo;
    private final MissionRepository         missionRepo;
    private final ArticleContratRepository  articleRepo;
    private final ContratMapper             mapper;
    private final FileStorageService        storage;

    /* ---------- CREATE ---------- */
    @Override
    public ContratDto createContrat(ContratCreateDto dto, MultipartFile pdf) {        /* Récupère le Devis et crée l'entité Contrat */
        Contrat c = mapper.toEntity(dto);

        /* Upload PDF */
        if (pdf != null && !pdf.isEmpty()) {
            try { c.setPdfPath(storage.store(pdf, c.getReferenceContrat())); }
            catch (IOException e) { throw new RuntimeException("Upload PDF KO", e); }
        }

        /* Relations */
        if (dto.getMissionIds() != null)
            c.setMissions(dto.getMissionIds().stream()
                    .map(id -> missionRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Mission id=" + id + " introuvable")))
                    .peek(m -> m.setContrat(c))
                    .collect(Collectors.toList()));

        if (dto.getArticleIds() != null)
            c.setArticles(dto.getArticleIds().stream()
                    .map(id -> articleRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Article id=" + id + " introuvable")))
                    .peek(a -> a.setContrat(c))
                    .collect(Collectors.toList()));

        return mapper.toDto(contratRepo.save(c));
    }

    /* ---------- UPDATE ---------- */
    @Override
    public ContratDto updateContrat(Long id, ContratCreateDto dto, MultipartFile pdf) {

        Contrat existing = contratRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Contrat introuvable id=" + id));

        mapper.updateEntity(existing, dto);

        if (pdf != null && !pdf.isEmpty()) {
            try { existing.setPdfPath(storage.store(pdf, existing.getReferenceContrat())); }
            catch (IOException e) { throw new RuntimeException("Upload PDF KO", e); }
        }

        return mapper.toDto(contratRepo.save(existing));
    }

    /* ---------- READ / DELETE ---------- */
    @Override public List<ContratDto> getAllContrats() {
        return contratRepo.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }
    @Override public java.util.Optional<ContratDto> getContratById(Long id) {
        return contratRepo.findById(id).map(mapper::toDto);
    }
    @Override public java.util.Optional<ContratDto> getContratByReference(String ref) {
        return contratRepo.findByReferenceContrat(ref).map(mapper::toDto);
    }
    @Override public void deleteContrat(Long id) {
        if (!contratRepo.existsById(id))
            throw new IllegalArgumentException("Contrat introuvable id=" + id);
        contratRepo.deleteById(id);
    }
}
