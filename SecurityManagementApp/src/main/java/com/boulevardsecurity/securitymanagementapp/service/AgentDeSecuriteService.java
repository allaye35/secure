package com.boulevardsecurity.securitymanagementapp.service;


import com.boulevardsecurity.securitymanagementapp.Enums.Role;
import com.boulevardsecurity.securitymanagementapp.dto.*;
import java.util.List;
import java.util.Optional;

public interface AgentDeSecuriteService {

    List<AgentDeSecuriteDto> getAllAgents();

    Optional<AgentDeSecuriteDto> getAgentById(Long id);

    Optional<AgentDeSecuriteDto> getAgentByEmail(String email);

    AgentDeSecuriteDto createAgent(AgentDeSecuriteCreationDto creationDto);

    AgentDeSecuriteDto updateAgent(Long id, AgentDeSecuriteCreationDto updateDto);

    void deleteAgent(Long id);

    AgentDeSecuriteDto assignZoneDeTravail(Long agentId, Long zoneId);

    DisponibiliteDto ajouterDisponibilite(Long agentId, DisponibiliteCreationDto dispoDto);

    CarteProfessionnelleDto ajouterCarteProfessionnelle(Long agentId, CarteProfessionnelleCreationDto carteDto);

    AgentDeSecuriteDto changeRole(Long agentId, Role newRole);

    Optional<PlanningDto> getPlanningByAgentId(Long agentId);

    public AgentDeSecuriteDto assignDisponibiliteExistante(Long agentId, Long disponibiliteId);

    DiplomeSsiapDto ajouterDiplomeSSIAP(Long agentId, DiplomeSsiapCreationDto diplomeDto);

    public AgentDeSecuriteDto assignCarteExistante(Long agentId, Long carteId);

    public AgentDeSecuriteDto assignDiplomeExistante(Long agentId, Long diplomeId);


}

