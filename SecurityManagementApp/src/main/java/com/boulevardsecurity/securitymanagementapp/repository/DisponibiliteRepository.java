package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.Client;
import com.boulevardsecurity.securitymanagementapp.model.Disponibilite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {

    List<Disponibilite> findByAgentDeSecuriteId(Long agentId);

}
