package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import com.boulevardsecurity.securitymanagementapp.model.TarifMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TarifMissionRepository extends JpaRepository<TarifMission, Long> {
    Optional<TarifMission> findByTypeMission(TypeMission typeMission);

}

