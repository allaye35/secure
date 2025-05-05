package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.FicheDePaie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FicheDePaieRepository extends JpaRepository<FicheDePaie, Long> {
}
