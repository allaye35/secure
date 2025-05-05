package com.boulevardsecurity.securitymanagementapp.repository;


import com.boulevardsecurity.securitymanagementapp.model.Devis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DevisRepository extends JpaRepository<Devis, Long> {
    Optional<Devis> findByReferenceDevis(String referenceDevis);


}
