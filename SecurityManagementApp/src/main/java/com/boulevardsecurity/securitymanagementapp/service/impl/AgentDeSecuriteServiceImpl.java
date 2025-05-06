// src/main/java/com/boulevardsecurity/securitymanagementapp/service/AgentDeSecuriteServiceImpl.java
package com.boulevardsecurity.securitymanagementapp.service.impl;

import com.boulevardsecurity.securitymanagementapp.Enums.Role;
import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.mapper.*;
import com.boulevardsecurity.securitymanagementapp.model.*;
import com.boulevardsecurity.securitymanagementapp.repository.*;
import com.boulevardsecurity.securitymanagementapp.service.AgentDeSecuriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentDeSecuriteServiceImpl implements AgentDeSecuriteService {

    private final AgentDeSecuriteRepository          agentRepo;
    private final ZoneDeTravailRepository             zoneRepo;
    private final DisponibiliteRepository             dispoRepo;
    private final CarteProfessionnelleRepository      carteRepo;

    private final AgentDeSecuriteMapper               agentMapper;
    private final DisponibiliteMapper                 dispoMapper;
    private final CarteProfessionnelleMapper          carteMapper;
    private final PlanningMapper                      planningMapper;
    private final DiplomeSsiapMapper diplomeSsiapMapper;
    private final DiplomeSSIAPRepository diplomeRepo;



    @Override
    public List<AgentDeSecuriteDto> getAllAgents() {
        return agentRepo.findAll().stream()
                .map(agentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<AgentDeSecuriteDto> getAgentById(Long id) {
        return agentRepo.findById(id)
                .map(agent -> {
                    agent.getMissions().size(); // forcer si lazy
                    return agentMapper.toDto(agent);
                });
    }

    @Override
    public Optional<AgentDeSecuriteDto> getAgentByEmail(String email) {
        return agentRepo.findByEmail(email)
                .map(agentMapper::toDto);
    }

    @Override
    public AgentDeSecuriteDto createAgent(AgentDeSecuriteCreationDto creationDto) {
        AgentDeSecurite ent = agentMapper.toEntity(creationDto);
        if (ent.getRole() == null) ent.setRole(Role.AGENT_SECURITE);
        AgentDeSecurite saved = agentRepo.save(ent);
        return agentMapper.toDto(saved);
    }

    @Override
    public AgentDeSecuriteDto updateAgent(Long id, AgentDeSecuriteCreationDto dto) {
        AgentDeSecurite ent = agentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : " + id));
        agentMapper.updateEntityFromCreationDto(dto, ent);
        return agentMapper.toDto(agentRepo.save(ent));
    }


    @Override
    public void deleteAgent(Long id) {
        if (!agentRepo.existsById(id)) {
            throw new RuntimeException("Agent non trouvé : "+id);
        }
        agentRepo.deleteById(id);
    }

    @Override
    public AgentDeSecuriteDto assignZoneDeTravail(Long agentId, Long zoneId) {
        AgentDeSecurite a = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : "+agentId));
        ZoneDeTravail z = zoneRepo.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Zone non trouvée : "+zoneId));
        a.getZonesDeTravail().add(z);
        return agentMapper.toDto(agentRepo.save(a));
    }

    @Override
    public DisponibiliteDto ajouterDisponibilite(Long agentId, DisponibiliteCreationDto dispoDto) {
        AgentDeSecurite a = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : "+agentId));
        Disponibilite d = dispoMapper.toEntity(dispoDto);
        d.setAgentDeSecurite(a);
        Disponibilite saved = dispoRepo.save(d);
        return dispoMapper.toDto(saved);
    }

    @Override
    public CarteProfessionnelleDto ajouterCarteProfessionnelle(Long agentId, CarteProfessionnelleCreationDto carteDto) {
        AgentDeSecurite a = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : "+agentId));
        CarteProfessionnelle c = carteMapper.toEntity(carteDto);
        c.setAgentDeSecurite(a);
        CarteProfessionnelle saved = carteRepo.save(c);
        return carteMapper.toDto(saved);
    }

    @Override
    public AgentDeSecuriteDto changeRole(Long agentId, Role newRole) {
        AgentDeSecurite a = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : "+agentId));
        a.setRole(newRole);
        return agentMapper.toDto(agentRepo.save(a));
    }

    @Override
    public Optional<PlanningDto> getPlanningByAgentId(Long agentId) {
        return agentRepo
                .findFirstByMissions_Agents_IdOrderByMissions_DateDebutDesc(agentId)
                .map(planningMapper::toDto);
    }

    @Override
    public AgentDeSecuriteDto assignDisponibiliteExistante(Long agentId, Long disponibiliteId) {
        AgentDeSecurite agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : " + agentId));

        Disponibilite disponibilite = dispoRepo.findById(disponibiliteId)
                .orElseThrow(() -> new RuntimeException("Disponibilité non trouvée : " + disponibiliteId));

        disponibilite.setAgentDeSecurite(agent); // affecter l'agent
        dispoRepo.save(disponibilite);

        return agentMapper.toDto(agent);
    }
    @Override
    public DiplomeSsiapDto ajouterDiplomeSSIAP(Long agentId, DiplomeSsiapCreationDto diplomeDto) {
        AgentDeSecurite agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : " + agentId));

        DiplomeSSIAP diplome = diplomeSsiapMapper.toEntity(diplomeDto);
        diplome.setAgentDeSecurite(agent); // Lier l'agent au diplôme

        DiplomeSSIAP saved = diplomeRepo.save(diplome);
        return diplomeSsiapMapper.toDto(saved);
    }
    @Override
    public AgentDeSecuriteDto assignCarteExistante(Long agentId, Long carteId) {
        AgentDeSecurite agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : " + agentId));

        CarteProfessionnelle carte = carteRepo.findById(carteId)
                .orElseThrow(() -> new RuntimeException("Carte non trouvée : " + carteId));

        carte.setAgentDeSecurite(agent);
        carteRepo.save(carte);

        return agentMapper.toDto(agent);
    }

    @Override
    public AgentDeSecuriteDto assignDiplomeExistante(Long agentId, Long diplomeId) {
        AgentDeSecurite agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : " + agentId));

        DiplomeSSIAP diplome = diplomeRepo.findById(diplomeId)
                .orElseThrow(() -> new RuntimeException("Diplôme non trouvé : " + diplomeId));

        diplome.setAgentDeSecurite(agent);
        diplomeRepo.save(diplome);

        return agentMapper.toDto(agent);
    }

    @Override
    public List<AgentDeSecuriteDto> getAgentsByZoneId(Long zoneId) {
        // Vérifier si la zone existe
        ZoneDeTravail zone = zoneRepo.findById(zoneId)
                .orElseThrow(() -> new IllegalArgumentException("Zone non trouvée : " + zoneId));
        
        // Récupérer tous les agents associés à cette zone
        List<AgentDeSecurite> agents = agentRepo.findByZonesDeTravail(zone);
        
        // Convertir les entités en DTOs
        return agents.stream()
                .map(agentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public AgentDeSecuriteDto removeFromZoneDeTravail(Long agentId, Long zoneId) {
        AgentDeSecurite agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé : " + agentId));
        
        ZoneDeTravail zone = zoneRepo.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Zone non trouvée : " + zoneId));
        
        // Retirer la zone spécifique de la liste des zones de l'agent
        agent.getZonesDeTravail().remove(zone);
        
        // Sauvegarder l'agent mis à jour
        agent = agentRepo.save(agent);
        
        return agentMapper.toDto(agent);
    }

}
