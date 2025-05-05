package com.boulevardsecurity.securitymanagementapp.repository;
import com.boulevardsecurity.securitymanagementapp.model.ZoneDeTravail;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZoneDeTravailRepository extends JpaRepository<ZoneDeTravail, Long> {

    List<ZoneDeTravail> findByNomContainingIgnoreCase(String nom);  // Recherche par nom

    List<ZoneDeTravail> findByTypeZone(TypeZone typeZone);  // Recherche par type de zone

    boolean existsByNomAndTypeZone(String nom, TypeZone typeZone);  // Vérifie si une zone existe déjà
    Optional<ZoneDeTravail> findById(Long id);
}
