package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.Planning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlanningRepository extends JpaRepository<Planning, Long> {

    // 🔹 Récupérer les plannings créés entre deux dates (filtre par semaine ou mois)
    List<Planning> findByDateCreationBetween(LocalDateTime dateDebut, LocalDateTime dateFin);

    // 🔹 Trouver les plannings liés à une mission précise
    List<Planning> findByMissions_Id(Long missionId);

    // 🔹 Récupérer les plannings d’un agent via ses missions
    List<Planning> findByMissions_Agents_Id(Long agentId);


}
