package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.dto.SiteCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.SiteDto;
import com.boulevardsecurity.securitymanagementapp.mapper.SiteMapper;
import com.boulevardsecurity.securitymanagementapp.model.Site;
import com.boulevardsecurity.securitymanagementapp.repository.SiteRepository;
import com.boulevardsecurity.securitymanagementapp.service.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteServiceImpl implements SiteService {

    private final SiteRepository siteRepository;
    private final SiteMapper siteMapper;

    @Override
    public List<SiteDto> getAllSites() {
        return siteRepository.findAll().stream()
                .map(siteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<SiteDto> getSiteById(Long id) {
        return siteRepository.findById(id)
                .map(siteMapper::toDto);
    }

    @Override
    public SiteDto createSite(SiteCreateDto dto) {
        Site entity = siteMapper.toEntity(dto);
        Site saved = siteRepository.save(entity);
        return siteMapper.toDto(saved);
    }

    @Override
    public SiteDto updateSite(Long id, SiteCreateDto dto) {
        Site existing = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site non trouvé pour l'ID : " + id));
        siteMapper.updateEntity(existing, dto);
        Site saved = siteRepository.save(existing);
        return siteMapper.toDto(saved);
    }

    @Override
    public void deleteSite(Long id) {
        if (!siteRepository.existsById(id)) {
            throw new RuntimeException("Site non trouvé pour l'ID : " + id);
        }
        siteRepository.deleteById(id);
    }
}
