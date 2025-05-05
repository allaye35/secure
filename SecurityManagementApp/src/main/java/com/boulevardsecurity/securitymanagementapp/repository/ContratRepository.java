package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    Optional<Contrat> findByReferenceContrat(String referenceContrat);
}
