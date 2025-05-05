package com.boulevardsecurity.securitymanagementapp.repository;


import com.boulevardsecurity.securitymanagementapp.model.AgentDeSecurite;
import com.boulevardsecurity.securitymanagementapp.model.Planning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentDeSecuriteRepository extends JpaRepository<AgentDeSecurite, Long> {

    // ✅ Méthode JPA pour trouver le Planning via Mission
    Optional<Planning> findFirstByMissions_Agents_IdOrderByMissions_DateDebutDesc(Long agentId);
    Optional<AgentDeSecurite> findByEmail(String email);
    boolean existsByEmail(String email);

}
