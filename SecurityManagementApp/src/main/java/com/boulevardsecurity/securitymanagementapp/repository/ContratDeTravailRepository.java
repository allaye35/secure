package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.ContratDeTravail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContratDeTravailRepository extends JpaRepository<ContratDeTravail, Long> {
    List<ContratDeTravail> findByAgentDeSecuriteId(Long agentId);
}
