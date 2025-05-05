package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.LigneCotisation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LigneCotisationRepository extends JpaRepository<LigneCotisation, Long> {
    List<LigneCotisation> findByFicheDePaie_IdOrderById(Long ficheDePaieId);

}
