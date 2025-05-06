package com.boulevardsecurity.securitymanagementapp.repository;


import com.boulevardsecurity.securitymanagementapp.model.AgentDeSecurite;
import com.boulevardsecurity.securitymanagementapp.model.Planning;
import com.boulevardsecurity.securitymanagementapp.model.ZoneDeTravail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentDeSecuriteRepository extends JpaRepository<AgentDeSecurite, Long> {

    // ✅ Méthode JPA pour trouver le Planning via Mission
    Optional<Planning> findFirstByMissions_Agents_IdOrderByMissions_DateDebutDesc(Long agentId);
    Optional<AgentDeSecurite> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Méthode pour récupérer les agents travaillant dans une zone spécifique
    List<AgentDeSecurite> findByZonesDeTravail(ZoneDeTravail zone);
    
    // Alternative avec ID de zone si nécessaire
    List<AgentDeSecurite> findByZonesDeTravail_Id(Long zoneId);
}
