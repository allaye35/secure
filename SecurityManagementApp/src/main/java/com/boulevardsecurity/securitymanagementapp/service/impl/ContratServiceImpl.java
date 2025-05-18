package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.mapper.ContratMapper;
import com.boulevardsecurity.securitymanagementapp.model.*;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import com.boulevardsecurity.securitymanagementapp.service.ContratService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContratServiceImpl implements ContratService {

    private final ContratRepository         contratRepo;
    private final DevisRepository           devisRepo;
    private final MissionRepository         missionRepo;
    private final ArticleContratRepository  articleRepo;
    private final ContratMapper             mapper;    /* ---------- CREATE ---------- */
    @Override
    public ContratDto createContrat(ContratCreateDto dto) {
        /* Crée l'entité Contrat avec ou sans Devis */
        Contrat c = mapper.toEntity(dto);

        /* Relations - toutes optionnelles */
        if (dto.getMissionIds() != null && !dto.getMissionIds().isEmpty()) {
            c.setMissions(dto.getMissionIds().stream()
                    .map(id -> missionRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Mission id=" + id + " introuvable")))
                    .peek(m -> m.setContrat(c))
                    .collect(Collectors.toList()));
        }

        if (dto.getArticleIds() != null && !dto.getArticleIds().isEmpty()) {
            c.setArticles(dto.getArticleIds().stream()
                    .map(id -> articleRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Article id=" + id + " introuvable")))
                    .peek(a -> a.setContrat(c))
                    .collect(Collectors.toList()));
        }

        return mapper.toDto(contratRepo.save(c));
    }

    /* ---------- UPDATE ---------- */
    @Override
    public ContratDto updateContrat(Long id, ContratCreateDto dto) {
        Contrat existing = contratRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Contrat introuvable id=" + id));

        mapper.updateEntity(existing, dto);
        
        return mapper.toDto(contratRepo.save(existing));
    }

    /* ---------- READ ---------- */
    @Override 
    public List<ContratDto> getAllContrats() {
        return contratRepo.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }
    
    @Override 
    public java.util.Optional<ContratDto> getContratById(Long id) {
        return contratRepo.findById(id).map(mapper::toDto);
    }
    
    @Override 
    public java.util.Optional<ContratDto> getContratByReference(String ref) {
        return contratRepo.findByReferenceContrat(ref).map(mapper::toDto);
    }
    
    @Override
    public java.util.Optional<ContratDto> getContratByDevisId(Long devisId) {
        return contratRepo.findByDevisId(devisId).map(mapper::toDto);
    }
    
    /* ---------- DELETE ---------- */
    @Override 
    public void deleteContrat(Long id) {
        if (!contratRepo.existsById(id))
            throw new IllegalArgumentException("Contrat introuvable id=" + id);
        contratRepo.deleteById(id);
    }
}

