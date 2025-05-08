package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.FactureCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.FactureDto;

import java.util.List;
import java.util.Optional;

public interface FactureService {
    FactureDto create(FactureCreateDto dto);
    List<FactureDto> findAll();
    Optional<FactureDto> findById(Long id);
    Optional<FactureDto> findByReference(String reference);
    FactureDto update(Long id, FactureCreateDto dto);
    void delete(Long id);
    
    /**
     * Génère un PDF pour une facture spécifique
     * @param id L'ID de la facture
     * @return Le contenu du PDF sous forme de tableau de bytes
     * @throws IllegalArgumentException si la facture n'existe pas
     */
    byte[] generatePdf(Long id);
}
