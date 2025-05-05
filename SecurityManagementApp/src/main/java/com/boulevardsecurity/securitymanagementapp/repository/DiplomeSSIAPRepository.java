package com.boulevardsecurity.securitymanagementapp.repository;
import com.boulevardsecurity.securitymanagementapp.model.DiplomeSSIAP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiplomeSSIAPRepository extends JpaRepository<DiplomeSSIAP, Long> {

    List<DiplomeSSIAP> findByAgentDeSecuriteId(Long agentId);  // Récupérer tous les diplômes d'un agent
}

